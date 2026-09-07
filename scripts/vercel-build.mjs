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

// Payload type generation reads the config and can initialize the DB adapter in
// environments without DATABASE_URL. Generated types are committed to the repo,
// so Vercel builds should not regenerate them. CI/typecheck will catch stale types.
run("npx", ["next", "build"]);
