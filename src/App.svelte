<script>
  import { Button, ButtonGroup } from "flowbite-svelte";
  import { Spinner, Alert } from "flowbite-svelte";
  import { Heading, P, A } from "flowbite-svelte";
  import { Select, Input, Label, Helper } from "flowbite-svelte";

  import { createDbWorker } from "sql.js-httpvfs";
  import { PowerTable } from "@muonw/powertable";
  import { Sheet, FileJson2 } from "lucide-svelte";

  import pTime from "p-time";
  import saveAs from "file-saver";
  // @ts-ignore
  import PapaParse from "papaparse";
  import prettyBytes from "pretty-bytes";
  import pluralize from "pluralize";

  import { CodeJar } from "@novacbn/svelte-codejar";

  import "@muonw/powertable/styles/power-table.scss";
  // import "@muonw/powertable/styles/power-table-mascara.scss";

  let pageSize = "1024";
  let pageSizes = [
    { value: "512", name: "512" },
    { value: "1024", name: "1024" },
    { value: "2048", name: "2048" },
    { value: "4096", name: "4096" },
    { value: "8192", name: "8192" },
    { value: "16384", name: "16384" },
    { value: "32768", name: "32768" },
  ];
  let sqlQuery = `SELECT * FROM tcga_table WHERE "TAR-UUID" = '0011a67b-1ba9-4a32-a6b8-7850759a38cf';`;
  // let dbUrl = "https://nishad.github.io/sql.js-httpvfs-playground/db/imdb-titles-100000_1024_indexed.db";
  // let dbUrl =
  // "https://cnag-biomedical-informatics.github.io/sql.js-httpvfs-playground/db/tcga.db";
  let dbUrl =
    "https://raw.githubusercontent.com/CNAG-Biomedical-Informatics/cbi-datahub/refs/heads/main/sqlite/tcga.db"
  
  import Prism from "prismjs";
  import "prismjs/components/prism-sql";

  const highlight = (code, syntax) =>
    Prism.highlight(code, Prism.languages[syntax], syntax);

  const workerUrl = new URL(
    "sql.js-httpvfs/dist/sqlite.worker.js",
    import.meta.url
  );
  const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

  let ptOptions = {
    footerText: false,
    footerFilters: false,
    headerText: true,
    headerFilters: false,
    parseAs: "unsafe-html",
  };

  let ptInstructs = [
    { key: "RANK", title: "RANK" },
    { key: "REFERENCE(ID)", title: "REFERENCE(ID)" },
    { key: "TARGET(ID)", title: "TARGET(ID)" },
    // { key: "FORMAT", title: "FORMAT" },
    { key: "LENGTH", title: "LENGTH" },
    // { key: "WEIGHTED", title: "WEIGHTED" },
    { key: "HAMMING-DISTANCE", title: "HAMMING-DISTANCE" },
    { key: "DISTANCE-Z-SCORE", title: "DISTANCE-Z-SCORE" },
    { key: "DISTANCE-P-VALUE", title: "DISTANCE-P-VALUE" },
    { key: "DISTANCE-Z-SCORE(RAND)", title: "DISTANCE-Z-SCORE(RAND)" },
    { key: "JACCARD-INDEX", title: "JACCARD-INDEX" },
    { key: "JACCARD-Z-SCORE", title: "JACCARD-Z-SCORE" },
    { key: "JACCARD-P-VALUE", title: "JACCARD-P-VALUE" },
    { key: "REFERENCE-VARS", title: "REFERENCE-VARS" },
    { key: "TARGET-VARS", title: "TARGET-VARS" },
    { key: "INTERSECT", title: "INTERSECT" },
    { key: "INTERSECT-RATE(%)", title: "INTERSECT-RATE(%)" },
    { key: "COMPLETENESS(%)", title: "COMPLETENESS(%)" },
    { key: "REF-UUID", title: "REF-UUID" },
    { key: "TAR-UUID", title: "TAR-UUID" },
    { key: "REF-UUID-URL", title: "REF-UUID-URL", parseAs: "unsafe-html" },
    { key: "TAR-UUID-URL", title: "TAR-UUID-URL", parseAs: "unsafe-html" },
  ];

  async function queryDb() {
    const worker = await createDbWorker(
      [
        {
          from: "inline",
          config: {
            serverMode: "full",
            url: dbUrl,
            requestChunkSize: Number(pageSize),
          },
        },
      ],
      workerUrl.toString(),
      wasmUrl.toString()
    );
    const result = await worker.db.query(sqlQuery);
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

  async function runQuery() {
    result = null;
    querying = true;
    error = false;
    let queryData = pTime(queryDb)();
    await queryData
      .then((data) => {
        result = data.result;
        timeTaken = queryData.time;
        bytesRead = data.bytesRead;
        totalRequests = data.stats.totalRequests;
        totalBytes = data.stats.totalBytes;
        querying = false;
        error = false;
        jsonFile = new Blob([JSON.stringify(result, null, 2)], {
          type: "application/json",
        });
      })
      .catch((queryError) => {
        error = true;
        errorMessage = queryError.message;
        console.log("Query Error: ", queryError.message);
        console.log(queryError);
        querying = false;
        jsonFile = null;
      });
  }
</script>

<main class="pt-8 pb-12 lg:pt-12 lg:pb-12 bg-white">
  <div class=" px-4 mx-auto max-w-screen-xl">
    <div class="p-8">
      <Heading tag="h2" customeSize="text-4xl font-extrabold "
        >sql.js-httpvfs Playground</Heading
      >
      <P class="my-4 text-gray-500">
        <code>sql.js-httpvfs</code> is a fork of and wrapper around sql.js to provide
        a read-only HTTP-Range-request based virtual file system for SQLite. It allows
        hosting an SQLite database on a static file hoster and querying that database
        from the browser without fully downloading it.</P
      >
      <P class="mb-4"
        >Provide the URL of any SQLite database file and edit the default SQL
        Query.</P
      >
      <A href="https://github.com/phiresky/sql.js-httpvfs"
        >Read more
        <svg
          class="ml-1 w-6 h-6"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          /></svg
        >
      </A>
    </div>

    <div class="p-6">
      <Label class="space-y-2">
        <span>SQLite DB file URL</span>
        <Input type="url" placeholder="" size="md" bind:value={dbUrl} />
      </Label>
      <Label class="space-y-2"
        >Select page size
        <Select class="mt-2" items={pageSizes} bind:value={pageSize} />
      </Label>
    </div>
    <div class="p-6">
      <Label class="space-y-2">
        <span>Edit SQL Query</span>
        <CodeJar bind:value={sqlQuery} syntax="sql" {highlight} />
      </Label>
    </div>
    <div class="p-6">
      <Button on:click={runQuery}>
        {#if querying}
          <Spinner class="mr-3" size="4" color="white" /> Querying ...
        {:else}
          Run Query
        {/if}
      </Button>
    </div>

    {#if result}
      {#if timeTaken}
        <div class="p-6 mt-2">
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
        </div>
      {/if}
      <div class="p-6">
        <div class="MuonW PowerTable">
          <PowerTable
            ptData={result}
            class="text-sm border border-gray-300"
            headerClass="bg-gray-100 text-left font-semibold"
            rowClass="hover:bg-gray-50"
            {ptOptions}
            {ptInstructs}
          />
        </div>
      </div>

      <div class="p-4">
        <ButtonGroup>
          <Button
            color="light"
            size="xs"
            on:click={() => {
              const blob = jsonFile;
              saveAs(blob, "result.json");
            }}
          >
            <FileJson2 />
            Download as JSON
          </Button>
          <Button
            color="light"
            size="xs"
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
