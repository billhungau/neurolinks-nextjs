import { NextResponse } from "next/server";
import { CLINICIAN_ACCESS_COOKIE } from "@/lib/clinical/auth";
import { clinicalConfig } from "@/lib/clinical/config";

export const runtime = "nodejs";

type PasswordGrantResponse = {
  access_token?: string;
  expires_in?: number;
};

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return new Response("Forbidden", { status: 403 });
  }

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || !password || email.length > 320 || password.length > 1024) {
    return NextResponse.redirect(new URL("/form/login/?error=1", request.url), 303);
  }

  const { supabaseUrl, supabaseServiceKey } = clinicalConfig();
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.redirect(new URL("/form/login/?error=1", request.url), 303);
  }

  const auth = (await response.json()) as PasswordGrantResponse;
  if (!auth.access_token) {
    return NextResponse.redirect(new URL("/form/login/?error=1", request.url), 303);
  }

  const redirect = NextResponse.redirect(new URL("/form/dashboard/", request.url), 303);
  redirect.cookies.set(CLINICIAN_ACCESS_COOKIE, auth.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/form",
    maxAge: Math.max(60, Math.min(auth.expires_in ?? 3600, 3600)),
  });
  redirect.headers.set("Cache-Control", "no-store");
  return redirect;
}
