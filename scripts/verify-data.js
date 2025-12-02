// Script to verify data folder exists and is accessible
const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');

console.log('Verifying data folder...');
console.log('Current working directory:', process.cwd());
console.log('Data directory path:', dataDir);
console.log('Data directory exists:', fs.existsSync(dataDir));

if (fs.existsSync(dataDir)) {
  const entries = fs.readdirSync(dataDir, { withFileTypes: true });
  const companies = entries
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
    .map(entry => entry.name);
  
  console.log(`Found ${companies.length} company folders`);
  console.log('Sample companies:', companies.slice(0, 5));
} else {
  console.error('ERROR: Data directory does not exist!');
  process.exit(1);
}

