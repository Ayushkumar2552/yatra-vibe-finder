import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
// Adapt Nitro's Cloudflare Worker output to the Sites deployment layout.
await rm('dist', { recursive: true, force: true });
await mkdir('dist/server', { recursive: true });
await cp('.output/server', 'dist/server', { recursive: true });
await cp('.output/public', 'dist/client', { recursive: true });
await writeFile('dist/server/index.js', 'export { default } from "./index.mjs";\n');
await mkdir('dist/.openai', { recursive: true });
await cp('.openai/hosting.json', 'dist/.openai/hosting.json');
