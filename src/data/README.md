# Static game data

Static rules content (oracle tables, name lists, aspect data) lives here as JSON modules.

Conventions:

- One file per table or tightly related table group, named after its subject (`yes-no.json`, `subject.json`, `urban-locations.json`).
- Top-level `id` (unique, kebab-case), `title`, `dice` (e.g. `"1d6"`, `"1d100"`, `"2d10"`), and `rows`.
- Rows express ranges as `[min, max]` over the full die span; d100 uses `1`–`100` for `01`–`00`.
- Import directly: `import table from '@/data/example-table.json'`. Vite + `resolveJsonModule` type it automatically.

Replace `example-table.json` with real tables; it exists only to show the shape.
