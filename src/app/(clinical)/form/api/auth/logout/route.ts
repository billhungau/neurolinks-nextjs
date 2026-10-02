import { NextResponse } from "next/server";
import { CLINICIAN_ACCESS_COOKIE } from "@/lib/clinical/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return new Response("Forbidden", { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/form/login/", request.url), 303);
  response.cookies.set(CLINICIAN_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/form",
    expires: new Date(0),
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
