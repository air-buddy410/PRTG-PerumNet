import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as authSchema from "@/db/auth-schema";
import * as schema from "@/db/schema";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_PATH ?? path.join(DB_DIR, "perumnet.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema: { ...schema, ...authSchema } });
