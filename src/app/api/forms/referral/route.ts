import { NextResponse } from "next/server";
import { getFormAdapter } from "@/lib/forms/adapter";

/** Preview-only. Request body is ignored so no PHI reaches the server log surface. */
export async function POST() {
  const result = await getFormAdapter().submitReferral();
  return NextResponse.json(result, { status: 200 });
}
