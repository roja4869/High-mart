import fs from 'fs';
import path from 'path';

const rootDir = path.resolve('..');
const targetDir = path.resolve('.');

console.log('--- Duplicates Cleanup Script Start ---');
console.log('Root:', rootDir);
console.log('Target:', targetDir);

// 1. Recursive copy function with comparison
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    for (const file of files) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    // If destination exists, compare contents
    if (fs.existsSync(dest)) {
      const srcBuf = fs.readFileSync(src);
      const destBuf = fs.readFileSync(dest);
      if (srcBuf.equals(destBuf)) {
        // Identical, skip
        return;
      }
      
      // If different, preserve the one in High-mart (dest) as it is the edited active version
      const isDestInTarget = dest.startsWith(targetDir);
      if (isDestInTarget) {
        console.log(`Preserving edited version in target: ${path.relative(targetDir, dest)}`);
        return;
      }
    }
    
    // Copy file
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${path.relative(rootDir, src)} -> ${path.relative(targetDir, dest)}`);
  }
}

// 2. Safe recursive delete function
function deleteRecursive(itemPath) {
  if (!fs.existsSync(itemPath)) return;

  const stat = fs.lstatSync(itemPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(itemPath);
    for (const file of files) {
      deleteRecursive(path.join(itemPath, file));
    }
    fs.rmdirSync(itemPath);
  } else {
    fs.unlinkSync(itemPath);
  }
}

try {
  // A. Copy root-level .vite to High-mart/.vite
  console.log('\nComparing and merging .vite folder...');
  copyRecursive(path.join(rootDir, '.vite'), path.join(targetDir, '.vite'));

  // B. Copy root-level backend to High-mart/backend
  console.log('\nComparing and merging backend folder...');
  copyRecursive(path.join(rootDir, 'backend'), path.join(targetDir, 'backend'));

  // C. Delete the root-level duplicate .vite and backend folders
  console.log('\nDeleting root duplicates...');
  const rootDuplicates = ['.vite', 'backend'];
  for (const item of rootDuplicates) {
    const fullPath = path.join(rootDir, item);
    if (fs.existsSync(fullPath)) {
      console.log(`Deleting root duplicate folder: ${item}`);
      deleteRecursive(fullPath);
    }
  }

  // D. Delete the previous consolidate_folders.js script if present to keep it clean
  const oldScriptPath = path.join(targetDir, 'consolidate_folders.js');
  if (fs.existsSync(oldScriptPath)) {
    fs.unlinkSync(oldScriptPath);
  }

  console.log('\n--- Cleanup Script Finished Successfully! ---');
} catch (err) {
  console.error('Error during cleanup:', err);
  process.exit(1);
}
