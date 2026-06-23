// Programmatic Generation of 500+ Products across 8 categories with a deep Fashion subcategory tree
const NON_FASHION_CATEGORIES = {
  'Electronics': {
    brands: ['Sony', 'Bose', 'Anker', 'Logitech', 'Samsung', 'Apple', 'VoltVibe', 'Intel'],
    adjectives: ['Wireless', 'Noise-Cancelling', 'Ultra-Slim', 'Ergonomic', 'Pro-Series', 'Bluetooth', 'Smart', 'Rechargeable', 'Portable', 'Hi-Fi'],
    nouns: ['Headphones', 'Speaker', 'Keyboard', 'Mouse', 'Powerbank', 'Earbuds', 'Smartwatch', 'Monitor'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80'
    ],
    prices: [999, 1999, 2999, 4999, 7999, 12999]
  },
  'Groceries': {
    brands: ['Harvest', 'OrganicValley', 'NatureChoice', 'Nestle', 'Quaker', 'SunMaid', 'SimplyPack'],
    adjectives: ['Premium Organic', 'Whole Grain', 'Raw', 'Unsalted', 'Fresh', 'Cold-Brew', 'Gluten-Free', 'Roasted', 'Natural', 'Sweet'],
    nouns: ['Almonds', 'Oats', 'Coffee Beans', 'Honey', 'Tea Bags', 'Olive Oil', 'Granola', 'Maple Syrup'],
    images: [
      'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80',
      'https://images.unsplash.com/photo-1541140111954-75a9e3b08e2f?w=600&q=80',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80'
    ],
    prices: [99, 149, 199, 299, 499, 799]
  },
  'Home & Kitchen': {
    brands: ['ErgoComfort', 'KitchenChef', 'Keurig', 'T-fal', 'Dyson', 'iRobot', 'AnchorHocking'],
    adjectives: ['Ergonomic', 'Non-Stick', 'Smart', 'Adjustable', 'Double-Walled', 'Stainless Steel', 'Breathable', 'Heavy-Duty', 'Compact', 'Ceramic'],
    nouns: ['Office Chair', 'Rice Cooker', 'Cookware Set', 'Water Bottle', 'Desk Lamp', 'Blender', 'Air Fryer', 'Toaster'],
    images: [
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80',
      'https://images.unsplash.com/photo-1544224013-c3b8a1c3e4a2?w=600&q=80'
    ],
    prices: [499, 999, 1499, 2999, 4999, 8999]
  },
  'Beauty': {
    brands: ['AromaBotanicals', 'L\'Oreal', 'CeraVe', 'Neutrogena', 'Clinique', 'Ordinary', 'Dove'],
    adjectives: ['Organic Lavender', 'Moisturizing', 'Hydrating', 'Gentle', 'Sulfate-Free', 'Anti-Aging', 'Clarifying', 'Soothing', 'Exfoliating'],
    nouns: ['Lotion', 'Serum', 'Cleanser', 'Face Mask', 'Sunscreen', 'Shampoo', 'Conditioner', 'Lip Balm'],
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'
    ],
    prices: [199, 299, 499, 799, 1199, 1899]
  },
  'Toys': {
    brands: ['Lego', 'Hasbro', 'Mattel', 'BlockCraft', 'Fisher-Price', 'Nintendo', 'HotWheels'],
    adjectives: ['Educational', 'Interactive', 'STEM', 'Building', 'Creative', 'Colorful', 'Magnetic', 'Wooden', 'Puzzle', 'Classic'],
    nouns: ['Brick Builder', 'Board Game', 'Action Figure', 'Plush Toy', 'Model Kit', 'Card Game', 'Doll', 'Train Set'],
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80'
    ],
    prices: [299, 499, 799, 1299, 1999, 2999]
  },
  'Books': {
    brands: ['CodePress', 'Penguin', 'HarperCollins', 'O\'Reilly', 'Pearson', 'Bantam'],
    adjectives: ['Advanced', 'Masterclass', 'Complete Guide to', 'Introduction to', 'Handbook of', 'Science of', 'History of', 'Art of'],
    nouns: ['Python Programming', 'Machine Learning', 'Algorithms', 'Data Science', 'Software Engineering', 'Web Development', 'Database Systems', 'System Architecture'],
    images: [
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'
    ],
    prices: [199, 299, 399, 499, 699, 999]
  },
  'Sports': {
    brands: ['MatchFit', 'Wilson', 'Everlast', 'Spalding', 'Decathlon', 'Rawlings', 'AdidasSports'],
    adjectives: ['Premium Leather', 'Waterproof', 'Pro-Grade', 'Heavy-Duty', 'Shock-Absorbing', 'Adjustable', 'Lightweight', 'Thermal Bonded'],
    nouns: ['Soccer Ball', 'Basketball', 'Yoga Mat', 'Tennis Racket', 'Dumbbell Set', 'Fitness Band', 'Punching Bag', 'Jump Rope'],
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
      'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=600&q=80',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80'
    ],
    prices: [299, 499, 899, 1499, 2499, 4999]
  }
};

