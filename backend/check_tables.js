import { db } from './data/db.js';

async function run() {
  try {
    const res = await db.execute("SELECT name FROM sqlite_master WHERE type='table';");
    console.log("Tables in DB:", res.rows.map(r => r.name));
  } catch (err) {
    console.error("Error querying tables:", err);
  }
}

run();
