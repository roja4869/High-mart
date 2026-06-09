import { products } from '../backend/data/mockDb.js';

console.log("Auditing original mockDb.js fashion products for gender/name mismatches...");

let mismatchCount = 0;
products.forEach(p => {
  if (p.category === 'Fashion') {
    const name = p.name.toLowerCase();
    const gender = p.gender;
    
    let expectedGender = null;
    if (/\bwomen's\b/i.test(name)) expectedGender = 'Women';
    else if (/\bmen's\b/i.test(name)) expectedGender = 'Men';
    else if (/\bkids'\b/i.test(name)) expectedGender = 'Kids';
    
    if (expectedGender && gender !== expectedGender) {
      mismatchCount++;
      console.log(`- Mismatch! ID: ${p.id} | Name: "${p.name}" | Gender field: "${gender}" | Expected from Name: "${expectedGender}"`);
    }
  }
});
console.log(`Total gender mismatches found: ${mismatchCount}`);
