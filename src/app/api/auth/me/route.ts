import { NextResponse } from "next/server";
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
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
        studentId: session.studentId,
      },
    });
  } catch (error) {
    console.error("Auth Me API Error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
