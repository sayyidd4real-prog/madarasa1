import { NextResponse } from "next/server";
import { queryDb, initMysqlDb } from "@/lib/db";
import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_SESSION_COOKIE_NAME, STUDENT_SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const portal = searchParams.get("portal");

    const cookieStore = await cookies();
    let token: string | undefined;

    if (portal === "student") {
      token = cookieStore.get(STUDENT_SESSION_COOKIE_NAME)?.value;
    } else if (portal === "admin") {
      token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    } else {
      token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value || cookieStore.get(STUDENT_SESSION_COOKIE_NAME)?.value;
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initMysqlDb();

    // 1. Fetch user accounts (admins only)
    let userAccounts: any[] = [];
    if (session.role === "super_admin" || session.role === "admin") {
      const [uRows] = await queryDb(
        "SELECT id, username AS fullName, username AS email, role, 'active' AS status, NOW() AS createdAt FROM users"
      );
      userAccounts = uRows as any[];
    }

    // 2. Fetch classes (everyone can view classes)
    const [cRows] = await queryDb(
      "SELECT id, name AS className, room, instructor FROM classes"
    );
    const classes = cRows as any[];

    // 3. Fetch subjects (everyone can view subjects)
    const [subRows] = await queryDb(
      "SELECT id, subjectName, subjectCode, description FROM subjects"
    );
    const subjects = subRows as any[];

    // 4. Fetch students (admins get all, student gets only their profile)
    let students: any[] = [];
    if (session.role === "super_admin" || session.role === "admin") {
      const [sRows] = await queryDb(
        "SELECT id, name, email, grade AS gradeGroup, '2025–2026' AS academicYear, 'active' AS status FROM students"
      );
      students = sRows as any[];
    } else if (session.role === "student" && session.studentId) {
      const [sRows] = await queryDb(
        "SELECT id, name, email, grade AS gradeGroup, '2025–2026' AS academicYear, 'active' AS status FROM students WHERE id = ?",
        [session.studentId]
      );
      students = sRows as any[];
    }

    // 5. Fetch exams (admins get all, student gets only their exams)
    let exams: any[] = [];
    if (session.role === "super_admin" || session.role === "admin") {
      const [eRows] = await queryDb(`
        SELECT e.id, e.student_id AS studentId, s.name AS studentName, s.grade AS className, '2025–2026' AS academicYear, e.subject, e.term, e.score, 100 AS maxPoints, COALESCE(e.feedback, '') AS feedback
        FROM exams e
        JOIN students s ON e.student_id = s.id
      `);
      exams = eRows as any[];
    } else if (session.role === "student" && session.studentId) {
      const [eRows] = await queryDb(`
        SELECT e.id, e.student_id AS studentId, s.name AS studentName, s.grade AS className, '2025–2026' AS academicYear, e.subject, e.term, e.score, 100 AS maxPoints, COALESCE(e.feedback, '') AS feedback
        FROM exams e
        JOIN students s ON e.student_id = s.id
        WHERE e.student_id = ?
      `, [session.studentId]);
      exams = eRows as any[];
    }

    // 6. Fetch fees (admins get all, student gets only their fees)
    let fees: any[] = [];
    if (session.role === "super_admin" || session.role === "admin") {
      const [fRows] = await queryDb(`
        SELECT f.id, f.student_id AS studentId, s.name AS studentName, s.grade AS className, f.name AS feeName, f.amount, f.paid, f.deductions, f.status, IF(f.paid > 0 AND f.amount = 0, 'Payment', 'Charge') AS transactionType, DATE_FORMAT(NOW(), '%Y-%m-%d') AS date, '2025–2026' AS academicYear
        FROM fees f
        JOIN students s ON f.student_id = s.id
      `);
      fees = fRows as any[];
    } else if (session.role === "student" && session.studentId) {
      const [fRows] = await queryDb(`
        SELECT f.id, f.student_id AS studentId, s.name AS studentName, s.grade AS className, f.name AS feeName, f.amount, f.paid, f.deductions, f.status, IF(f.paid > 0 AND f.amount = 0, 'Payment', 'Charge') AS transactionType, DATE_FORMAT(NOW(), '%Y-%m-%d') AS date, '2025–2026' AS academicYear
        FROM fees f
        JOIN students s ON f.student_id = s.id
        WHERE f.student_id = ?
      `, [session.studentId]);
      fees = fRows as any[];
    }

    fees = (fees || []).map((f: any) => ({
      ...f,
      amount: parseFloat(f.amount) || 0,
      paid: parseFloat(f.paid) || 0,
      deductions: parseFloat(f.deductions) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        students,
        classes,
        fees,
        exams,
        subjects,
        userAccounts
      }
    });
  } catch (error: any) {
    console.error("Portal Data GET Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}


