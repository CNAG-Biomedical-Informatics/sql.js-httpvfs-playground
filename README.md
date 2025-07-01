# sql.js-httpvfs Playground

`sql.js-httpvfs` is a fork of and wrapper around sql.js to provide a read-only HTTP-Range-request based virtual file system for SQLite. It allows hosting an SQLite database on a static file hoster and querying that database from the browser without fully downloading it.

Provide the URL of any SQLite database file and edit the default SQL Query.

[Read more](https://github.com/phiresky/sql.js-httpvfs)

# To run it locally
1. Clone the repository:
   ```bash
   git clone https://github.com/CNAG-Biomedical-Informatics/sql.js-httpvfs-playground.git
   ```
2. Navigate to the project directory:
   ```bash
   cd sql.js-httpvfs-playground
   nvm use stable
   ```
3. Install the dependencies:
   ```bash
   yarn install
   ```
4. Start the development server:
   ```bash
   yarn dev
   ```