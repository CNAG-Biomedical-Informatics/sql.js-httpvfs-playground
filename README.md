# 🧪 CNAG-Biomedical-Informatics SQL.js-HTTPVFS Playground

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://cnag-biomedical-informatics.github.io/sql.js-httpvfs-playground)
[![Deploy Status](https://github.com/CNAG-Biomedical-Informatics/sql.js-httpvfs-playground/actions/workflows/svelte.yml/badge.svg)](https://github.com/CNAG-Biomedical-Informatics/sql.js-httpvfs-playground/actions/workflows/svelte.yml)


This is a fork of [nishad](https://github.com/nishad)’s [sql.js-httpvfs playground](https://github.com/nishad/sql.js-httpvfs-playground).

> 💡 It enables querying an SQLite database **stored on GitHub**, directly in the browser using GitHub Pages — powered by [`sql.js-httpvfs`](https://github.com/phiresky/sql.js-httpvfs), a wrapper around [`sql.js`](https://github.com/sql-js/sql.js).

---

## 🎯 Use Case

This tool lets you explore [Pheno-Ranker](https://github.com/CNAG-Biomedical-Informatics/pheno-ranker) output of:

- 🧬 [OMIM](https://omim.org)
- 🧫 [TCGA](https://www.cancergenomeinterpreter.org/tcga)

on here:
👉 [**cnag-biomedical-informatics.github.io/sql.js-httpvfs-playground**](https://cnag-biomedical-informatics.github.io/sql.js-httpvfs-playground)

The databases are served directly from:  
📁 [CNAG Biomedical Informatics - CBI datahub ](https://github.com/CNAG-Biomedical-Informatics/cbi-datahub/tree/main/sqlite)

---

## 🔄 Key Differences to nishad's Playground

### 🌟 More polished look and feel of the rendered [mounw-powertable](https://github.com/muonw/muonw-powertable/tree/main)

- [Power-table CSS](https://github.com/muonw/muonw-powertable/blob/main/app/src/lib/styles/power-table.scss) enabled
- Clickable links in the table cells

### 🔗 Pre-configured Database URLs
- No need to paste database links — switch between available datasets using **tabs**.

### 🧾 SQL Query Builder
- No SQL skills? No problem! Easily build queries via a **form-based UI**.
- ✍️ The [CodeJar](https://github.com/antonmedv/codejar) editor is **hidden by default** and can be toggled for manual editing.

---

# Authors

## 👤 Humans (at [CNAG](https://www.cnag.eu))
- [Ivo Christopher Leist (ICL)](https://github.com/IvoLeist), PhD student
- [Manuel Rueda (MR)](https://github.com/mrueda), PhD

| Contributions | 👤 |
| --- | --- |
| Creation of this fork | ICL |
| Adaptation to the CNAG use case | ICL, MR |
| Running of Pheno-Ranker and the creation of the SQLite databases | MR |


## 🤖 GenAI tools contributions

| Tool | Contribution |
| --- | --- |
| GitHub Copilot | code completion |
| OpenAI ChatGPT 4o and o4-mini-high | various code suggestions, styling of this README |
| OpenAI Codex (research preview) | [merged PRs](https://github.com/CNAG-Biomedical-Informatics/sql.js-httpvfs-playground/pulls?q=is%3Apr+is%3Aclosed+label%3Acodex++is%3Amerged) |
