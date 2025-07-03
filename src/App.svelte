<script>
  import {
    A,
    Alert,
    Button,
    ButtonGroup,
    Input,
    Label,
    Span,
    Spinner,
  } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { Sheet, FileJson2 } from "lucide-svelte";
  import { CodeJar } from "@novacbn/svelte-codejar";
  import Header from "./Header.svelte";

  import { createDbWorker } from "sql.js-httpvfs";

  import pTime from "p-time";
  import saveAs from "file-saver";

  // @ts-ignore
  import PapaParse from "papaparse";
  import prettyBytes from "pretty-bytes";
  import pluralize from "pluralize";

  import Prism from "prismjs";
  import "prismjs/components/prism-sql";

  import { PowerTable } from "@muonw/powertable";
  import "@muonw/powertable/styles/power-table.scss";
  // import "@muonw/powertable/styles/power-table-mascara.scss";

  let pageSize = "1024"; // Default page size for the database worker
  let sqlQuery = `SELECT * FROM tcga_table LIMIT 20;`;
  let activeTable = "";
  let selectedColumn = "";
  let searchValue = "";
  let dbUrl =
    "https://raw.githubusercontent.com/CNAG-Biomedical-Informatics/cbi-datahub/refs/heads/main/sqlite/tcga.db";

  const highlight = (code, syntax) =>
    Prism.highlight(code, Prism.languages[syntax], syntax);

  const workerUrl = new URL(
    "sql.js-httpvfs/dist/sqlite.worker.js",
    import.meta.url
  );
  const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

  let sqliteFiles = [];
  let activeFile = null;

  let ptOptions = {
    footerText: false,
    footerFilters: false,
    headerText: true,
    headerFilters: false,
    parseAs: "unsafe-html",
  };

  let ptInstructs = [];

  function parseQuery(query = sqlQuery) {
    // extract table name
    const fromMatch = query.match(/from\s+\"?([\w-.]+)\"?/i);
    if (fromMatch) {
      activeTable = fromMatch[1];
    }

    // extract column and search value
    const whereMatch = query.match(
      /where\s+\"?([^\"\s]+)\"?\s*(?:=|like)\s*['"]?%?([^%'";]+)%?['"]?/i
    );
    if (whereMatch) {
      selectedColumn = whereMatch[1];
      searchValue = whereMatch[2];
    } else {
      selectedColumn = "";
      searchValue = "";
    }
  }

  $: parseQuery(sqlQuery);

  function updateSqlQuery() {
    if (!activeTable || !selectedColumn || !searchValue) return;
    const col = ptInstructs.find((c) => c.key === selectedColumn);
    const isNumber = col && /int|real|num|float/i.test(col.valueType);
    const escaped = searchValue.replace(/'/g, "''");
    const clause =
      isNumber && !isNaN(searchValue)
        ? `"${selectedColumn}" = ${Number(searchValue)}`
        : `"${selectedColumn}" LIKE '%${escaped}%'`;
    sqlQuery = `SELECT * FROM "${activeTable}" WHERE ${clause};`;
  }

  function inferColValsType(value) {
    if (!isNaN(value) && value !== "") return "number";
    return "string";
  }

  async function getColumnTypes(table) {
    const { result } = await queryDb(dbUrl, `PRAGMA table_info('${table}')`);
    const types = {};
    result.forEach((col) => {
      types[col.name] = col.type || "";
    });
    return types;
  }

  async function updateInstructs(data, table = activeTable) {
    if (Array.isArray(data) && data.length > 0) {
      const colTypes = await getColumnTypes(table);
      ptInstructs = Object.keys(data[0]).map((key) => ({
        key,
        title: key,
        valueType: colTypes[key] || inferColValsType(data[0][key]),
        ...(key.includes("URL") ? { parseAs: "unsafe-html" } : {}),
      }));
    }
    console.log("ptInstructs: ", ptInstructs);
    return ptInstructs;
  }

  async function getSqliteFiles() {
    const apiUrl =
      "https://api.github.com/repos/CNAG-Biomedical-Informatics/cbi-datahub/contents/sqlite";
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) return [];
      const data = await res.json();
      return data
        .filter(
          (item) =>
            item.type === "file" &&
            (item.name.endsWith(".db") || item.name.endsWith(".sqlite"))
        )
        .map((item) => ({
          name: item.name,
          url:
            item.download_url ||
            `https://raw.githubusercontent.com/CNAG-Biomedical-Informatics/cbi-datahub/main/sqlite/${item.name}`,
        }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async function loadDb(file) {
    dbUrl = file.url;

    // Map of table ➔ custom WHERE clauses
    const exampleQueries = {
      tcga_table: `"TAR-UUID" = '0011a67b-1ba9-4a32-a6b8-7850759a38cf'`,
      omim_table: `"TAR-UUID" = '100100'`,
    };

    const tablesData = await queryDb(
      dbUrl,
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    if (tablesData.result.length) {
      const table = tablesData.result[0].name;
      activeTable = table;
      console.log("Selected table: ", table);

      // Override if this table has a special filter
      if (Object.keys(exampleQueries).includes(table)) {
        console.log("Using example query for table:", table);
        sqlQuery = `SELECT * FROM "${table}" WHERE ${exampleQueries[table]};`;
      } else {
        sqlQuery = `SELECT * FROM "${table}" LIMIT 20;`;
      }

      await runQuery(dbUrl, sqlQuery);
    } else {
      sqlQuery = "";
      result = [];
    }
  }

  onMount(async () => {
    sqliteFiles = await getSqliteFiles();
    if (sqliteFiles.length) {
      await loadDb(sqliteFiles[0]);
    }
  });

  async function queryDb(url = dbUrl, query = sqlQuery) {
    const worker = await createDbWorker(
      [
        {
          from: "inline",
          config: {
            serverMode: "full",
            url,
            requestChunkSize: Number(pageSize),
          },
        },
      ],
      workerUrl.toString(),
      wasmUrl.toString()
    );
    const result = await worker.db.query(query);
    const bytesRead = await worker.worker.bytesRead;
    const stats = await worker.worker.getStats();
    return { result, bytesRead, stats };
  }

  let result;
  let timeTaken;
  let bytesRead;
  let querying = false;
  let error = false;
  let errorMessage = "";
  let jsonFile;
  let totalBytes;
  let totalRequests;

  function runBuilderQuery() {
    if (!activeTable || !selectedColumn || !searchValue) return;

    console.log(
      `Running query on table: ${activeTable}, column: ${selectedColumn}, search value: ${searchValue}`
    );
    const col = ptInstructs.find((c) => c.key === selectedColumn);
    const isNumber = col && /int|real|num|float/i.test(col.valueType);
    let clause;
    if (isNumber && !isNaN(searchValue)) {
      clause = `"${selectedColumn}" = ${Number(searchValue)}`;
    } else {
      const escaped = searchValue.replace(/'/g, "''");
      clause = `"${selectedColumn}" LIKE '%${escaped}%'`;
    }
    sqlQuery = `SELECT * FROM "${activeTable}" WHERE ${clause};`;
    runQuery(dbUrl, sqlQuery);
  }

  async function runQuery(url = dbUrl, query = sqlQuery) {
    result = null;
    querying = true;
    error = false;
    try {
      let queryData = pTime(() => queryDb(url, query));
      let queryPromise = queryData();

      const data = await queryPromise;
      console.log("Query executed: ", query);
      console.log("Query data: ", data);
      console.log("Query result: ", data);

      result = data.result;
      await updateInstructs(result, activeTable);
      timeTaken = queryPromise.time;
      bytesRead = data.bytesRead;
      totalRequests = data.stats.totalRequests;
      totalBytes = data.stats.totalBytes;
      error = false;
      jsonFile = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });
    } catch (queryError) {
      error = true;
      errorMessage = queryError.message;
      console.log("Query Error message: ", errorMessage);
      console.log(queryError);
      await updateInstructs([], activeTable);
      jsonFile = null;
    } finally {
      querying = false;
    }
  }
</script>

<Header />

<main class="lg:pt-4">
  <div class="mx-auto max-w-screen-xl">
    {#if sqliteFiles.length}
      <div class="border-b mb-4">
        <nav class="space-x-4" aria-label="Tabs">
          {#each sqliteFiles as f}
            <button
              class={`font-medium border-b-2 ${
                activeTable.replace(/\_table$/, "") ===
                f.name.replace(/\.db$/, "")
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
              on:click={() => loadDb(f)}
            >
              {f.name.replace(/\.db$/, "").toUpperCase()}
            </button>
          {/each}
        </nav>
      </div>
    {/if}
    <Label>
      <Span>Column</Span>
      <input
        list="columns"
        class="border rounded w-full p-2"
        bind:value={selectedColumn}
        on:input={updateSqlQuery}
      />
      <datalist id="columns">
        {#each ptInstructs as col}
          <option value={col.key} />
        {/each}
      </datalist>
    </Label>
    <Label>
      <Span>Search value</Span>
      <Input type="text" bind:value={searchValue} on:input={updateSqlQuery} />
    </Label>
    <details>
      <summary class="cursor-pointer"
        >Expand to show and modify the SQL query</summary
      >
      <Label>
        <CodeJar bind:value={sqlQuery} syntax="sql" {highlight} />
      </Label>
    </details>
    <Button on:click={() => runQuery()}>
      {#if querying}
        <Spinner /> Querying ...
      {:else}
        Run Query
      {/if}
    </Button>

    {#if result}
      {#if timeTaken}
        <Alert>
          Query took <span class="font-medium">{timeTaken}</span> ms to read
          <span class="font-medium">{prettyBytes(bytesRead)}</span>
          with
          <span class="font-medium">{totalRequests}</span> requests from the
          database of
          <span class="font-medium">{prettyBytes(totalBytes)}</span>, and
          returned
          <span class="font-medium">
            {pluralize("row", result.length, true)}</span
          >
          equivalent to
          <span class="font-medium">{prettyBytes(jsonFile.size)}</span> of JSON.
        </Alert>
      {/if}
      <PowerTable ptData={result} {ptOptions} {ptInstructs} />

      <div class="p-4">
        <ButtonGroup>
          <Button
            on:click={() => {
              const blob = jsonFile;
              saveAs(blob, "result.json");
            }}
          >
            <FileJson2 />
            Download as JSON
          </Button>
          <Button
            on:click={() => {
              const blob = new Blob([PapaParse.unparse(result)], {
                type: "text/csv",
              });
              saveAs(blob, "result.csv");
            }}
          >
            <Sheet />
            Download as CSV
          </Button>
        </ButtonGroup>
      </div>
    {/if}
    {#if error}
      <div class="p-6 mt-2">
        <Alert color="red">
          <span class="font-medium">Error:</span>
          {errorMessage}
        </Alert>
      </div>
    {/if}
  </div>
</main>

<svelte:head>
  <link
    href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.22.0/themes/prism.min.css"
    rel="stylesheet"
  />
</svelte:head>

<footer class="bg-gray-100 text-center py-4 mt-8">
  <span class="text-sm text-gray-600">
    Copyright &copy; 2025
    <A
      href="https://github.com/CNAG-Biomedical-Informatics"
      target="_blank"
      rel="noopener noreferrer"
    >
      CNAG-Biomedical-Informatics
    </A>
    inspired by
    <A
      href="https://github.com/nishad/sql.js-httpvfs-playground"
      target="_blank"
      rel="noopener noreferrer"
      >nishad's sql.js-httpvfs-playground
    </A>
  </span>
</footer>