const FASHION_GENERATOR_CONFIG = [
  // 1. Men's Clothing (52 products)
  {
    subCategory: 'Clothing',
    gender: 'Men',
    types: ['T-Shirt', 'Shirt', 'Jeans', 'Trousers', 'Jacket', 'Hoodie'],
    brands: ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Levi\'s', 'Tommy Hilfiger', 'Polo'],
    adjectives: ['Casual Fit', 'Slim Fit', 'Cotton Rich', 'Distressed', 'Lightweight', 'Thermal Fleece', 'Windbreaker', 'Graphic Print'],
    count: 52,
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80'
    ],
    prices: [699, 999, 1499, 1999, 2499, 3499]
  },
  // 2. Women's Clothing (52 products)
  {
    subCategory: 'Clothing',
    gender: 'Women',
    types: ['Saree', 'Kurti', 'Dress', 'Top', 'Jeans', 'Jacket'],
    brands: ['Biba', 'Zara', 'H&M', 'FabIndia', 'W', 'Aurelia', 'Forever 21', 'Allen Solly'],
    adjectives: ['Embroidered Silk', 'Anarkali Cotton', 'Floral Maxi', 'Ruffled', 'High Rise Slim', 'Faux Leather', 'Designer Georgette', 'Casual Solid'],
    count: 52,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80'
    ],
    prices: [899, 1299, 1899, 2499, 3999, 4999]
  },
  // 3. Kids' Clothing (32 products)
  {
    subCategory: 'Clothing',
    gender: 'Kids',
    types: ['Boys Wear', 'Girls Wear', 'School Uniform', 'Party Wear'],
    brands: ['Gini & Jony', 'Lilliput', 'H&M Kids', 'U.S. Polo Kids', 'Mothercare', 'FirstCry'],
    adjectives: ['Super Soft Cotton', 'Embellished', 'Smart Fit Plaid', 'Sparkly Tulle', 'Comfort Active', 'Breathable Playground'],
    count: 32,
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80',
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80'
    ],
    prices: [399, 599, 899, 1299, 1799, 2299]
  },
  // 4. Men's Footwear (42 products)
  {
    subCategory: 'Footwear',
    gender: 'Men',
    types: ['Sports Shoes', 'Sneakers', 'Formal Shoes', 'Sandals'],
    brands: ['Nike', 'Adidas', 'Puma', 'Woodland', 'Bata', 'Reebok', 'Red Tape', 'Hush Puppies'],
    adjectives: ['Cushioned Outdoor', 'Classic Canvas', 'Genuine Leather Oxford', 'Comfort Grip', 'Flyknit Running', 'Slip-on Breathable'],
    count: 42,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80'
    ],
    prices: [1299, 1999, 2999, 3999, 5999, 8999]
  },
  // 5. Women's Footwear (42 products)
  {
    subCategory: 'Footwear',
    gender: 'Women',
    types: ['Heels', 'Flats', 'Sneakers', 'Sandals'],
    brands: ['Catwalk', 'Metro', 'Inc.5', 'Zara', 'H&M', 'Puma', 'Bata', 'Aldo'],
    adjectives: ['Stiletto Block', 'Pointed Toe Velvet', 'Glittery Ankle Strap', 'Lace-Up Retro', 'Memory Foam Active', 'Everyday Comfort'],
    count: 42,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
      'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80'
    ],
    prices: [999, 1499, 2299, 2999, 4499, 5999]
  },
  // 6. Kids' Footwear (22 products)
  {
    subCategory: 'Footwear',
    gender: 'Kids',
    types: ['School Shoes', 'Casual Shoes', 'Sports Shoes'],
    brands: ['Bata Kids', 'Crocs Kids', 'Puma Kids', 'Nike Kids', 'Liberty', 'Adidas Kids'],
    adjectives: ['Durable Velcro', 'Light-Up Heel', 'Anti-Slip Playground', 'Waterproof Clog', 'High-Top Skate'],
    count: 22,
    images: [
      'https://images.unsplash.com/photo-1514989940723-e8e5163ccbe8?w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80'
    ],
    prices: [499, 799, 1199, 1599, 1999]
  },
  // 7. Eyewear (32 products)
  {
    subCategory: 'Eyewear',
    gender: 'General', // Rerouted to Men/Women/Kids dynamically in the loop
    types: ['Sunglasses', 'Reading Glasses', 'Computer Glasses', 'Fashion Glasses', 'Protective Glasses'],
    brands: ['Ray-Ban', 'Oakley', 'LensKart', 'Fastrack', 'Vincent Chase', 'Titan Eyeplus'],
    adjectives: ['Polarized Aviator', 'Blue Light Blocking', 'Anti-Glare Clubmaster', 'Retro Round Frame', 'TR90 Flexible'],
    count: 32,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80'
    ],
    prices: [599, 999, 1499, 1999, 2999, 4999]
  },
  // 8. Watches (32 products)
  {
    subCategory: 'Watches',
    gender: 'General', // Rerouted to Men/Women/Kids dynamically in the loop
    types: ['Analog Watch', 'Chronograph Watch', 'Smart Watch'],
    brands: ['Casio', 'Fossil', 'Titan', 'Fastrack', 'Sonata', 'Apple', 'Samsung', 'Noise'],
    adjectives: ['Stainless Steel Chrono', 'Leather Strap Classic', 'Fitness Heart Rate Tracker', 'Water Resistant Sport', 'Minimalist Dial'],
    count: 32,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&q=80',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&q=80'
    ],
    prices: [1499, 2499, 3999, 5999, 9999, 14999]
  },
  // 9. Bags (32 products)
  {
    subCategory: 'Bags',
    gender: 'General', // Rerouted to Men/Women/Kids dynamically in the loop
    types: ['Backpack', 'Handbag', 'Tote Bag', 'Duffle Bag', 'Sling Bag'],
    brands: ['American Tourister', 'Samsonite', 'Caprese', 'Lavie', 'Wildcraft', 'Skybags', 'Lino Perros'],
    adjectives: ['Water-Repellent School', 'Quilted Faux Leather Handbag', 'Canvas Travel Duffle', 'Compact Messenger Sling', 'Utility Laptop Sack'],
    count: 32,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'
    ],
    prices: [799, 1299, 1999, 2799, 3999, 5499]
  },
  // 10. Accessories (52 products)
  {
    subCategory: 'Accessories',
    gender: 'General', // Rerouted dynamically
    types: ['Belt', 'Cap', 'Wallet', 'Jewellery', 'Hair Accessories', 'Scarf'],
    brands: ['Levis', 'Tommy Hilfiger', 'Fastrack', 'Baggit', 'Puma', 'Zara', 'Voylla'],
    adjectives: ['Genuine Leather Belt', 'Snapback Sports Cap', 'RFID Blocking Wallet', 'Silver Plated Pendant', 'Floral Printed Scarf', 'Premium Bow clip'],
    count: 52,
    images: [
      'https://images.unsplash.com/photo-1627124118303-624c8f94e224?w=600&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
      'https://images.unsplash.com/photo-1582142407894-ec85a1268a4e?w=600&q=80'
    ],
    prices: [299, 499, 799, 999, 1499, 1999]
  }
];

