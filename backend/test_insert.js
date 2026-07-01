import { db } from './data/db.js';

async function run() {
  try {
    // Let's clear the cart and wishlist for user_id = 3 (Roja) first to have a clean slate
    await db.execute({
      sql: "DELETE FROM cart WHERE user_id = ?",
      args: [3]
    });
    await db.execute({
      sql: "DELETE FROM wishlist WHERE user_id = ?",
      args: [3]
    });

    console.log("Cleared cart and wishlist for user 3");

    // Let's insert product_id = 1 into cart and wishlist for user_id = 3
    // We will do this via direct DB execute to see if it works
    await db.execute({
      sql: "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
      args: [3, 1, 1]
    });
    console.log("Inserted product_id = 1 into cart for user 3");

    await db.execute({
      sql: "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
      args: [3, 1]
    });
    console.log("Inserted product_id = 1 into wishlist for user 3");

    // Now let's query cart and wishlist
    const cartRes = await db.execute("SELECT * FROM cart WHERE user_id = 3;");
    console.log("Cart items for user 3:", cartRes.rows);

    const wishlistRes = await db.execute("SELECT * FROM wishlist WHERE user_id = 3;");
    console.log("Wishlist items for user 3:", wishlistRes.rows);
  } catch (err) {
    console.error("Error running test:", err);
  }
}

run();
