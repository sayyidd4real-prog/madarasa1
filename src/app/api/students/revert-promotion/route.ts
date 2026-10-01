import { NextResponse } from "next/server";
import { queryDb, initMysqlDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { studentIds } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ success: false, error: "No students selected for return." }, { status: 400 });
    }

    // Phase 1: Validate all requested students first
    const revertTargets: Array<{
      studentId: string;
      studentName: string;
      currentClass: string;
      previousClass: string;
      originalPromoId: string;
    }> = [];

    for (const sId of studentIds) {
      // 1. Verify student exists
      const [sRows] = await queryDb("SELECT id, name, grade FROM students WHERE id = ?", [sId]);
      if ((sRows as any[]).length === 0) {
        return NextResponse.json({ success: false, error: `Student with ID ${sId} was not found.` }, { status: 400 });
      }
      const studentObj = (sRows as any[])[0];

      // 2. Find the latest active promotion (status = 'Promoted')
      const [pRows] = await queryDb(
        `SELECT id, from_class, to_class, status 
         FROM promotions 
         WHERE student_id = ? AND status = 'Promoted' 
         ORDER BY promoted_at DESC 
         LIMIT 1`,
        [sId]
      );

      if ((pRows as any[]).length === 0) {
        // Check if student was already returned
        const [revRows] = await queryDb(
          `SELECT id FROM promotions WHERE student_id = ? AND status = 'Reverted' ORDER BY promoted_at DESC LIMIT 1`,
          [sId]
        );
        if ((revRows as any[]).length > 0) {
          return NextResponse.json(
            { success: false, error: `Student ${studentObj.name} (${sId}) has already been returned to the previous class.` },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { success: false, error: `No previous promotion record found for student ${studentObj.name} (${sId}).` },
          { status: 400 }
        );
      }

      const activePromo = (pRows as any[])[0];

      revertTargets.push({
        studentId: sId,
        studentName: studentObj.name,
        currentClass: studentObj.grade,
        previousClass: activePromo.from_class,
        originalPromoId: activePromo.id,
      });
    }

    // Phase 2: Execute Reversal for all validated students
    const revertedNames: string[] = [];

    for (const target of revertTargets) {
      // 1. Restore student's grade in students table to previous class
      await queryDb("UPDATE students SET grade = ? WHERE id = ?", [target.previousClass, target.studentId]);

      // 2. Update status of original promotion record to 'Reverted'
      await queryDb("UPDATE promotions SET status = 'Reverted' WHERE id = ?", [target.originalPromoId]);

      // 3. Create a new audit log record for the return action
      const revertLogId = `prm-rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await queryDb(
        `INSERT INTO promotions (id, student_id, student_name, from_class, to_class, from_academic_year, to_academic_year, promoted_at, status)
         VALUES (?, ?, ?, ?, ?, '2026–2027', '2025–2026', NOW(), 'Reverted')`,
        [revertLogId, target.studentId, target.studentName, target.currentClass, target.previousClass]
      );

      revertedNames.push(target.studentName);
    }

    return NextResponse.json({
      success: true,
      revertedCount: revertedNames.length,
      message: `Successfully returned ${revertedNames.length} student(s) to their previous class.`,
    });
  } catch (error: any) {
    console.error("Revert Promotion POST Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Revert promotion operation failed." }, { status: 500 });
  }
}
