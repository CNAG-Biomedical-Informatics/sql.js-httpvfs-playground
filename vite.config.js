import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
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
