#!/usr/bin/env -S tsx
/* eslint-disable import/no-extraneous-dependencies */
import esbuild from "esbuild";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import process from "node:process";
import { minify, Options } from "html-minifier-terser";
import { StaticSiteGenerator } from "./build/generatePages";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// Simple function to minimize JSON data
async function minimizeJsonFiles(directory: string) {
  const files = readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    if (path.extname(file) === ".json") {
      try {
        const data = readFileSync(filePath, "utf-8");
        const jsonData = JSON.parse(data);
        const minimizedData = JSON.stringify(jsonData);
        writeFileSync(filePath, minimizedData, "utf-8");
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error);
      }
    }
  }
}

// Custom build process
async function runBuild() {
  const dataUrl = process.env.DATA_URL || `file://${__dirname}/mock/games.json`;
  const distDir = process.env.DIST_DIR || "./dist";

  try {
    const generator = new StaticSiteGenerator(dataUrl, distDir);
    await generator.build();

    // Minimize JSON data
    console.log("🗃️ Minimizing JSON data...");
    await minimizeJsonFiles(path.join(distDir, "data"));
    console.log("✅ Build completed successfully");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

(async () => {
  await mkdir("./dist", { recursive: true }).catch(() => {
    // ignore
  });

  await runBuild();

  esbuild
    .build({
      entryPoints: ["src/styles.css"],
      outfile: "dist/styles.css",
      minify: true,
    })
    .catch(() => process.exit(1));

  const minifyOptions: Options = {
    collapseWhitespace: true,
    keepClosingSlash: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true,
    minifyURLs: true,
  };

  const htmlContent = await readFile("src/index.html", "utf8");
  const minifiedHtml = await minify(htmlContent, minifyOptions);

  await writeFile("dist/index.html", minifiedHtml);
})();
