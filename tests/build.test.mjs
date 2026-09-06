import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const config = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'));
execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root });
const output = path.join(root, config.outputDirectory);

test('Vercel publishes the built static game without a backend framework', () => {
  assert.equal(config.framework, null);
  assert.equal(config.buildCommand, 'node scripts/build.mjs');
  assert.deepEqual(readdirSync(output).sort(), ['index.html', 'src', 'style.css', 'vendor']);
  assert.ok(!existsSync(path.join(root, 'server.mjs')));
});

test('Published HTML, game modules and Three.js exactly match the source', () => {
  for (const file of ['index.html', 'style.css', 'src/game.js', 'src/world.js',
    'src/rules.js', 'vendor/three.module.js', 'vendor/three.core.min.js',
    'vendor/BufferGeometryUtils.js']) {
    assert.deepEqual(readFileSync(path.join(output, file)), readFileSync(path.join(root, file)), file);
  }
});

test('Every published module dependency resolves inside the output directory', () => {
  for (const dir of ['src', 'vendor']) {
    for (const name of readdirSync(path.join(output, dir)).filter(name => name.endsWith('.js'))) {
      const file = path.join(output, dir, name);
      const source = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const [, dependency] of source.matchAll(/from\s*['"]([^'"]+)['"]/g)) {
        const resolved = dependency === 'three'
          ? path.join(output, 'vendor/three.module.js')
          : path.resolve(path.dirname(file), dependency);
        assert.ok(resolved.startsWith(output + path.sep), dependency);
        assert.ok(existsSync(resolved), `${dir}/${name}: ${dependency}`);
      }
    }
  }
});
