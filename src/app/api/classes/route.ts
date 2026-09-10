import { NextResponse } from "next/server";
import { queryDb, initMysqlDb } from "@/lib/db";

export async function GET() {
  try {
    await initMysqlDb();
    const [rows] = await queryDb("SELECT id, name AS className, room, instructor FROM classes");
    return NextResponse.json({ success: true, classes: rows });
  } catch (error: any) {
    console.error("Classes GET Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { className, room, instructor } = body;

    if (!className || !room || !instructor) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const id = `cls-${Date.now()}`;

    const [existing] = await queryDb("SELECT id FROM classes WHERE LOWER(name) = LOWER(?)", [className.trim()]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ success: false, error: "A class with this name already exists." }, { status: 400 });
    }

    await queryDb("INSERT INTO classes (id, name, room, instructor) VALUES (?, ?, ?, ?)", [
      id,
      className.trim(),
      room.trim(),
      instructor.trim()
    ]);

    return NextResponse.json({ success: true, class: { id, className: className.trim(), room: room.trim(), instructor: instructor.trim() } });
  } catch (error: any) {
    console.error("Classes POST Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { id, className, room, instructor } = body;

    if (!id || !className || !room || !instructor) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const [clsRows] = await queryDb("SELECT id FROM classes WHERE id = ?", [id]);
    if ((clsRows as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Class not found." }, { status: 404 });
    }

    const [existing] = await queryDb("SELECT id FROM classes WHERE id != ? AND LOWER(name) = LOWER(?)", [id, className.trim()]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ success: false, error: "A class with this name already exists." }, { status: 400 });
    }

    await queryDb("UPDATE classes SET name = ?, room = ?, instructor = ? WHERE id = ?", [
      className.trim(),
      room.trim(),
      instructor.trim(),
      id
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Classes PUT Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initMysqlDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Class ID is required." }, { status: 400 });
    }

    await queryDb("DELETE FROM classes WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Classes DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

