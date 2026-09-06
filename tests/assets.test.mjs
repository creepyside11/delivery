import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
test('Entrypoint, import map, and module imports resolve to local shipped files',()=>{const html=readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){assert.ok(existsSync(path.join(root,m[1])),m[1]);}for(const file of ['src/game.js','src/world.js','vendor/three.module.js','vendor/BufferGeometryUtils.js']){const s=readFileSync(path.join(root,file),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');for(const m of s.matchAll(/from\s*['"]([^'"]+)['"]/g)){if(m[1]==='three')continue;assert.ok(existsSync(path.resolve(root,path.dirname(file),m[1])),`${file}: ${m[1]}`);}}assert.ok(!html.includes('https://'));});
test('Every required game UI binding exists in the document',()=>{const html=readFileSync(path.join(root,'index.html'),'utf8'),game=readFileSync(path.join(root,'src/game.js'),'utf8');for(const [,id]of game.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes(`id="${id}"`),id);});
