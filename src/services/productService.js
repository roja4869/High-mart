import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

const enrichProduct = (p) => {
  if (!p) return p;

  const name = p.name || '';
  let discount = p.discount !== undefined ? p.discount : 0;
  let brand = p.brand || 'High Mart';
  let rating = p.rating || 4.5;
  let reviewCount = p.reviewCount || 10;
  let stockCount = p.stock !== undefined ? p.stock : (p.stockCount !== undefined ? p.stockCount : 0);
  let stockStatus = stockCount > 5 ? 'In Stock' : (stockCount > 0 ? 'Low Stock' : 'Out of Stock');
  let sku = p.sku || `HM-PD-${p.id}`;
  let description = p.description || '';

  // Safely parse JSON strings from SQLite
  let images = p.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = null;
    }
  }

  let features = p.features;
  if (typeof features === 'string') {
    try {
      features = JSON.parse(features);
    } catch (e) {
      features = null;
    }
  }

  let specifications = p.specifications;
  if (typeof specifications === 'string') {
    try {
      specifications = JSON.parse(specifications);
    } catch (e) {
      specifications = null;
    }
  }

  let variants = p.variants;
  if (typeof variants === 'string') {
    try {
      variants = JSON.parse(variants);
    } catch (e) {
      variants = null;
    }
  }

  // Set default fallbacks
  images = images || (p.image ? [p.image] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80']);
  features = features || [];
  specifications = specifications || {};
  variants = variants || {};

  if (name.includes('Coffee Maker')) {
    brand = 'Cuisinart';
    discount = 10;
    rating = 4.8;
    reviewCount = 76;
    sku = 'AP-CF-0041';
    images = ['https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80'];
    features = [
      'Brew barista-quality espresso and drip coffee at home',
      'Sleek stainless steel machine',
      'Programmable 24-hour auto-brew feature',
      '12-cup glass carafe with ergonomic handle'
    ];
    specifications = { 'Brand': 'Cuisinart', 'Model': 'CM-100', 'Warranty': '1 Year' };
  } else if (name.includes('Headphones') || name.includes('Noise-Cancelling')) {
    brand = 'AudioPhonic';
    discount = 20;
    rating = 4.9;
    reviewCount = 142;
    sku = 'EL-HP-0092';
    images = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80'
    ];
    features = [
      'Advanced hybrid active noise cancellation (up to 35dB)',
      'High-fidelity 40mm dynamic drivers for deep bass and clear treble',
      'Ultra-long battery life: up to 45 hours of playtime on a single charge',
      'Bluetooth 5.2 connectivity for stable, low-latency audio transmission',
      'Built-in dual microphones with environmental noise reduction for crystal clear calls'
    ];
    specifications = { 'Brand': 'AudioPhonic', 'Model': 'ANC-Silence Pro', 'Warranty': '1 Year' };
  } else if (name.includes('Office Chair') || name.includes('Ergonomic')) {
    brand = 'ErgoComfort';
    discount = 15;
    rating = 4.8;
    reviewCount = 96;
    sku = 'FN-OC-0022';
    images = [
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&q=80',
      'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=600&q=80'
    ];
    features = [
      'Adaptive lumbar support panel adjusts to your spinal curve',
      'Breathable double-layer mesh backrest for heat dissipation',
      '3D multi-directional armrests adjust in height and angle',
      'Heavy-duty nylon base with smooth, silent caster wheels',
      'SGS-certified Class 4 gas lift cylinder for secure height adjustment'
    ];
    specifications = { 'Brand': 'ErgoComfort', 'Model': 'EC-Pro-Mesh', 'Warranty': '3 Years' };
  } else if (name.includes('Water Bottle')) {
    brand = 'HydroFlask';
    discount = 5;
    rating = 4.7;
    reviewCount = 210;
    sku = 'KW-WB-0033';
    images = ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'];
    features = [
      'Double-walled vacuum insulated bottle',
      'Keeps beverages cold for 24 hours or hot for 12 hours',
      'BPA-free and durable stainless steel build'
    ];
    specifications = { 'Brand': 'HydroFlask', 'Model': 'Standard Mouth', 'Warranty': 'Lifetime' };
  } else if (name.includes('Shoes') || name.includes('Running')) {
    brand = 'Nike';
    discount = 10;
    rating = 4.6;
    reviewCount = 118;
    sku = 'FW-RS-0055';
    images = ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'];
    features = [
      'Breathable mesh upper with high-rebound cushioning',
      'Maximum comfort during intense workouts',
      'Durable rubber outsole for superior grip'
    ];
    specifications = { 'Brand': 'Nike', 'Model': 'Air Zoom', 'Warranty': '6 Months' };
  } else {
    discount = p.discount || 0;
    brand = p.brand || 'High Mart';
    rating = p.rating || 4.5;
    reviewCount = p.reviewCount || 10;
    sku = p.sku || `HM-PD-${p.id}`;
  }

  // Ensure relative image URLs are prefixed with /uploads/
  const processImageSrc = (imgSrc) => {
    if (!imgSrc) return '';
    const isFullUrl = imgSrc.startsWith('http://') || imgSrc.startsWith('https://');
    return isFullUrl ? imgSrc : `/uploads/${imgSrc}`;
  };

  const processedImages = images.map(img => processImageSrc(img));
  const mainImage = processedImages[0] || processImageSrc(p.image) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';

  return {
    ...p,
    discount,
    brand,
    rating,
    reviewCount,
    stockStatus,
    sku,
    description,
    images: processedImages,
    image: mainImage,
    features,
    specifications,
    variants
  };
};

export const productService = {
  // Fetch all products
  async getProducts() {
    try {
      const response = await api.get('/products');
      const data = response.data?.products || response.data || [];
      return data.map(p => enrichProduct(p));
    } catch (err) {
      console.error('Axios API connection failed fetching products:', err.message);
      throw err;
    }
  },

  // Fetch product by ID
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      const data = response.data?.product || response.data;
      return enrichProduct(data);
    } catch (err) {
      console.error(`Axios API connection failed fetching product by ID: ${id}`, err.message);
      throw err;
    }
  }
};
