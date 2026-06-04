import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Over-Ear ANC Headphones',
    category: 'Electronics',
    brand: 'AudioPhonic',
    price: 129.99,
    originalPrice: 159.99,
    discount: 20,
    rating: 4.9,
    reviewCount: 142,
    stockStatus: 'In Stock',
    stockCount: 45,
    sku: 'EL-HP-0092',
    description: 'Experience pure audio bliss with the AudioPhonic Wireless Over-Ear Headphones. Featuring advanced Active Noise Cancellation (ANC), these headphones block out unwanted ambient sounds, allowing you to focus on your music, podcasts, or calls. Built with plush memory foam ear cushions and an adjustable headband for maximum all-day comfort.',
    features: [
      'Advanced hybrid active noise cancellation (up to 35dB)',
      'High-fidelity 40mm dynamic drivers for deep bass and clear treble',
      'Ultra-long battery life: up to 45 hours of playtime on a single charge',
      'Bluetooth 5.2 connectivity for stable, low-latency audio transmission',
      'Built-in dual microphones with environmental noise reduction for crystal clear calls'
    ],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80'
    ],
    variants: {
      colors: ['#1e293b', '#64748b', '#cbd5e1'],
      storages: []
    },
    specifications: {
      'Brand': 'AudioPhonic',
      'Model': 'ANC-Silence Pro',
      'Dimensions': '7.5 x 6.3 x 3.1 inches',
      'Weight': '250g',
      'Material': 'Polycarbonate & Memory Foam',
      'Warranty': '1 Year Limited Warranty'
    },
    reviews: [
      { id: 101, name: 'David Miller', stars: 5, date: 'May 12, 2026', comment: 'Absolutely amazing sound quality! The active noise cancellation works wonders during my daily metro commute. Battery easily lasts a week.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
      { id: 102, name: 'Jessica Taylor', stars: 5, date: 'Apr 28, 2026', comment: 'Super comfortable! I wear them for 6-8 hours at my desk without any pressure or soreness. Bluetooth pairs instantly with my laptop.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' }
    ]
  },
  {
    id: 2,
    name: 'Minimalist Quartz Leather Watch',
    category: 'Fashion',
    brand: 'ChronoClassic',
    price: 79.99,
    originalPrice: 95.00,
    discount: 15,
    rating: 4.6,
    reviewCount: 88,
    stockStatus: 'In Stock',
    stockCount: 18,
    sku: 'FA-WT-0831',
    description: 'Elevate your daily attire with the ChronoClassic Minimalist Quartz watch. Featuring a sleek, low-profile stainless steel case, a high-durability mineral glass cover, and a genuine calfskin leather strap, this watch exudes timeless sophistication. Precision Japanese quartz movements ensure reliable and accurate tracking.',
    features: [
      'Genuine Italian calfskin leather strap with stainless steel buckle',
      'Scratch-resistant hardened mineral crystal display lens',
      'Water-resistant up to 30 meters (3 ATM) - withstands splashes',
      'Precision Japanese quartz timekeeping mechanism',
      'Sleek 40mm watch dial with clean analog indices'
    ],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
      'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600&q=80',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&q=80'
    ],
    variants: {
      colors: ['#78350f', '#0f172a', '#1e293b'],
      storages: []
    },
    specifications: {
      'Brand': 'ChronoClassic',
      'Model': 'CC-Minimalist-40',
      'Dimensions': 'Dial: 40mm diameter, Strap: 20mm width',
      'Weight': '55g',
      'Material': 'Stainless Steel & Genuine Leather',
      'Warranty': '2 Years Manufacturer Warranty'
    },
    reviews: [
      { id: 103, name: 'Marcus Aurelius', stars: 4, date: 'May 18, 2026', comment: 'Simple, elegant, and keeps perfect time. The leather strap is a bit stiff initially but softens nicely after a few days of wear.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' }
    ]
  },
  {
    id: 3,
    name: 'Smart Fitness Tracker & HR Monitor',
    category: 'Electronics',
    brand: 'FitPulse',
    price: 49.99,
    originalPrice: 65.00,
    discount: 25,
    rating: 4.5,
    reviewCount: 94,
    stockStatus: 'In Stock',
    stockCount: 30,
    sku: 'EL-FT-0044',
    description: 'Track your health and maximize your workouts with the FitPulse Smart Activity Tracker. This sleek band features continuous heart rate tracking, step counts, sleep analysis, and multi-sport workout recording. Keep connected with push notifications for messages and incoming calls directly on the AMOLED screen.',
    features: [
      '24/7 continuous heart rate and blood oxygen monitoring',
      '14 dedicated exercise modes with step and calorie counter metrics',
      'IP68 waterproof rating - suitable for swimming and rain tracking',
      'Bright 1.1-inch color AMOLED touch display',
      'Extended battery: up to 10 days of standby battery life'
    ],
    images: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80',
      'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?w=600&q=80'
    ],
    variants: {
      colors: ['#0f172a', '#e11d48', '#2563eb'],
      storages: []
    },
    specifications: {
      'Brand': 'FitPulse',
      'Model': 'FP-Band-X5',
      'Dimensions': '9.8 x 0.8 x 0.4 inches',
      'Weight': '22g',
      'Material': 'TPU Silicone & Aluminum Case',
      'Warranty': '1 Year Limited Warranty'
    },
    reviews: [
      { id: 104, name: 'Alice Walker', stars: 5, date: 'May 04, 2026', comment: 'Fabulous value for the price. The sleep tracking is very detailed and matches my circadian schedule closely. Very comfortable to wear.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80' }
    ]
  },
  {
    id: 4,
    name: 'Premium Organic Almonds (1kg)',
    category: 'Groceries',
    brand: 'NaturesHarvest',
    price: 14.99,
    originalPrice: 16.65,
    discount: 10,
    rating: 4.8,
    reviewCount: 215,
    stockStatus: 'In Stock',
    stockCount: 150,
    sku: 'GR-AL-1000',
    description: 'Nourish your body with Nature\'s Harvest Premium Raw Organic Almonds. Sourced from sustainable, pesticide-free family orchards in California, these whole almonds are raw, unpasteurized, and full of nutritious dietary fiber, proteins, and heart-healthy monounsaturated fats. Perfect for healthy snacking, baking, or milk creation.',
    features: [
      '100% Certified USDA Organic and Non-GMO Project Verified',
      'Packed in a resealable zip-lock bag to preserve crunch and freshness',
      'Rich source of Vitamin E, magnesium, calcium, and dietary fibers',
      'Perfectly raw and unsalted - no added preservatives or flavor chemicals',
      'Ideal for keto, paleo, and vegan dietary regimens'
    ],
    images: [
      'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80',
      'https://images.unsplash.com/photo-1541140111954-75a9e3b08e2f?w=600&q=80'
    ],
    variants: {
      colors: [],
      storages: []
    },
    specifications: {
      'Brand': 'Nature\'s Harvest',
      'Weight': '1.0kg (2.2 lbs)',
      'Package Type': 'Resealable Zip Bag',
      'Allergen Info': 'Contains Tree Nuts',
      'Origin': 'California, USA',
      'Shelf Life': '12 Months'
    },
    reviews: [
      { id: 105, name: 'Sarah Jenkins', stars: 5, date: 'May 20, 2026', comment: 'Super fresh, crunchy, and absolutely delicious. I use them to make homemade almond butter and it turns out incredibly smooth!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' }
    ]
  },
  {
    id: 5,
    name: 'Ergonomic Adjustable Office Chair',
    category: 'Home & Kitchen',
    brand: 'ErgoComfort',
    price: 149.99,
    originalPrice: 170.00,
    discount: 12,
    rating: 4.8,
    reviewCount: 76,
    stockStatus: 'In Stock',
    stockCount: 12,
    sku: 'HK-OC-0902',
    description: 'Protect your back and boost productivity with the ErgoComfort High-Back Mesh Chair. Engineered with dynamic lumbar tracking, adjustable 3D armrests, and a lockable reclining tension backrest, this chair adapts perfectly to your body posture. The ultra-breathable mesh back ensures constant ventilation.',
    features: [
      'Adaptive lumbar support panel adjusts to your spinal curve',
      'Breathable double-layer mesh backrest for heat dissipation',
      '3D multi-directional armrests adjust in height and angle',
      'Heavy-duty nylon base with smooth, silent caster wheels',
      'SGS-certified Class 4 gas lift cylinder for secure height adjustment'
    ],
    images: [
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&q=80',
      'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=600&q=80'
    ],
    variants: {
      colors: ['#0f172a', '#475569'],
      storages: []
    },
    specifications: {
      'Brand': 'ErgoComfort',
      'Model': 'EC-Pro-Mesh',
      'Dimensions': '26.8 x 26.8 x 46.5 - 50.4 inches',
      'Weight Capacity': '300 lbs (136kg)',
      'Material': 'Nylon, High-Density Mesh & PU Caster Wheels',
      'Warranty': '3 Years Manufacturer Warranty'
    },
    reviews: [
      { id: 106, name: 'Robert Vance', stars: 5, date: 'Apr 24, 2026', comment: 'Saved my posture! Lumbar support is extremely firm but comfortable. Reclining action works beautifully for breaks.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80' }
    ]
  },
  {
    id: 6,
    name: 'Non-Stick Ceramic Cookware Set',
    category: 'Home & Kitchen',
    brand: 'KitchenChef',
    price: 89.99,
    originalPrice: 128.50,
    discount: 30,
    rating: 4.7,
    reviewCount: 65,
    stockStatus: 'Low Stock',
    stockCount: 4,
    sku: 'HK-CW-0467',
    description: 'Upgrade your kitchen setup with the KitchenChef Non-Stick Ceramic Cookware Set. This premium 10-piece set is built with heavy-gauge aluminum for fast and even thermal conduction, finished with a healthy ceramic non-stick coating. Free from PFAS, PFOA, lead, and cadmium for safe family cooking.',
    features: [
      '10-piece set includes frypans, saucepans, casserole pots and matching lids',
      'Eco-friendly healthy ceramic non-stick coating releases food effortlessly',
      'Heavy-gauge aluminum core ensures fast, even heat distributions',
      'Sturdy stainless steel riveted handles wrapped in heat-resistant silicone',
      'Tempered glass lids with steam vent plugs for easy monitoring'
    ],
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80',
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&q=80'
    ],
    variants: {
      colors: ['#0d9488', '#e11d48'],
      storages: []
    },
    specifications: {
      'Brand': 'KitchenChef',
      'Material': 'Aluminum & Ceramic Coating with Tempered Lids',
      'Compatible Cooktops': 'Gas, Electric, Ceramic, Halogen (Not Induction)',
      'Oven Safe': 'Yes, up to 350°F (176°C)',
      'Dishwasher Safe': 'Handwash Recommended for lifespan',
      'Warranty': '1 Year Limited Warranty'
    },
    reviews: [
      { id: 107, name: 'Elena Rostova', stars: 5, date: 'May 10, 2026', comment: 'Fantastic cookware! Food literally slides right off. Extremely easy to wash, and the teal color is beautiful in my kitchen.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' }
    ]
  },
  {
    id: 7,
    name: 'Organic Lavender Soothing Lotion',
    category: 'Beauty',
    brand: 'AromaBotanicals',
    price: 18.99,
    originalPrice: 19.99,
    discount: 5,
    rating: 4.6,
    reviewCount: 118,
    stockStatus: 'In Stock',
    stockCount: 80,
    sku: 'BE-LT-0987',
    description: 'Calm your mind and pamper your skin with AromaBotanicals Organic Lavender Soothing Lotion. Infused with pure organic French lavender essential oils, aloe vera extracts, and organic shea butter, this lotion absorbs quickly without greasy residue. Restores skin moisture barrier.',
    features: [
      'Contains 100% organic French lavender extract and raw shea butter',
      'Paraben-free, sulfate-free, cruelty-free, and vegan formulation',
      'Provides deep hydration for up to 24 hours with non-sticky touch',
      'Relaxes senses for sleep support when applied after evening baths',
      'Dermatologist tested and suitable for sensitive skin types'
    ],
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80'
    ],
    variants: {
      colors: [],
      storages: []
    },
    specifications: {
      'Brand': 'AromaBotanicals',
      'Volume': '400ml (13.5 fl. oz.)',
      'Key Ingredients': 'French Lavender, Aloe Vera, Shea Butter, Jojoba Oil',
      'Skin Type': 'All Skin Types (Ideal for Dry/Sensitive)',
      'Scent': 'Natural Lavender Herbal Scent',
      'Warranty': '100% Satisfaction Guarantee'
    },
    reviews: [
      { id: 108, name: 'Clara Oswald', stars: 5, date: 'May 06, 2026', comment: 'Scent is extremely relaxing and not overpowering. It moisturizes dry elbows and knees wonderfully. Will purchase again.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' }
    ]
  },
  {
    id: 8,
    name: 'Vintage Waterproof Canvas Backpack',
    category: 'Fashion',
    brand: 'UrbanPacker',
    price: 59.99,
    originalPrice: 66.65,
    discount: 10,
    rating: 4.7,
    reviewCount: 54,
    stockStatus: 'In Stock',
    stockCount: 22,
    sku: 'FA-BP-0012',
    description: 'Embark on daily travels with the UrbanPacker Vintage Canvas Backpack. Built with high-density waterproof waxed canvas and detailed with premium full-grain leather straps, this backpack merges classic aesthetics with modern durability. Features padded sleeves for laptops.',
    features: [
      'Heavy-duty waterproof waxed cotton canvas with rust-resistant hardware',
      'Premium full-grain cowhide leather strap closures with magnetic snaps',
      'Padded laptop compartment fits notebooks up to 15.6 inches safely',
      'Large capacity: includes 2 side pockets and 3 front pockets',
      'Breathable mesh padded shoulder straps for carry comfort'
    ],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80'
    ],
    variants: {
      colors: ['#78350f', '#1e293b', '#365314'],
      storages: []
    },
    specifications: {
      'Brand': 'UrbanPacker',
      'Model': 'UP-Vintage-Wax',
      'Dimensions': '17.8 x 12.6 x 5.9 inches',
      'Capacity': '22 Liters',
      'Laptop Compartment': 'Fits up to 15.6" laptop',
      'Warranty': '1 Year Warranty'
    },
    reviews: [
      { id: 109, name: 'Liam Neeson', stars: 5, date: 'May 16, 2026', comment: 'Extremely durable. Canvas is thick and repels rain easily. Pockets are well spaced and hold plenty of gear.', avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&q=80' }
    ]
  },
  {
    id: 9,
    name: 'Kids Educational Toy Brick Builder',
    category: 'Toys',
    brand: 'BlockCraft',
    price: 34.99,
    originalPrice: 39.99,
    discount: 12,
    rating: 4.8,
    reviewCount: 52,
    stockStatus: 'In Stock',
    stockCount: 40,
    sku: 'TY-BB-0731',
    description: 'Unleash your child\'s creativity with the BlockCraft Educational Toy Brick Set. Containing 800 brightly colored ABS bricks in various shapes and sizes, this set encourages fine motor skills, spatial reasoning, and creative play. Includes simple blueprint instructions.',
    features: [
      'Contains 800 premium building bricks compatible with major brand blocks',
      'Made of safe, non-toxic BPA-free ABS plastic with rounded edges',
      'Includes storage container bag and brick separator utility tool',
      'Supports STEM development and hand-eye coordination for ages 4+',
      'Features 12 page build blueprint guide'
    ],
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80'
    ],
    variants: {
      colors: [],
      storages: []
    },
    specifications: {
      'Brand': 'BlockCraft',
      'Model': 'BC-STEM-800',
      'Pieces': '800 Brick Pieces',
      'Age Recommendation': '4 Years and Older',
      'Material': 'BPA-Free Non-Toxic ABS Plastic',
      'Safety Certs': 'ASTM F963-17 & EN71 Standards'
    },
    reviews: [
      { id: 110, name: 'Rebecca Hall', stars: 5, date: 'May 14, 2026', comment: 'My kids spend hours building with these. The plastic is thick and snaps together very firmly. Resealable bucket is great.', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80' }
    ]
  },
  {
    id: 10,
    name: 'High Mart Smart Rice Cooker',
    category: 'Home & Kitchen',
    brand: 'HighMartBrand',
    price: 69.99,
    originalPrice: 99.99,
    discount: 30,
    rating: 4.6,
    reviewCount: 48,
    stockStatus: 'In Stock',
    stockCount: 15,
    sku: 'HK-RC-0441',
    description: 'Perfect fluffy rice is just a button away with the High Mart Smart Rice Cooker. Engineered with micro-computerized Fuzzy Logic technology, this cooker automatically adjusts cooking temperatures and steam timing depending on rice type. Features 6 pre-set program menus.',
    features: [
      'Fuzzy Logic micro-computer adjusts heat curves for optimal rice texture',
      '6 pre-set cooking programs: White Rice, Brown Rice, Porridge, Steam, Soup, Cake',
      'Double-walled non-stick inner cooking pot with water level indices',
      'Keep warm function maintains ideal temperature for up to 12 hours',
      'Includes steamer tray, rice scoop paddle, and liquid measuring cup'
    ],
    images: [
      'https://images.unsplash.com/photo-1544224013-c3b8a1c3e4a2?w=600&q=80',
      'https://images.unsplash.com/photo-1574269661728-79659b722d56?w=600&q=80'
    ],
    variants: {
      colors: ['#ffffff', '#0f172a'],
      storages: []
    },
    specifications: {
      'Brand': 'High Mart Home',
      'Model': 'HM-SmartCook-5L',
      'Capacity': '5 Liters (10 Cups Uncooked)',
      'Power Rating': '860W, 110V',
      'Material': 'Stainless Steel & BPA-Free Plastics',
      'Warranty': '1 Year Replacement Warranty'
    },
    reviews: [
      { id: 111, name: 'Kenji Sato', stars: 5, date: 'May 02, 2026', comment: 'Cooks short-grain sushi rice perfectly. Fuzzy logic is definitely worth it compared to basic toggle cookers. Easy to clean.', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80' }
    ]
  },
  {
    id: 11,
    name: 'Advanced Python Programming Masterclass',
    category: 'Books',
    brand: 'CodePress',
    price: 39.99,
    originalPrice: 49.99,
    discount: 20,
    rating: 4.9,
    reviewCount: 34,
    stockStatus: 'In Stock',
    stockCount: 50,
    sku: 'BK-PY-0824',
    description: 'Take your software development skills to the next level with "Advanced Python Programming Masterclass." Written by industry veterans, this comprehensive textbook explores asynchronous code, design patterns, metaclasses, C-extensions, and scalable API designs with clean execution tips.',
    features: [
      'Covers Python 3.12+ advanced syntax, generators, decorators, and context managers',
      'Detailed chapters on concurrent threads, multiprocessing, and asyncio loops',
      'Hands-on design patterns: Factory, Singleton, Observer, and Repository implementation',
      'Includes online access code for downloadable scripts and project exercises',
      'Structured curriculum suitable for mid-level developers and engineers'
    ],
    images: [
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80'
    ],
    variants: {
      colors: [],
      storages: []
    },
    specifications: {
      'Publisher': 'CodePress Publishing',
      'Author': 'Dr. Alan Turing & team',
      'Pages': '540 Pages (Hardcover)',
      'Language': 'English',
      'ISBN-13': '978-3-16-148410-0',
      'Publication Date': 'January 2026'
    },
    reviews: [
      { id: 112, name: 'Linus Torvalds', stars: 5, date: 'Apr 30, 2026', comment: 'Extremely clear, precise, and covers asynchronous paradigms better than online guides. Highly recommend.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80' }
    ]
  },
  {
    id: 12,
    name: 'Premium Leather Soccer Match Ball',
    category: 'Sports',
    brand: 'MatchFit',
    price: 29.99,
    originalPrice: 35.00,
    discount: 14,
    rating: 4.7,
    reviewCount: 42,
    stockStatus: 'In Stock',
    stockCount: 15,
    sku: 'SP-SB-0082',
    description: 'Deliver championship performance with the MatchFit Soccer Match Ball. Constructed with premium polyurethane leather covers and thermal bonded panels, this size-5 ball guarantees a perfectly spherical shape, minimal water absorption, and stable aerodynamic flight trajectories.',
    features: [
      'Thermal bonded panel panels prevent seams tearing and water absorptions',
      'Premium textured polyurethane leather cover for ultimate ball control',
      'Butyl rubber bladder offers superior air and pressure retention',
      'Official FIFA Size 5 weight and circumference match standards',
      'Distinct bright graphics for clear visibility on turf and grass pitches'
    ],
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
      'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=600&q=80'
    ],
    variants: {
      colors: [],
      storages: []
    },
    specifications: {
      'Brand': 'MatchFit Sports',
      'Size': 'Official Size 5 (Youth/Adult)',
      'Construction': 'Thermal Bonded (32 Panels)',
      'Material': 'PU Leather & Butyl Bladder',
      'Pressure Rating': '8.5 - 15.6 psi',
      'Warranty': '1 Year Shape Retention Guarantee'
    },
    reviews: [
      { id: 113, name: 'Zinedine Zidane', stars: 5, date: 'May 22, 2026', comment: 'Great touch, roundness is consistent, and it doesn\'t absorb water on wet mornings. Top-tier match ball.', avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&q=80' }
    ]
  }
];

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
<<<<<<< HEAD
      const data = response.data.products || response.data || [];
      return data.map(p => enrichProduct(p));
