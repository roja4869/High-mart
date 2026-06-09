import { products } from '../backend/data/mockDb.js';

const resolveSubcatKey = (p) => {
  const name = p.name.toLowerCase();
  const cat = p.category;

  if (cat === 'Fashion') {
    if (p.subCategory === 'Bags' || p.subCategory === 'Watches') {
      return `${p.subCategory} > ${p.gender}`;
    } else if (p.subCategory === 'Accessories') {
      return `${p.subCategory} > ${p.productType}`;
    } else {
      return `${p.subCategory} > ${p.gender} > ${p.productType}`;
    }
  }

  if (cat === 'Electronics') {
    if (name.includes('mobile') || name.includes('phone')) return 'Electronics > Mobiles';
    if (name.includes('laptop')) return 'Electronics > Laptops';
    if (name.includes('tablet')) return 'Electronics > Tablets';
    if (name.includes('headphones') || name.includes('earbuds') || name.includes('headset') || name.includes('soundlink')) return 'Electronics > Headphones';
    if (name.includes('smartwatch') || name.includes('tracker') || name.includes('fitness band') || name.includes('watch') || name.includes('wearable')) return 'Electronics > Smart Watches';
    if (name.includes('camera') || name.includes('dslr') || name.includes('lens')) return 'Electronics > Cameras';
    return 'Electronics > Accessories';
  }

  if (cat === 'Beauty') {
    if (name.includes('shampoo') || name.includes('conditioner') || name.includes('hair')) return 'Beauty > Hair Care';
    if (name.includes('lipstick') || name.includes('mascara') || name.includes('makeup') || name.includes('palette')) return 'Beauty > Makeup';
    if (name.includes('lotion') || name.includes('serum') || name.includes('cleanser') || name.includes('face mask') || name.includes('sunscreen') || name.includes('lip balm') || name.includes('cream')) return 'Beauty > Skincare';
    return 'Beauty > Personal Care';
  }

  if (cat === 'Books') {
    if (name.includes('python') || name.includes('programming') || name.includes('machine learning') || name.includes('algorithms') || name.includes('data science') || name.includes('software') || name.includes('web development') || name.includes('database') || name.includes('architecture') || name.includes('education') || name.includes('textbook')) return 'Books > Education';
    if (name.includes('gatsby') || name.includes('fiction') || name.includes('novel') || name.includes('story') || name.includes('thriller')) return 'Books > Fiction';
    if (name.includes('child') || name.includes('kids') || name.includes('toy') || name.includes('fairy')) return 'Books > Children\'s Books';
    return 'Books > Non-Fiction';
  }

  if (cat === 'Home & Kitchen') {
    if (name.includes('cookware') || name.includes('pan') || name.includes('pot') || name.includes('skillet')) return 'Home & Kitchen > Cookware';
    if (name.includes('chair') || name.includes('desk') || name.includes('table') || name.includes('furniture') || name.includes('stool')) return 'Home & Kitchen > Furniture';
    if (name.includes('lamp') || name.includes('decor') || name.includes('diffuser') || name.includes('vase')) return 'Home & Kitchen > Home Decor';
    if (name.includes('storage') || name.includes('organizer') || name.includes('rack') || name.includes('bin') || name.includes('box')) return 'Home & Kitchen > Storage';
    if (name.includes('cooker') || name.includes('blender') || name.includes('fryer') || name.includes('toaster') || name.includes('coffee maker') || name.includes('microwave') || name.includes('oven')) return 'Home & Kitchen > Appliances';
    return 'Home & Kitchen > Kitchen Essentials';
  }

  if (cat === 'Sports') {
    if (name.includes('dumbbell') || name.includes('fitness band') || name.includes('punching bag') || name.includes('jump rope') || name.includes('yoga mat') || name.includes('treadmill') || name.includes('kettlebell')) return 'Sports > Fitness Equipment';
    if (name.includes('wear') || name.includes('clothing') || name.includes('jersey') || name.includes('shorts') || name.includes('shirt')) return 'Sports > Sports Wear';
    return 'Sports > Outdoor Equipment';
  }

  if (cat === 'Toys') {
    if (name.includes('brick') || name.includes('model kit') || name.includes('educational') || name.includes('stem') || name.includes('blocks')) return 'Toys > Educational Toys';
    if (name.includes('board game') || name.includes('card game') || name.includes('games') || name.includes('puzzle')) return 'Toys > Games';
    return 'Toys > Action Figures';
  }

  if (cat === 'Groceries') {
    if (name.includes('coffee') || name.includes('tea') || name.includes('juice') || name.includes('beverage') || name.includes('drink')) return 'Groceries > Beverages';
    return 'Groceries > Pantry Staples';
  }

  return null;
};

function test() {
  console.log(`Total products to resolve: ${products.length}`);
  const unmapped = [];
  const mappedCounts = {};
  
  products.forEach(p => {
    const key = resolveSubcatKey(p);
    if (!key) {
      unmapped.push(p);
    } else {
      mappedCounts[key] = (mappedCounts[key] || 0) + 1;
    }
  });

  console.log(`Unmapped products: ${unmapped.length}`);
  if (unmapped.length > 0) {
    console.log(unmapped.map(p => `[${p.category}] ${p.name}`));
  }
  
  console.log("\n=== MAPPED COUNTS ===");
  console.log(mappedCounts);
}
test();
