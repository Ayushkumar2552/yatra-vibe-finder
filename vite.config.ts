import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { nitro } from 'nitro/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  resolve: { dedupe: ['react', 'react-dom', '@tanstack/react-query', '@tanstack/query-core'] },
  plugins: [
    tailwindcss(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tanstackStart({
      server: { entry: 'server' },
      importProtection: { behavior: 'error', client: { files: ['**/server/**'], specifiers: ['server-only'] } },
    }),
    ...(command === 'build' ? [nitro({ preset: process.env.DEPLOY_TARGET === 'render' ? 'node-server' : 'cloudflare-module' })] : []),
    react(),
  ],
}));
