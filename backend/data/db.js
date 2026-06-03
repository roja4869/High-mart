import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure env variables are loaded (especially for scripts executed directly)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url) {
  console.warn("WARNING: DATABASE_URL is not defined in environment variables. Falling back to local file database.");
}

export const db = createClient({
  url: url || "file:local.db",
  authToken: authToken || ""
});
