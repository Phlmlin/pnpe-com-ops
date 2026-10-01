const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // First, let's change text-pnpe-blue to text-pnpe-dark for titles/text
    // because pnpe-blue is now bright blue.
    if (content.includes('text-pnpe-blue')) {
        content = content.replace(/text-pnpe-blue/g, 'text-pnpe-dark');
        changed = true;
    }
    
    // Now replace green with blue for actions
    if (content.includes('pnpe-green')) {
      content = content.replace(/pnpe-green-light/g, 'pnpe-blue-hover');
      content = content.replace(/pnpe-green/g, 'pnpe-blue');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
    }
  }
});
