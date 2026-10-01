import { NextResponse } from "next/server";
import { queryDb, initMysqlDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { studentIds, fromClass, toClass, academicYear } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ success: false, error: "No students selected for promotion." }, { status: 400 });
    }
    if (!fromClass || !toClass) {
      return NextResponse.json({ success: false, error: "Source class and target class are required." }, { status: 400 });
    }
    if (fromClass.trim().toLowerCase() === toClass.trim().toLowerCase()) {
      return NextResponse.json({ success: false, error: "Source class and target class cannot be identical." }, { status: 400 });
    }

    const targetAcademicYear = academicYear || "2026–2027";
    const currentAcademicYear = "2025–2026";
    const promotedStudents: string[] = [];

    // Phase 1: Strict Validation of ALL selected students before committing any changes
    for (const sId of studentIds) {
      // 1. Verify student exists
      const [sRows] = await queryDb("SELECT id, name, grade FROM students WHERE id = ?", [sId]);
      if ((sRows as any[]).length === 0) {
        return NextResponse.json({ success: false, error: `Student with ID ${sId} was not found.` }, { status: 400 });
      }
      const studentObj = (sRows as any[])[0];

      // 2. Verify student belongs to selected source class
      if (studentObj.grade !== fromClass) {
        return NextResponse.json(
          { success: false, error: `Student ${studentObj.name} (${sId}) is currently in ${studentObj.grade}, not ${fromClass}.` },
          { status: 400 }
        );
      }

      // 3. Verify Final Exam pass eligibility
      const [finalExamRows] = await queryDb(
        "SELECT score FROM exams WHERE student_id = ? AND term = 'Final Exam'",
        [sId]
      );
      if ((finalExamRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, error: `Student ${studentObj.name} (${sId}) has not taken the Final Exam for ${fromClass}.` },
          { status: 400 }
        );
      }

      const finalScores = (finalExamRows as any[]).map((r: any) => parseFloat(r.score) || 0);
      const avgFinal = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;

      if (avgFinal < 60) {
        return NextResponse.json(
          { success: false, error: `Student ${studentObj.name} (${sId}) has not passed the Final Exam (Average score: ${Math.round(avgFinal)}%).` },
          { status: 400 }
        );
      }

      // 4. Check double promotion
      const [promoRows] = await queryDb(
        "SELECT id FROM promotions WHERE student_id = ? AND to_class = ? AND to_academic_year = ?",
        [sId, toClass, targetAcademicYear]
      );
      if ((promoRows as any[]).length > 0) {
        return NextResponse.json(
          { success: false, error: `Student ${studentObj.name} (${sId}) is already promoted to ${toClass} for ${targetAcademicYear}.` },
          { status: 400 }
        );
      }
    }

    // Phase 2: Execute promotion transaction for all validated students
    for (const sId of studentIds) {
      const [sRows] = await queryDb("SELECT name FROM students WHERE id = ?", [sId]);
      const studentName = (sRows as any[])[0].name;

      // Update student grade in students table
      await queryDb("UPDATE students SET grade = ? WHERE id = ?", [toClass, sId]);

      // Record entry in promotions history table
      const promoId = `prm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await queryDb(
        `INSERT INTO promotions (id, student_id, student_name, from_class, to_class, from_academic_year, to_academic_year, promoted_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'Promoted')`,
        [promoId, sId, studentName, fromClass, toClass, currentAcademicYear, targetAcademicYear]
      );

      promotedStudents.push(studentName);
    }

    return NextResponse.json({
      success: true,
      promotedCount: promotedStudents.length,
      message: `Successfully promoted ${promotedStudents.length} student(s) from ${fromClass} to ${toClass}.`
    });
  } catch (error: any) {
    console.error("Promotion POST Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Promotion operation failed." }, { status: 500 });
  }
}
