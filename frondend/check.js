const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('npx eslint src/Pages/Home.jsx', { encoding: 'utf-8' });
  fs.writeFileSync('output.txt', output);
} catch (e) {
  fs.writeFileSync('output.txt', e.stdout + '\n' + e.stderr);
}
