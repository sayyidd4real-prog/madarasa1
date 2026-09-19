import { NextResponse } from "next/server";
import { queryDb, initMysqlDb } from "@/lib/db";

// Helper to resolve valid class_id
async function resolveClassId(classNameOrId: string): Promise<string> {
  const [rows] = await queryDb("SELECT id FROM classes WHERE id = ? OR name = ?", [classNameOrId, classNameOrId]);
  if ((rows as any[]).length > 0) {
    return (rows as any[])[0].id;
  }
  const [allClasses] = await queryDb("SELECT id FROM classes LIMIT 1");
  if ((allClasses as any[]).length > 0) {
    return (allClasses as any[])[0].id;
  }
  const fallbackId = `cls-${Date.now()}`;
  await queryDb("INSERT INTO classes (id, name, room, instructor) VALUES (?, ?, 'Room 101', 'Staff')", [
    fallbackId,
    classNameOrId || "General Class"
  ]);
  return fallbackId;
}

export async function POST(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { studentId, className, subject, term, score, feedback, isBatch, grades } = body;

    // 1. Batch Exam Grading
    if (isBatch && Array.isArray(grades)) {
      if (!studentId || !className || !term) {
        return NextResponse.json({ success: false, error: "Missing batch meta parameters." }, { status: 400 });
      }

      const [sRows] = await queryDb("SELECT name FROM students WHERE id = ?", [studentId]);
      if ((sRows as any[]).length === 0) {
        return NextResponse.json({ success: false, error: "Student does not exist." }, { status: 404 });
      }
      const studentName = (sRows as any[])[0].name;
      const classId = await resolveClassId(className);

      const createdExams: any[] = [];
      const timestamp = Date.now();

      for (let idx = 0; idx < grades.length; idx++) {
        const g = grades[idx];
        const examId = `EXM-${timestamp}-${idx}`;
        const scoreVal = parseFloat(g.score) || 0;
        await queryDb(
          "INSERT INTO exams (id, student_id, class_id, subject, term, score, feedback) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [examId, studentId, classId, g.subject, term, scoreVal, g.feedback || ""]
        );

        createdExams.push({
          id: examId,
          studentId,
          studentName,
          className,
          subject: g.subject,
          term,
          score: scoreVal,
          maxPoints: 100,
          feedback: g.feedback || ""
        });
      }

      return NextResponse.json({ success: true, exams: createdExams });
    }

    // 2. Single Exam Grading
    if (!studentId || !className || !subject || !term || score === undefined) {
      return NextResponse.json({ success: false, error: "Missing exam grading parameters." }, { status: 400 });
    }

    const [sRows] = await queryDb("SELECT name FROM students WHERE id = ?", [studentId]);
    if ((sRows as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Student does not exist." }, { status: 404 });
    }
    const studentName = (sRows as any[])[0].name;
    const classId = await resolveClassId(className);

    const examId = `EXM-${Date.now()}`;
    const scoreVal = parseFloat(score);

    await queryDb(
      "INSERT INTO exams (id, student_id, class_id, subject, term, score, feedback) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [examId, studentId, classId, subject, term, scoreVal, feedback || ""]
    );

    return NextResponse.json({
      success: true,
      exam: {
        id: examId,
        studentId,
        studentName,
        className,
        subject,
        term,
        score: scoreVal,
        maxPoints: 100,
        feedback: feedback || ""
      }
    });
  } catch (error: any) {
    console.error("Exams POST Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { id, score, feedback } = body;

    if (!id || score === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const scoreVal = parseFloat(score);
    if (isNaN(scoreVal)) {
      return NextResponse.json({ success: false, error: "Invalid score value." }, { status: 400 });
    }

    await queryDb("UPDATE exams SET score = ?, feedback = ? WHERE id = ?", [scoreVal, feedback || "", id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Exams PUT Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initMysqlDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Exam ID is required." }, { status: 400 });
    }

    await queryDb("DELETE FROM exams WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Exams DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