=======
      const data = response.data?.products || response.data || [];
      return data.map(p => {
        let parsedImages = p.images;
        if (typeof p.images === 'string') {
          try {
            parsedImages = JSON.parse(p.images);
          } catch (e) {
            parsedImages = [p.image];
          }
        }
        let parsedFeatures = p.features;
        if (typeof p.features === 'string') {
          try {
            parsedFeatures = JSON.parse(p.features);
          } catch (e) {}
        }
        let parsedVariants = p.variants;
        if (typeof p.variants === 'string') {
          try {
            parsedVariants = JSON.parse(p.variants);
          } catch (e) {}
        }
        let parsedSpecs = p.specifications;
        if (typeof p.specifications === 'string') {
          try {
            parsedSpecs = JSON.parse(p.specifications);
          } catch (e) {}
        }
        return {
          ...p,
          images: parsedImages || [p.image],
          image: p.image || (parsedImages && parsedImages[0]),
          features: parsedFeatures || [],
          variants: parsedVariants || { colors: [], storages: [] },
          specifications: parsedSpecs || {}
        };
      });
>>>>>>> e560612e57e58c71f1b9990edf2b343bfacf1b55
    } catch (err) {
      console.warn('Axios API connection failed, returning fallback products list.', err.message);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(MOCK_PRODUCTS.map(p => enrichProduct(p)));
        }, 600); // Small delay to simulate loading/skeleton
      });
    }
  },

  // Fetch product by ID
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
<<<<<<< HEAD
      const data = response.data.product || response.data;
      return enrichProduct(data);
