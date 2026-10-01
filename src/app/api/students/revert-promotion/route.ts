import { NextResponse } from "next/server";
import { queryDb, initMysqlDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { promotionId, studentIds } = body;

    // Handle single promotion reversal by promotionId
    if (promotionId) {
      const [pRows] = await queryDb("SELECT * FROM promotions WHERE id = ?", [promotionId]);
      if ((pRows as any[]).length === 0) {
        return NextResponse.json({ success: false, error: "Promotion record was not found." }, { status: 400 });
      }

      const promo = (pRows as any[])[0];
      if (promo.status === "Reverted") {
        return NextResponse.json(
          { success: false, error: `Student ${promo.student_name} has already been returned to ${promo.from_class}.` },
          { status: 400 }
        );
      }

      // Verify student exists
      const [sRows] = await queryDb("SELECT id, name, grade FROM students WHERE id = ?", [promo.student_id]);
      if ((sRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, error: `Student with ID ${promo.student_id} was not found.` },
          { status: 400 }
        );
      }
      const studentObj = (sRows as any[])[0];

      // Restore student's grade to the previous class recorded in this promotion
      await queryDb("UPDATE students SET grade = ? WHERE id = ?", [promo.from_class, promo.student_id]);

      // Mark the promotion record status as 'Reverted'
      await queryDb("UPDATE promotions SET status = 'Reverted' WHERE id = ?", [promotionId]);

      // Insert an audit log record for reversal event
      const revertLogId = `prm-rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await queryDb(
        `INSERT INTO promotions (id, student_id, student_name, from_class, to_class, from_academic_year, to_academic_year, promoted_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'Reverted')`,
        [
          revertLogId,
          promo.student_id,
          studentObj.name,
          studentObj.grade,
          promo.from_class,
          promo.to_academic_year || "2026–2027",
          promo.from_academic_year || "2025–2026",
        ]
      );

      return NextResponse.json({
        success: true,
        message: `Successfully returned ${studentObj.name} to ${promo.from_class}.`,
      });
    }

    // Handle array of studentIds (bulk return)
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ success: false, error: "No promotion record or students selected for return." }, { status: 400 });
    }

    const revertTargets: Array<{
      studentId: string;
      studentName: string;
      currentClass: string;
      previousClass: string;
      originalPromoId: string;
      fromYear: string;
      toYear: string;
    }> = [];

    for (const sId of studentIds) {
      const [sRows] = await queryDb("SELECT id, name, grade FROM students WHERE id = ?", [sId]);
      if ((sRows as any[]).length === 0) {
        return NextResponse.json({ success: false, error: `Student with ID ${sId} was not found.` }, { status: 400 });
      }
      const studentObj = (sRows as any[])[0];

      const [pRows] = await queryDb(
        `SELECT id, from_class, to_class, from_academic_year, to_academic_year, status 
         FROM promotions 
         WHERE student_id = ? AND status = 'Promoted' 
         ORDER BY promoted_at DESC 
         LIMIT 1`,
        [sId]
      );

      if ((pRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, error: `Student ${studentObj.name} (${sId}) has already been returned or has no active promotion.` },
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
        fromYear: activePromo.from_academic_year || "2025–2026",
        toYear: activePromo.to_academic_year || "2026–2027",
      });
    }

    const revertedNames: string[] = [];

    for (const target of revertTargets) {
      await queryDb("UPDATE students SET grade = ? WHERE id = ?", [target.previousClass, target.studentId]);
      await queryDb("UPDATE promotions SET status = 'Reverted' WHERE id = ?", [target.originalPromoId]);

      const revertLogId = `prm-rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await queryDb(
        `INSERT INTO promotions (id, student_id, student_name, from_class, to_class, from_academic_year, to_academic_year, promoted_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'Reverted')`,
        [
          revertLogId,
          target.studentId,
          target.studentName,
          target.currentClass,
          target.previousClass,
          target.toYear,
          target.fromYear,
        ]
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
