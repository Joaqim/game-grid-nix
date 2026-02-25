# Simple Game Grid App

A simple reactive web app demonstrating static site generation and efficient cache usage — no React, no framework overhead.

Styling is inspired by [fluent-reader](https://github.com/yang991178/fluent-reader)

## Overview

This repository is a lightweight static site generator that produces a fully reactive web experience using TypeScript and esbuild. It showcases how modern browser APIs and thoughtful caching strategies can deliver a fast, dynamic UI without the weight of a JavaScript framework.

**Key highlights:**

- Static site generation via a custom esbuild pipeline
- Aggressive asset caching with cache-busted output hashes
- Image optimization using `sharp`
- HTML minification via `html-minifier-terser`
- Zero runtime framework dependencies — pure TypeScript compiled to vanilla JS

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Installation

```bash
npm install
```

### Development

Start a local dev server with live rebuilds:

```bash
npm run dev
```

This builds the project in development mode (without a remote data URL) and serves the `dist/` directory on [http://localhost:8080](http://localhost:8080).

To watch for changes without starting a server:

```bash
npm run watch:dev
```

### Production Build

```bash
npm run build
```

Set the `DATA_URL` environment variable to point to your remote data source before building:
See [./games.json](./game-grid/mock/games.json)

```bash
DATA_URL=https://your-data-source.com/api npm run build
```

The build output lands in `dist/`, including `dist/data/metadata.json` which is required for the app to function.

## Project Structure

```shell
.
├── game-grid
│   │── build/            # Custom build scripts (bundling, caching, minification)
│   │── esbuild.ts        # Executes the build pipeline, copies assets
│   ├── dist/             # Build output (generated, not committed)
│   ├── cache/            # Local build cache for fetched assets
│   ├── src/              # Application source
```

## Scripts

| Script | Description |
|---|---|
| `npm run build` | Production build (cleans first, requires `DATA_URL`) |
| `npm run build:dev` | Development build without `DATA_URL` |
| `npm run dev` | Development build + local HTTP server on port 8080 |
| `npm run watch` | Watch mode for production |
| `npm run watch:dev` | Watch mode for development |
| `npm run clean` | Remove the `dist/` directory |
| `npm run test` | Validate that the build output is present |
| `npm run test:build` | Full build + validation |
| `npm run cache:stats` | Print the size of the local asset cache |

## Caching

Build-time fetched assets are stored in a local `cache/` directory to avoid redundant network requests across builds. Check cache size at any time:

```bash
npm run cache:stats
```

The cache directory is safe to delete — it will be repopulated on the next build.

## Modal Navigation

Clicking any card opens a modal with full details including the cover image, description, genres and screenshots. Within the modal, you can move between cards on the current page using the prev/next arrow buttons or the keyboard.

| Action | Result |
|---|---|
| `→` / Next button | Open the next card |
| `←` / Prev button | Open the previous card |
| `Escape` | Close the modal |
| Click outside modal | Close the modal |

Navigation is scoped to the current page — the arrows are disable automatically at the first and last card of each page.

## CI/CD Workflow

The build runs automatically via GitHub Actions in two stages: cache restoration and static site generation.

### Image Cache

Game cover images are cached persistently across runs using `actions/cache@v3`, keyed by a dependency hash. The cache is ~754 MB compressed (~889 MB on disk) and typically restores in around 11 seconds at ~100 MB/s. It currently holds 7,702 images (~429 MB).

### Build

`npm run build` cleans the output directory, fetches ~2,000 game entries from an external API, processes images from the local cache, and generates a fully static site. A typical build produces 167 pages of paginated JSON, a search index, and a single JS/CSS bundle. Individual entry failures are skipped gracefully rather than failing the build.

### Caching Strategy

The image cache persists between runs and only invalidates when dependencies change, so image downloads are a one-time cost per cache key. The cache grows incrementally as new games are added.

### Example Output

```text
🚀 Starting static site generation...
Fetching game data from: ***
Fetched 2000 game entries
📥 Processing images...
✅ Successfully processed 1999/2000 entries
📄 Generating page data files...
🔍 Generating search index...
✅ Static site generation complete!
📊 Generated 167 pages with 1999 entries
💾 Cache stats: 7702 images, 428.80 MB
🗃️ Minimizing JSON data...
✅ Build completed successfully
```

## License

MIT
