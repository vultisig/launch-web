import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

try {
  for (const line of readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
} catch {
  // Environment variables may already be set by the shell.
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
const sql = neon(process.env.DATABASE_URL);
const statements = readFileSync(resolve("db/schema.sql"), "utf8")
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);
await sql.transaction(statements.map((statement) => sql.query(statement)));
console.log("Feature board schema is ready.");