const generateProducts = () => {
  const products = [];
  let id = 1;

  // 1. Generate Non-Fashion products (20 per category * 7 categories = 140 products)
  Object.entries(NON_FASHION_CATEGORIES).forEach(([category, meta]) => {
    for (let i = 0; i < 20; i++) {
      const brand = meta.brands[i % meta.brands.length];
      const adj = meta.adjectives[i % meta.adjectives.length];
      const noun = meta.nouns[i % meta.nouns.length];
      const image = meta.images[i % meta.images.length];
      const name = `${brand} ${adj} ${noun}`;

      const priceVal = meta.prices[i % meta.prices.length];
      const discountPercentage = (i % 4 === 0) ? 20 : (i % 3 === 0) ? 15 : (i % 5 === 0) ? 10 : 0;
      const price = parseFloat((priceVal * (1 - discountPercentage / 100)).toFixed(0));

      const ratingOptions = [3.8, 4.0, 4.2, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
      const rating = ratingOptions[i % ratingOptions.length];
      const reviewCount = 10 + (i * 13) % 250;
      const stock = (i % 8 === 0) ? 0 : 5 + (i * 11) % 90;
      const stockStatus = stock === 0 ? 'Out of Stock' : stock <= 8 ? 'Low Stock' : 'In Stock';

      const description = `This premium ${name.toLowerCase()} is designed for durability and high-performance, meeting top-tier specifications in the ${category.toLowerCase()} category.`;
      const features = [
        `Manufactured by certified ${brand} partners`,
        `Includes standard ${brand} warranty`,
        `Fully vetted for safety and environmental guidelines`
      ];

      products.push({
        id: id++,
        name,
        category,
        brand,
        image,
        description,
        price,
        originalPrice: priceVal,
        discount: discountPercentage,
        discountPercentage,
        rating,
        reviewCount,
        stock,
        stockStatus,
        stockCount: stock,
        featured: (i % 5 === 0),
        newArrival: (i % 4 === 0),
        features
      });
    }
  });

  // 2. Generate Fashion products (370 products total structured in nested tree)
  FASHION_GENERATOR_CONFIG.forEach(cfg => {
    for (let i = 0; i < cfg.count; i++) {
      const subCategory = cfg.subCategory;
      const brand = cfg.brands[i % cfg.brands.length];
      const adj = cfg.adjectives[i % cfg.adjectives.length];
      const pType = cfg.types[i % cfg.types.length];
      const image = cfg.images[i % cfg.images.length];

      // Assign gender dynamically if the config requires general distribution
      let gender = cfg.gender;
      if (gender === 'General') {
        const genderOptions = ['Men', 'Women', 'Kids'];
        gender = genderOptions[i % genderOptions.length];
      }

      // Format name
      const name = `${brand} ${adj} ${pType}`;

      const priceVal = cfg.prices[i % cfg.prices.length];
      const discountPercentage = (i % 4 === 0) ? 20 : (i % 3 === 0) ? 15 : (i % 5 === 0) ? 10 : 0;
      const price = parseFloat((priceVal * (1 - discountPercentage / 100)).toFixed(0));

      const ratingOptions = [3.9, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9];
      const rating = ratingOptions[i % ratingOptions.length];
      const reviewCount = 15 + (i * 9) % 350;
      const stock = (i % 12 === 0) ? 0 : 4 + (i * 17) % 80;
      const stockStatus = stock === 0 ? 'Out of Stock' : stock <= 8 ? 'Low Stock' : 'In Stock';

      const description = `This stylish ${name.toLowerCase()} offers standard-setting quality and fit for ${gender.toLowerCase()}'s active lifestyles. Crafted with modern styling, it is a key piece in our ${subCategory.toLowerCase()} collection.`;
      const features = [
        `Sourced from certified organic and recycled materials`,
        `Durable stitching and premium hardware accessories`,
        `Engineered for optimal comfort, breathability, and fit`,
        `Easy-care fabric configurations`
      ];

      products.push({
        id: id++,
        name,
        category: 'Fashion',
        subCategory,
        gender,
        productType: pType,
        brand,
        image,
        description,
        price,
        originalPrice: priceVal,
        discount: discountPercentage,
        discountPercentage,
        rating,
        reviewCount,
        stock,
        stockStatus,
        stockCount: stock,
        featured: (i % 6 === 0),
        newArrival: (i % 5 === 0) || (i < 5),
        features
      });
    }
  });

  return products;
};

export const MOCK_PRODUCTS = generateProducts();
