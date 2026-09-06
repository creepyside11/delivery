import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Publish only browser assets. The local development server is not a Vercel Function.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const assets = ['index.html', 'style.css', 'src', 'vendor'];
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const asset of assets) {
  await cp(path.join(root, asset), path.join(output, asset), { recursive: true });
}
console.log('Static game built in dist/ (HTML, CSS, game modules and Three.js).');
