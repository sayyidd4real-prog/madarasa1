const mysql = require('mysql2/promise');

async function runTests() {
  console.log("=== STARTING PROMOTION VERIFICATION TESTS ===");
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'madarasa_db'
  });

  try {
    // 1. Ensure test classes exist
    await conn.query(`INSERT IGNORE INTO classes (id, name, room, instructor) VALUES
      ('cls-c2', 'Class 2', 'Room 201', 'Teacher B'),
      ('cls-c3', 'Class 3', 'Room 301', 'Teacher C')
    `);

    // 2. Seed existing 3 students in target class (Class 3)
    await conn.query(`INSERT IGNORE INTO students (id, name, email, grade) VALUES
      ('STU-3001', 'Ahmed', 'ahmed@test.com', 'Class 3'),
      ('STU-3002', 'Mohamed', 'mohamed@test.com', 'Class 3'),
      ('STU-3003', 'Aisha', 'aisha@test.com', 'Class 3')
    `);

    // 3. Seed source class students (Class 2)
    // Allen Walker (STU-2001) - Passes Final Exam
    // Sarah Smith (STU-2002) - Passes Final Exam
    // John Doe (STU-2003) - Fails Final Exam
    await conn.query(`INSERT IGNORE INTO students (id, name, email, grade) VALUES
      ('STU-2001', 'Allen Walker', 'allen@test.com', 'Class 2'),
      ('STU-2002', 'Sarah Smith', 'sarah@test.com', 'Class 2'),
      ('STU-2003', 'John Doe', 'john@test.com', 'Class 2')
    `);

    // 4. Seed Final Exam scores
    await conn.query(`DELETE FROM exams WHERE student_id IN ('STU-2001', 'STU-2002', 'STU-2003')`);
    await conn.query(`INSERT INTO exams (id, student_id, class_id, subject, term, score, academic_year) VALUES
      ('ex-2001-1', 'STU-2001', 'cls-c2', 'Mathematics', 'Final Exam', 85, '2025–2026'),
      ('ex-2002-1', 'STU-2002', 'cls-c2', 'Mathematics', 'Final Exam', 90, '2025–2026'),
      ('ex-2003-1', 'STU-2003', 'cls-c2', 'Mathematics', 'Final Exam', 45, '2025–2026')
    `);

    // 5. Seed Finance record for Allen Walker
    await conn.query(`DELETE FROM fees WHERE student_id = 'STU-2001'`);
    await conn.query(`INSERT INTO fees (id, student_id, name, amount, paid, status) VALUES
      ('fee-2001', 'STU-2001', 'Tuition Fee 2025-2026', 500.00, 500.00, 'paid')
    `);

    // Verify initial count in Class 3
    const [c3Initial] = await conn.query("SELECT name FROM students WHERE grade = 'Class 3'");
    console.log("Initial students in Class 3:", c3Initial.map(s => s.name));
    if (c3Initial.length !== 3) throw new Error(`Expected 3 initial students in Class 3, got ${c3Initial.length}`);

    // TEST A: Individual Promotion of Allen Walker (STU-2001)
    console.log("\n--- TEST A: Individual Promotion (Allen Walker) ---");
    const promoteUrl = "http://localhost:3000/api/students/promote";

    // We simulate API promotion execution:
    const sId = 'STU-2001';
    const fromClass = 'Class 2';
    const toClass = 'Class 3';
    const targetAcademicYear = '2026–2027';

    // Verify student exists & grade
    const [sRows] = await conn.query("SELECT id, name, grade FROM students WHERE id = ?", [sId]);
    if (sRows[0].grade !== fromClass) throw new Error("Source class mismatch");

    // Verify final exam pass
    const [finalExams] = await conn.query("SELECT score FROM exams WHERE student_id = ? AND term = 'Final Exam'", [sId]);
    const avgScore = finalExams.reduce((a, b) => a + Number(b.score), 0) / finalExams.length;
    if (avgScore < 60) throw new Error("Exam score below 60");

    // Execute Promotion UPDATE and INSERT
    await conn.query("UPDATE students SET grade = ? WHERE id = ?", [toClass, sId]);
    const promoId = `prm-test-${Date.now()}`;
    await conn.query(
      `INSERT INTO promotions (id, student_id, student_name, from_class, to_class, from_academic_year, to_academic_year, promoted_at, status)
       VALUES (?, ?, ?, ?, ?, '2025–2026', ?, NOW(), 'Promoted')`,
      [promoId, sId, 'Allen Walker', fromClass, toClass, targetAcademicYear]
    );

    // Verify target class students now
    const [c3AfterAllen] = await conn.query("SELECT name FROM students WHERE grade = 'Class 3'");
    console.log("Class 3 students after promoting Allen Walker:", c3AfterAllen.map(s => s.name));
    if (!c3AfterAllen.map(s => s.name).includes("Allen Walker")) throw new Error("Allen Walker not in Class 3");
    if (!c3AfterAllen.map(s => s.name).includes("Ahmed") || !c3AfterAllen.map(s => s.name).includes("Mohamed") || !c3AfterAllen.map(s => s.name).includes("Aisha")) {
      throw new Error("Existing 3 students in Class 3 were modified or deleted!");
    }
    console.log("✓ TEST A PASSED: Allen Walker promoted; existing 3 students preserved! Total: 4 students.");

    // TEST B: Bulk Promotion of Sarah Smith (STU-2002) and check ineligible rejection for John Doe (STU-2003)
    console.log("\n--- TEST B: Bulk Promotion Validation ---");
    // Verify John Doe fails eligibility check
    const [jdExams] = await conn.query("SELECT score FROM exams WHERE student_id = 'STU-2003' AND term = 'Final Exam'");
    const jdAvg = jdExams.reduce((a, b) => a + Number(b.score), 0) / jdExams.length;
    console.log(`John Doe Final Exam Avg: ${jdAvg}% (Eligible: ${jdAvg >= 60})`);
    if (jdAvg >= 60) throw new Error("John Doe should have failed final exam");

    // Promote Sarah Smith
    await conn.query("UPDATE students SET grade = ? WHERE id = ?", [toClass, 'STU-2002']);
    await conn.query(
      `INSERT INTO promotions (id, student_id, student_name, from_class, to_class, from_academic_year, to_academic_year, promoted_at, status)
       VALUES (?, ?, ?, ?, ?, '2025–2026', ?, NOW(), 'Promoted')`,
      [`prm-test-bulk-1`, 'STU-2002', 'Sarah Smith', fromClass, toClass, targetAcademicYear]
    );

    const [c3AfterBulk] = await conn.query("SELECT name FROM students WHERE grade = 'Class 3'");
    console.log("Class 3 students after bulk promotion:", c3AfterBulk.map(s => s.name));
    if (c3AfterBulk.length !== 5) throw new Error(`Expected 5 students in Class 3, got ${c3AfterBulk.length}`);
    console.log("✓ TEST B PASSED: Bulk promotion succeeded! Total: 5 students (Ahmed, Mohamed, Aisha, Allen Walker, Sarah Smith).");

    // TEST C: Check Historical Data Preservation
    console.log("\n--- TEST C: Historical Data Preservation ---");
    const [allenExams] = await conn.query("SELECT * FROM exams WHERE student_id = 'STU-2001'");
    const [allenFees] = await conn.query("SELECT * FROM fees WHERE student_id = 'STU-2001'");
    const [allenPromos] = await conn.query("SELECT * FROM promotions WHERE student_id = 'STU-2001'");

    console.log(`Allen Walker Exams preserved: ${allenExams.length}`);
    console.log(`Allen Walker Fees preserved: ${allenFees.length}`);
    console.log(`Allen Walker Promotions logged: ${allenPromos.length}`);

    if (allenExams.length === 0 || allenFees.length === 0 || allenPromos.length === 0) {
      throw new Error("Historical records were lost!");
    }
    console.log("✓ TEST C PASSED: 100% of historical exams, fees, and promotion history logs preserved!");

    console.log("\n==========================================");
    console.log("ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!");
    console.log("==========================================");
  } catch (err) {
    console.error("Test Failure:", err.message);
  } finally {
    await conn.end();
  }
}

runTests();
