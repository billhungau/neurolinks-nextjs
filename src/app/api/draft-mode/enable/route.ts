import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { isSanityConfigured } from "@/sanity/env";

export const { GET } = isSanityConfigured()
  ? defineEnableDraftMode({
      client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
    })
  : {
      GET: async () => NextResponse.json({ ok: false, error: "Sanity is not configured" }, { status: 503 }),
    };
