import { NextResponse } from "next/server";
import { queryDb, initMysqlDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { fullName, email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [existing] = await queryDb("SELECT id FROM users WHERE LOWER(username) = LOWER(?)", [cleanEmail]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ success: false, error: "An account with this email/username already exists." }, { status: 400 });
    }

    const [res] = await queryDb(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [cleanEmail, password, role]
    );

    return NextResponse.json({
      success: true,
      user: { id: (res as any).insertId, fullName: fullName || cleanEmail, email: cleanEmail, role, status: "active" }
    });
  } catch (error: any) {
    console.error("User Accounts POST Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { id, email, password, role } = body;

    if (!id || !email) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (password && password.trim()) {
      await queryDb("UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?", [
        cleanEmail,
        password.trim(),
        role || "admin",
        id
      ]);
    } else {
      await queryDb("UPDATE users SET username = ?, role = ? WHERE id = ?", [
        cleanEmail,
        role || "admin",
        id
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("User Accounts PUT Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initMysqlDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required." }, { status: 400 });
    }

    await queryDb("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("User Accounts DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

