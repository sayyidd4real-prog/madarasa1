import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE_NAME, STUDENT_SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let portal = searchParams.get("portal");

    if (!portal) {
      try {
        const body = await request.json();
        portal = body.portal;
      } catch {
        // No json body
      }
    }

    const cookieStore = await cookies();

    if (portal === "student") {
      cookieStore.set(STUDENT_SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      cookieStore.delete(STUDENT_SESSION_COOKIE_NAME);
    } else if (portal === "admin") {
      cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
    } else {
      // Clear both if portal not specified
      cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
      cookieStore.delete(STUDENT_SESSION_COOKIE_NAME);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
