import fs from "node:fs";
import path from "node:path";

import type { ProcessedGameEntry } from "./types.interface";
import { ImageCache } from "./utils/imageUtils";
import { Paginator } from "./utils/pagination";
import { DataFetcher } from "./fetchData";
import { IndexedDataGenerator } from "./IndexDataGenerator";

export class StaticSiteGenerator {
  private imageCache: ImageCache;
  private paginator: Paginator<ProcessedGameEntry>;
  private dataFetcher: DataFetcher;
  private distDir: string;

  constructor(dataUrl: string, distDir: string = "./dist") {
    this.imageCache = new ImageCache();
    this.paginator = new Paginator({ entriesPerPage: 12 });
    this.dataFetcher = new DataFetcher(dataUrl);
    this.distDir = distDir;
    this.ensureDistDirectory();
  }

  private ensureDistDirectory(): void {
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true });
    }
    if (!fs.existsSync(path.join(this.distDir, "data"))) {
      fs.mkdirSync(path.join(this.distDir, "data"), { recursive: true });
    }
  }

  public async build(): Promise<void> {
    console.log("🚀 Starting static site generation...");

    // Step 1: Fetch data
    const gameEntries = await this.dataFetcher.fetchGameData();

    // Step 2: Process all entries (download and convert images)
    console.log("📥 Processing images...");
    const processedEntries: ProcessedGameEntry[] = [];

    for (let i = 0; i < gameEntries.length; i++) {
      const entry = gameEntries[i];
      try {
        const processed = await this.imageCache.processEntry(entry);
        if (processed) {
          processedEntries.push(processed);
        }
      } catch (error) {
        console.error(`Failed to process entry ${entry.torrent_id}:`, error);
      }
      // TESTING
      //if (i > 1000) break;
    }

    console.log(
      `✅ Successfully processed ${processedEntries.length}/${gameEntries.length} entries`
    );

    // Step 3: Generate paginated data files
    console.log("📄 Generating page data files...");
    const pages = this.paginator.paginate(processedEntries);

    for (let i = 0; i < pages.length; i++) {
      const pageNumber = i + 1;
      const pageData = this.paginator.createPageData(
        processedEntries,
        pageNumber
      );

      const pageFilePath = path.join(
        this.distDir,
        "data",
        `page-${pageNumber}.json`
      );
      fs.writeFileSync(pageFilePath, JSON.stringify(pageData, null, 2));

      console.log(
        `Generated page ${pageNumber} with ${pageData.entries.length} entries`
      );
    }

    // Step 4: Generate search index
    console.log("🔍 Generating search index...");
    const searchIndexGenerator = new IndexedDataGenerator();
    const searchIndex = searchIndexGenerator.generateIndexedData(pages);

    // Save search index
    fs.writeFileSync(
      path.join(this.distDir, "data", "search-index.json"),
      JSON.stringify(searchIndex, null, 2)
    );

    // Step 5: Generate metadata file
    const metadata = {
      totalEntries: processedEntries.length,
      totalPages: pages.length,
      entriesPerPage: this.paginator["config"].entriesPerPage,
      lastGenerated: new Date().toISOString(),
      cacheStats: this.imageCache.getStats(),
    };

    fs.writeFileSync(
      path.join(this.distDir, "data", "metadata.json"),
      JSON.stringify(metadata, null, 2)
    );

    // Step 6: Update cache
    this.imageCache.updateLastFetch();

    console.log("✅ Static site generation complete!");
    console.log(
      `📊 Generated ${pages.length} pages with ${processedEntries.length} entries`
    );
    console.log(
      `💾 Cache stats: ${metadata.cacheStats.totalImages} images, ${metadata.cacheStats.cacheSize}`
    );
  }
}
