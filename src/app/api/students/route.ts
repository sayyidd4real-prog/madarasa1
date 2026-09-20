import { NextResponse } from "next/server";
import { queryDb, initMysqlDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { name, email, phoneNumber, gradeGroup, academicYear, password } = body;

    if (!name || !email || !phoneNumber || !gradeGroup) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const [existingPhone] = await queryDb("SELECT id FROM students WHERE phoneNumber = ?", [phoneNumber.trim()]);
    if ((existingPhone as any[]).length > 0) {
      return NextResponse.json({ success: false, error: "Phone number already exists for another student." }, { status: 400 });
    }

    // Generate unique STU-xxxx ID
    const [countRows] = await queryDb("SELECT COUNT(*) AS c FROM students");
    const count = (countRows as any[])[0].c || 0;
    const generatedId = `STU-${1000 + count + 1}`;

    await queryDb("INSERT INTO students (id, name, email, phoneNumber, grade) VALUES (?, ?, ?, ?, ?)", [
      generatedId,
      name.trim(),
      email.trim(),
      phoneNumber.trim(),
      gradeGroup.trim()
    ]);

    // Insert user for login authentication
    const userPass = password && password.trim() ? password.trim() : "student123";
    await queryDb(
      "INSERT INTO users (username, password, role, student_id) VALUES (?, ?, 'student', ?) ON DUPLICATE KEY UPDATE password = VALUES(password)",
      [email.trim(), userPass, generatedId]
    );

    return NextResponse.json({
      success: true,
      student: {
        id: generatedId,
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        gradeGroup: gradeGroup.trim(),
        academicYear: academicYear || "2025–2026",
        status: "active"
      }
    });
  } catch (error: any) {
    console.error("Student POST Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { id, name, email, phoneNumber, gradeGroup, password } = body;

    if (!id || !name || !email || !phoneNumber || !gradeGroup) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const [existingPhone] = await queryDb("SELECT id FROM students WHERE phoneNumber = ? AND id != ?", [phoneNumber.trim(), id]);
    if ((existingPhone as any[]).length > 0) {
      return NextResponse.json({ success: false, error: "Phone number already exists for another student." }, { status: 400 });
    }

    await queryDb("UPDATE students SET name = ?, email = ?, phoneNumber = ?, grade = ? WHERE id = ?", [
      name.trim(),
      email.trim(),
      phoneNumber.trim(),
      gradeGroup.trim(),
      id
    ]);

    if (password && password.trim()) {
      await queryDb("UPDATE users SET password = ? WHERE student_id = ?", [password.trim(), id]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Student PUT Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initMysqlDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Student ID is required." }, { status: 400 });
    }

    await queryDb("DELETE FROM exams WHERE student_id = ?", [id]);
    await queryDb("DELETE FROM fees WHERE student_id = ?", [id]);
    await queryDb("DELETE FROM users WHERE student_id = ?", [id]);
    await queryDb("DELETE FROM students WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Student DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

