import { NextResponse } from "next/server";
import { queryDb, initMysqlDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { subjectName, subjectCode, description } = body;

    if (!subjectName || !subjectCode) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const id = `SUB-${Date.now()}`;

    const [existing] = await queryDb(
      "SELECT id FROM subjects WHERE LOWER(subjectName) = LOWER(?) OR LOWER(subjectCode) = LOWER(?)",
      [subjectName.trim(), subjectCode.trim()]
    );
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ success: false, error: "A subject with this name or code already exists." }, { status: 400 });
    }

    await queryDb("INSERT INTO subjects (id, subjectName, subjectCode, description) VALUES (?, ?, ?, ?)", [
      id,
      subjectName.trim(),
      subjectCode.trim(),
      (description || "").trim()
    ]);

    return NextResponse.json({ success: true, subject: { id, subjectName: subjectName.trim(), subjectCode: subjectCode.trim(), description: (description || "").trim() } });
  } catch (error: any) {
    console.error("Subjects POST Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initMysqlDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Subject ID is required." }, { status: 400 });
    }

    await queryDb("DELETE FROM subjects WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Subjects DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

