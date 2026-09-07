import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const isVercel = process.env.VERCEL === "1";
const isProduction = process.env.VERCEL_ENV === "production";

if (isVercel && isProduction) {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("[vercel-build] DATABASE_URL is required for production migrations.");
    process.exit(1);
  }
  console.log("[vercel-build] Production deployment: running committed Payload migrations.");
  run("npx", ["payload", "migrate"]);
} else {
  console.log(`[vercel-build] ${isVercel ? process.env.VERCEL_ENV || "non-production" : "local"} build: skipping database migrations.`);
}

// Vercel builds compile against the committed generated Payload types. A
// separate CI check regenerates types and fails when src/payload-types.ts is
// stale, so Preview never needs database access or an in-build schema rewrite.
run("npx", ["next", "build"]);
