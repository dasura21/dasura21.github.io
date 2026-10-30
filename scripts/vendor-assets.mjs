import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const files = ['LICENSE', 'build/three.module.js', 'examples/jsm/loaders/GLTFLoader.js',
  'examples/jsm/loaders/DRACOLoader.js', 'examples/jsm/controls/OrbitControls.js',
  'examples/jsm/utils/BufferGeometryUtils.js',
  ...['draco_decoder.js', 'draco_wasm_wrapper.js', 'draco_decoder.wasm'].map(n => `examples/jsm/libs/draco/gltf/${n}`)];
for (const file of files) {
  const destination = `vendor/three/${file}`;
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(`node_modules/three/${file}`, destination);
}
console.log('Vendored pinned Three.js and Draco assets.');
