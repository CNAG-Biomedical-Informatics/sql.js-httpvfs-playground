import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const workerDir = dirname(require.resolve('sql.js-httpvfs/dist/sqlite.worker.js'));
const projectRoot = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    fs: {
      allow: [projectRoot, workerDir],
    },
  },
  // resolve: {
  //   alias: {
  //     '@muonw/powertable': fileURLToPath(new URL('./node_modules/@muonw/powertable/index.js', import.meta.url))
  //   },
  // },
  // optimizeDeps: {
  //   // Don’t let esbuild try to optimize the Lucide package—
  //   // let plugin-svelte handle those .svelte files.
  //   exclude: [
  //     'lucide-svelte',
  //     'flowbite-svelte',
  //     '@novacbn/svelte-codejar',
  //     '@muonw/powertable',
  //   ],
  // },
})
