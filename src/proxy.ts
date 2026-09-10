import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, ADMIN_SESSION_COOKIE_NAME, STUDENT_SESSION_COOKIE_NAME } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, internal Next.js routes, images, icons, API endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const studentToken = request.cookies.get(STUDENT_SESSION_COOKIE_NAME)?.value;

  const adminSession = adminToken ? await verifySessionToken(adminToken) : null;
  const studentSession = studentToken ? await verifySessionToken(studentToken) : null;

  const isLoginPage = pathname === "/login";

  // Case 1: Root URL redirection
  if (pathname === "/") {
    if (adminSession && (adminSession.role === "super_admin" || adminSession.role === "admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (studentSession && studentSession.role === "student") {
      return NextResponse.redirect(new URL("/student", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Case 2: Login Page
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Case 3: Admin route guarding (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (adminSession && (adminSession.role === "super_admin" || adminSession.role === "admin")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Case 4: Student route guarding (/student/*)
  if (pathname.startsWith("/student")) {
    if (studentSession && studentSession.role === "student") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
