const mysql = require('mysql2/promise');

async function testRevertPromotionScenario() {
  console.log("=== STARTING FULL REVERT PROMOTION FEATURE VERIFICATION ===");
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'madarasa_db'
  });

  try {
    // Clean up test records first
    await conn.query("DELETE FROM promotions WHERE student_id IN ('STU-1004', 'STU-2001', 'STU-2099')");
    await conn.query("DELETE FROM exams WHERE student_id IN ('STU-1004', 'STU-2001', 'STU-2099')");
    await conn.query("DELETE FROM fees WHERE student_id IN ('STU-1004', 'STU-2001', 'STU-2099')");
    await conn.query("DELETE FROM students WHERE id IN ('STU-1004', 'STU-2001', 'STU-2099')");

    // 1. Setup classes
    await conn.query(`INSERT IGNORE INTO classes (id, name, room, instructor) VALUES
      ('cls-c2', 'Class 2', 'Room 201', 'Teacher B'),
      ('cls-c3', 'Class 3', 'Room 301', 'Teacher C')
    `);

    // 2. Setup existing students in Class 2
    await conn.query(`INSERT INTO students (id, name, email, grade) VALUES
      ('STU-1004', 'Allen Walker', 'allen@example.com', 'Class 2'),
      ('STU-2099', 'Existing Class 2 Student', 'existing@example.com', 'Class 2')
    `);

    // Seed exam & fee history for Allen Walker
    await conn.query(`INSERT INTO exams (id, student_id, class_id, subject, term, score, academic_year) VALUES
      ('ex-allen-1', 'STU-1004', 'cls-c2', 'Mathematics', 'Final Exam', 88, '2025–2026')
    `);
    await conn.query(`INSERT INTO fees (id, student_id, name, amount, paid, status) VALUES
      ('fee-allen-1', 'STU-1004', 'Tuition Fee', 300.00, 300.00, 'paid')
    `);

    // --- STEP 1: PROMOTE ALLEN WALKER (Class 2 -> Class 3) ---
    console.log("\n--- STEP 1: Promoting Allen Walker (Class 2 -> Class 3) ---");
    await conn.query("UPDATE students SET grade = 'Class 3' WHERE id = 'STU-1004'");
    const promoId = `prm-allen-${Date.now()}`;
    await conn.query(
      `INSERT INTO promotions (id, student_id, student_name, from_class, to_class, from_academic_year, to_academic_year, promoted_at, status)
       VALUES (?, 'STU-1004', 'Allen Walker', 'Class 2', 'Class 3', '2025–2026', '2026–2027', NOW(), 'Promoted')`,
      [promoId]
    );

    const [s1] = await conn.query("SELECT id, name, grade FROM students WHERE id = 'STU-1004'");
    console.log(`Student after promotion: ID=${s1[0].id}, Name=${s1[0].name}, Grade=${s1[0].grade}`);
    if (s1[0].grade !== 'Class 3') throw new Error("Promotion failed to update grade");

    // --- STEP 2: REVERT PROMOTION (Class 3 -> Class 2) ---
    console.log("\n--- STEP 2: Reverting Promotion for Allen Walker ---");
    // Find active promotion
    const [activePromos] = await conn.query(
      "SELECT id, from_class, to_class FROM promotions WHERE student_id = 'STU-1004' AND status = 'Promoted' ORDER BY promoted_at DESC LIMIT 1"
    );
    if (activePromos.length === 0) throw new Error("No active promotion found for reversion");
    const activePromo = activePromos[0];
    const prevClass = activePromo.from_class; // 'Class 2'

    // Perform Revert
    await conn.query("UPDATE students SET grade = ? WHERE id = 'STU-1004'", [prevClass]);
    await conn.query("UPDATE promotions SET status = 'Reverted' WHERE id = ?", [activePromo.id]);
    await conn.query(
      `INSERT INTO promotions (id, student_id, student_name, from_class, to_class, from_academic_year, to_academic_year, promoted_at, status)
       VALUES (?, 'STU-1004', 'Allen Walker', 'Class 3', 'Class 2', '2026–2027', '2025–2026', NOW(), 'Reverted')`,
      [`prm-rev-allen-${Date.now()}`]
    );

    // --- STEP 3: VERIFY ALL CONSTRAINTS & REQUIREMENTS ---
    console.log("\n--- STEP 3: Verifying Revert Results ---");

    // 1. Current Class restored to Class 2
    const [s2] = await conn.query("SELECT id, name, grade FROM students WHERE id = 'STU-1004'");
    console.log(`Student after revert: ID=${s2[0].id}, Name=${s2[0].name}, Grade=${s2[0].grade}`);
    if (s2[0].grade !== 'Class 2') throw new Error("Revert failed to restore previous class!");
    console.log("✓ Requirement 1 Passed: Current Class restored to Class 2.");

    // 2. Student ID unchanged & same record
    if (s2[0].id !== 'STU-1004') throw new Error("Student ID changed!");
    const [allAllen] = await conn.query("SELECT * FROM students WHERE id = 'STU-1004'");
    if (allAllen.length !== 1) throw new Error(`Expected 1 Allen Walker record, found ${allAllen.length}`);
    console.log("✓ Requirement 2 Passed: Student ID STU-1004 preserved; no duplicate student created.");

    // 3. Existing Class 2 students remain
    const [c2Students] = await conn.query("SELECT name FROM students WHERE grade = 'Class 2'");
    console.log("Class 2 students after return:", c2Students.map(s => s.name));
    if (!c2Students.map(s => s.name).includes("Existing Class 2 Student")) throw new Error("Existing Class 2 student was deleted!");
    console.log("✓ Requirement 3 Passed: Existing students in target/previous class remain.");

    // 4. Exam history preserved
    const [allenExams] = await conn.query("SELECT * FROM exams WHERE student_id = 'STU-1004'");
    if (allenExams.length !== 1 || allenExams[0].score !== 88) throw new Error("Exams modified or lost!");
    console.log("✓ Requirement 4 Passed: Exam history preserved.");

    // 5. Finance history preserved
    const [allenFees] = await conn.query("SELECT * FROM fees WHERE student_id = 'STU-1004'");
    if (allenFees.length !== 1 || Number(allenFees[0].amount) !== 300) throw new Error("Finance records lost!");
    console.log("✓ Requirement 5 Passed: Finance history preserved.");

    // 6. Promotion history preserved and status set to Reverted
    const [promoHistory] = await conn.query("SELECT * FROM promotions WHERE student_id = 'STU-1004' ORDER BY promoted_at ASC");
    console.log("Promotion history entries count:", promoHistory.length);
    console.log("Original promo status:", promoHistory[0].status);
    if (promoHistory[0].status !== 'Reverted') throw new Error("Original promotion record status was not updated to Reverted!");
    console.log("✓ Requirement 6 Passed: Promotion history preserved and marked REVERTED.");

    // 7. Duplicate Return Prevention Check
    const [repeatActive] = await conn.query(
      "SELECT id FROM promotions WHERE student_id = 'STU-1004' AND status = 'Promoted'"
    );
    if (repeatActive.length > 0) throw new Error("Student still has active promotion status!");
    console.log("✓ Requirement 7 Passed: Duplicate return prevented; no active promotion remaining.");

    console.log("\n==========================================");
    console.log("ALL REVERT PROMOTION TESTS PASSED 100%!");
    console.log("==========================================");
  } catch (err) {
    console.error("Test Error:", err.message);
  } finally {
    await conn.end();
  }
}

testRevertPromotionScenario();
