import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { isSanityConfigured } from "./env";

function EmptyLive() {
  return null;
}

const live = isSanityConfigured()
  ? defineLive({
      client,
      serverToken: process.env.SANITY_API_READ_TOKEN || false,
      browserToken: process.env.SANITY_API_READ_TOKEN || false,
    })
  : null;

export const SanityLive = live?.SanityLive ?? EmptyLive;
