import {test} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';
register('./three-loader.mjs',import.meta.url);
const T=await import('../vendor/three.module.js');
const {createWorld}=await import('../src/world.js');
// A texture drawing stub permits testing scene geometry without a browser/GPU.
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},strokeRect(){},fillText(){}})})};
const scene=new T.Scene();const world=createWorld(scene);
test('City includes a two floor home, four staffed shops, traffic, and pedestrians',()=>{assert.equal(world.buildings.length,25);assert.equal(world.shops.length,4);assert.equal(world.home.height,7);assert.equal(world.npcs.length,18);assert.equal(world.traffic.length,8);assert.ok(world.interactives.some(t=>t.action==='sleep'&&t.pos.y>3));assert.ok(world.interactives.some(t=>t.action==='dress'));assert.equal(world.interactives.filter(t=>t.action==='pickup').length,4);});
test('Every building entrance becomes traversable after its door opens',()=>{for(const b of world.buildings){const doorSolid=world.solids.find(s=>s.x===b.door.x&&s.z===b.door.z&&s.w===b.door.width);assert.ok(doorSolid);assert.ok(doorSolid.enabled());b.door.open=true;}world.update(1,1,{x:0,z:14});for(const b of world.buildings){const blocked=world.solids.some(s=>s.enabled()&&s.min<1.5&&s.max>.2&&Math.abs(b.x-s.x)<s.w/2+.28&&Math.abs(b.z+6-s.z)<s.d/2+.28);assert.equal(blocked,false,b.name);}});
test('Each residential house has a bell and an eating interaction',()=>{const houses=world.buildings.filter(b=>b.shop<0);assert.equal(world.interactives.filter(t=>t.action==='bell').length,houses.length);assert.equal(world.interactives.filter(t=>t.action==='eat').length,houses.length);});
test('All generated geometry and animation transforms remain finite',()=>{world.update(.016,2,{x:0,z:0});let meshes=0;scene.traverse(m=>{if(m.isMesh){meshes++;assert.ok([m.position.x,m.position.y,m.position.z,m.rotation.x,m.rotation.y,m.rotation.z].every(Number.isFinite));const a=m.geometry.attributes.position;for(let i=0;i<a.array.length;i++)assert.ok(Number.isFinite(a.array[i]));}});assert.ok(meshes>50);assert.ok(meshes<1200,`Expected batched static world, found ${meshes} meshes`);});
