<script>
  import { onMount } from "svelte";
  import { Sun, Moon, Github } from "lucide-svelte";
  let dark = false;

  onMount(() => {
    dark =
      document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: white)").matches;
    if (dark) document.documentElement.classList.add("dark");
  });

  function toggleTheme() {
    dark = !dark;
    document.documentElement.classList.toggle("dark", dark);
  }
</script>

<header class="bg-white border-b dark:bg-gray-800">
  <div class="max-w-screen-xl mx-auto flex items-center justify-between p-4">
    <span class="flex items-center space-x-2">
      <img src="pheno-ranker-favicon-2x.png" alt="logo" class="h-8 w-8" />
      <span class="text-lg font-semibold whitespace-nowrap"
        >Pheno-Ranker Use Cases Playground</span
      >
    </span>
    <div class="flex items-center space-x-4">
      <button
        on:click={toggleTheme}
        aria-label="Toggle dark mode"
        class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {#if dark}
          <Sun class="w-5 h-5" />
        {:else}
          <Moon class="w-5 h-5" />
        {/if}
      </button>
      <a
        href="https://github.com/CNAG-Biomedical-Informatics/sql.js-httpvfs-playground"
        target="_blank"
        aria-label="Go to repository"
        class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Github class="w-5 h-5" />
      </a>
    </div>
  </div>
</header>
