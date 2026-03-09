import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export function proxy(request: NextRequest) {

  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/manager/:path*", "/user/:path*"]
}