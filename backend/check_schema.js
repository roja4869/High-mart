import { db } from './data/db.js';

async function run() {
  try {
    const cartInfo = await db.execute("PRAGMA table_info(cart);");
    console.log("Cart table info:", cartInfo.rows);

    const wishlistInfo = await db.execute("PRAGMA table_info(wishlist);");
    console.log("Wishlist table info:", wishlistInfo.rows);

    const cartFk = await db.execute("PRAGMA foreign_key_list(cart);");
    console.log("Cart FK list:", cartFk.rows);

    const wishlistFk = await db.execute("PRAGMA foreign_key_list(wishlist);");
    console.log("Wishlist FK list:", wishlistFk.rows);
  } catch (err) {
    console.error("Error querying db info:", err);
  }
}

run();
