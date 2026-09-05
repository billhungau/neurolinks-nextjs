import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { insightsArticlePath } from "@/lib/insights";

type SanityWebhookBody = {
  _type?: string;
  _id?: string;
  slug?: { current?: string } | string;
};

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 503 });
  }

  const { isValidSignature, body } = await parseBody<SanityWebhookBody>(request, secret);
  if (!isValidSignature) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  revalidateTag("insights", "max");
  revalidatePath("/insights/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/veterans/");

  const slug = typeof body?.slug === "string" ? body.slug : body?.slug?.current;
  if (slug) revalidatePath(insightsArticlePath(slug));

  return NextResponse.json({ ok: true, type: body?._type ?? null });
}
