import { db } from './data/db.js';

async function run() {
  try {
    const pragmaRes = await db.execute("PRAGMA foreign_keys;");
    console.log("PRAGMA foreign_keys value:", pragmaRes.rows);

    // Let's try inserting an invalid product_id into cart
    try {
      console.log("Attempting to insert invalid product ID into cart...");
      await db.execute({
        sql: "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        args: [1, 999999, 1]
      });
      console.log("SUCCESS! Wait... this shouldn't succeed if foreign keys are enabled.");
    } catch (err) {
      console.log("FAILED (expected if FK is enabled):", err.message);
    }
  } catch (err) {
    console.error("Error querying db:", err);
  }
}

run();
