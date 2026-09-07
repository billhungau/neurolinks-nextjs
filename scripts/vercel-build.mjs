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
  console.log("[vercel-build] Production deployment: running Payload migrations.");
  run("npx", ["payload", "migrate"]);
} else {
  console.log(`[vercel-build] ${isVercel ? process.env.VERCEL_ENV || "non-production" : "local"} build: skipping database migrations.`);
}

// Type generation is config-only and does not require a database connection.
// Run it in every environment so a schema/type mismatch cannot be hidden by a
// stale committed payload-types.ts. Preview still never runs a DB migration.
console.log("[vercel-build] Regenerating Payload types from the current config.");
run("npx", ["payload", "generate:types"]);
run("npx", ["next", "build"]);
