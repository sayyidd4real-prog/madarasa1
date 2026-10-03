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
  await queryDb("INSERT INTO classes (id, name, room) VALUES (?, ?, 'Room 101')", [
    fallbackId,
    classNameOrId || "General Class"
  ]);
  return fallbackId;
}

// Helper to validate and save exam record with Continuous Assessment vs Final Exam rules
async function validateAndSaveExam(
  studentId: string,
  classId: string,
  subject: string,
  term: string,
  scoreVal: number,
  feedback: string
): Promise<{ success: boolean; error?: string; examId?: string }> {
  // 1. Score Range Validation
  if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
    return { success: false, error: "Score must be between 0 and 100." };
  }

  // 2. Continuous Assessment Validation: Term 1 + Mid-term <= 100
  if (term === "Term 1" || term === "Mid-term") {
    const otherTerm = term === "Term 1" ? "Mid-term" : "Term 1";
    const [existingOther] = await queryDb(
      "SELECT score FROM exams WHERE student_id = ? AND subject = ? AND term = ?",
      [studentId, subject, otherTerm]
    );
    if ((existingOther as any[]).length > 0) {
      const otherScore = parseFloat((existingOther as any[])[0].score) || 0;
      if (otherScore + scoreVal > 100) {
        return { success: false, error: "Term 1 + Mid-term cannot exceed 100 points." };
      }
    }
  }

  // 3. Upsert / Update existing record to avoid duplicate entries for same term
  const [currentRows] = await queryDb(
    "SELECT id FROM exams WHERE student_id = ? AND subject = ? AND term = ?",
    [studentId, subject, term]
  );

  let examId: string;
  if ((currentRows as any[]).length > 0) {
    examId = (currentRows as any[])[0].id;
    await queryDb(
      "UPDATE exams SET score = ?, feedback = ?, class_id = ? WHERE id = ?",
      [scoreVal, feedback || "", classId, examId]
    );
  } else {
    examId = `EXM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await queryDb(
      "INSERT INTO exams (id, student_id, class_id, subject, term, score, feedback) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [examId, studentId, classId, subject, term, scoreVal, feedback || ""]
    );
  }

  return { success: true, examId };
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

      for (let idx = 0; idx < grades.length; idx++) {
        const g = grades[idx];
        const rawScore = parseFloat(g.score);
        const scoreVal = isNaN(rawScore) ? 0 : rawScore;

        const saveRes = await validateAndSaveExam(studentId, classId, g.subject, term, scoreVal, g.feedback || "");
        if (!saveRes.success) {
          return NextResponse.json({ success: false, error: saveRes.error }, { status: 400 });
        }

        createdExams.push({
          id: saveRes.examId,
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

    const rawScore = parseFloat(score);
    const scoreVal = isNaN(rawScore) ? 0 : rawScore;

    const saveRes = await validateAndSaveExam(studentId, classId, subject, term, scoreVal, feedback || "");
    if (!saveRes.success) {
      return NextResponse.json({ success: false, error: saveRes.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      exam: {
        id: saveRes.examId,
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

    const parsedScore = parseFloat(score);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      return NextResponse.json({ success: false, error: "Score must be between 0 and 100." }, { status: 400 });
    }

    const [existing] = await queryDb("SELECT student_id, subject, term, score FROM exams WHERE id = ?", [id]);
    if ((existing as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Exam record not found." }, { status: 404 });
    }
    const { student_id, subject, term } = (existing as any[])[0];

    // Continuous Assessment check
    if (term === "Term 1" || term === "Mid-term") {
      const otherTerm = term === "Term 1" ? "Mid-term" : "Term 1";
      const [otherRows] = await queryDb(
        "SELECT score FROM exams WHERE student_id = ? AND subject = ? AND term = ?",
        [student_id, subject, otherTerm]
      );
      if ((otherRows as any[]).length > 0) {
        const otherScore = parseFloat((otherRows as any[])[0].score) || 0;
        if (otherScore + parsedScore > 100) {
          return NextResponse.json({ success: false, error: "Term 1 + Mid-term cannot exceed 100 points." }, { status: 400 });
        }
      }
    }

    await queryDb("UPDATE exams SET score = ?, feedback = ? WHERE id = ?", [parsedScore, feedback || "", id]);

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

