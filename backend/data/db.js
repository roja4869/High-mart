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

console.log("Turso Connected");

// Auto-migrate tables to support custom profile fields
async function initializeSchema() {
  try {
    const tableInfo = await db.execute("PRAGMA table_info(users);");
    const columns = tableInfo.rows.map(row => row.name);
    
    const columnsToAdd = [
      { name: 'avatar', type: 'TEXT' },
      { name: 'gender', type: 'TEXT' },
      { name: 'dob', type: 'TEXT' },
      { name: 'bio', type: 'TEXT' }
    ];
    
    for (const col of columnsToAdd) {
      if (!columns.includes(col.name)) {
        console.log(`Altering table 'users' to add column '${col.name}'...`);
        await db.execute(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type};`);
      }
    }
  } catch (err) {
    console.error("Error during database schema checks/alterations:", err);
  }
}

initializeSchema();