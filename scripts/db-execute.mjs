#!/usr/bin/env node
/**
 * Run a SQL file against Supabase via CLI (no MCP).
 *
 * Option A — DATABASE_URL in env (Dashboard → Settings → Database → connection string):
 *   set DATABASE_URL=postgresql://...
 *   npm run db:execute -- supabase/schema/14_notifications_phase3.sql
 *
 * Option B — linked project (requires `npx supabase login` + `npx supabase link`):
 *   npm run db:execute -- supabase/schema/14_notifications_phase3.sql
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const sqlArg = process.argv[2];

if (!sqlArg) {
  console.error("Usage: node scripts/db-execute.mjs <path-to.sql>");
  process.exit(1);
}

const sqlPath = path.resolve(process.cwd(), sqlArg);
if (!existsSync(sqlPath)) {
  console.error(`File not found: ${sqlPath}`);
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL?.trim();
const args = ["--yes", "supabase", "db", "query", "-f", sqlPath];

if (dbUrl) {
  args.push("--db-url", dbUrl);
} else {
  args.push("--linked");
}

const result = spawnSync("npx", args, { stdio: "inherit", shell: true });

process.exit(result.status ?? 1);
