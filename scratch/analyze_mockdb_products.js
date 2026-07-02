import { products } from '../backend/data/mockDb.js';

console.log(`Total products in mockDb.js: ${products.length}`);

const categoryCounts = {};
const genderCounts = {};
const missingImages = [];
const placeholderImages = [];
const unsplashImages = [];

products.forEach(p => {
  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  if (p.category === 'Fashion') {
    genderCounts[p.gender] = (genderCounts[p.gender] || 0) + 1;
  }
  
  const img = p.image || (p.images && p.images[0]);
  if (!img || img === 'default_product.jpg') {
    missingImages.push(p);
  } else if (!img.startsWith('http')) {
    placeholderImages.push(p);
  } else {
    unsplashImages.push({ id: p.id, name: p.name, image: img });
  }
});

console.log('Category Counts:', categoryCounts);
console.log('Fashion Gender Counts:', genderCounts);
console.log(`Missing images count: ${missingImages.length}`);
console.log(`Placeholder images count: ${placeholderImages.length}`);
console.log(`Unsplash images count: ${unsplashImages.length}`);

if (missingImages.length > 0) {
  console.log('\nSample Missing Images:');
  missingImages.slice(0, 5).forEach(p => console.log(`- ID: ${p.id}, Name: "${p.name}", Cat: ${p.category}, Sub: ${p.subCategory}`));
}

if (placeholderImages.length > 0) {
  console.log('\nSample Placeholder Images:');
  placeholderImages.slice(0, 5).forEach(p => console.log(`- ID: ${p.id}, Name: "${p.name}", Img: "${p.image || p.images[0]}"`));
}
