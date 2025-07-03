// svelte.config.js
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';

export default /** @type {import('@sveltejs/kit').Config} */({
  kit: {
    adapter: adapter(),
  },
  preprocess: [
    preprocess({ postcss: true })
  ]
});
