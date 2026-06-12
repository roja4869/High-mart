import axios from 'axios';

async function run() {
  try {
    const res = await axios.get('http://localhost:5000/api/products');
    const products = res.data.products;
    console.log("Total products returned by API:", products.length);
    console.log("First product in response:", products[0]);
  } catch (err) {
    console.error("Error fetching API:", err.message);
  }
}

run();