=======
      const data = response.data?.product || response.data;
      
      let parsedImages = data.images;
      if (typeof data.images === 'string') {
        try {
          parsedImages = JSON.parse(data.images);
        } catch (e) {
          parsedImages = [data.image];
        }
      }
      let parsedFeatures = data.features;
      if (typeof data.features === 'string') {
        try {
          parsedFeatures = JSON.parse(data.features);
        } catch (e) {}
      }
      let parsedVariants = data.variants;
      if (typeof data.variants === 'string') {
        try {
          parsedVariants = JSON.parse(data.variants);
        } catch (e) {}
      }
      let parsedSpecs = data.specifications;
      if (typeof data.specifications === 'string') {
        try {
          parsedSpecs = JSON.parse(data.specifications);
        } catch (e) {}
      }
      
      return {
        ...data,
        images: parsedImages || [data.image],
        image: data.image || (parsedImages && parsedImages[0]),
        features: parsedFeatures || [],
        variants: parsedVariants || { colors: [], storages: [] },
        specifications: parsedSpecs || {}
      };
>>>>>>> e560612e57e58c71f1b9990edf2b343bfacf1b55
    } catch (err) {
      console.warn(`Axios API connection failed, returning fallback product by ID: ${id}`, err.message);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const product = MOCK_PRODUCTS.find(p => p.id === parseInt(id));
          if (product) {
            resolve(enrichProduct(product));
          } else {
            reject(new Error('Product not found in database.'));
          }
        }, 600); // Small delay to simulate loading/skeleton
      });
    }
  }
};
export { MOCK_PRODUCTS };
