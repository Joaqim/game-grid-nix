import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { BuildCache, GameEntry, ProcessedGameEntry } from "../types.interface";

export class ImageCache {
  private cacheDir: string;
  private cache!: BuildCache;
  private cacheFile: string;

  constructor(cacheDir: string = "./cache") {
    this.cacheDir = cacheDir;
    this.cacheFile = path.join(cacheDir, "build-cache.json");
    this.ensureDirectories();
    this.loadCache();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    if (!fs.existsSync(path.join(this.cacheDir, "images"))) {
      fs.mkdirSync(path.join(this.cacheDir, "images"), { recursive: true });
    }
  }

  private loadCache(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        this.cache = JSON.parse(fs.readFileSync(this.cacheFile, "utf8"));
      } else {
        this.cache = {
          lastFetch: "",
          imageHashes: {},
          processedEntries: {},
        };
      }
    } catch (error) {
      console.warn("Failed to load cache, starting fresh:", error);
      this.cache = {
        lastFetch: "",
        imageHashes: {},
        processedEntries: {},
      };
    }
  }

  private saveCache(): void {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error("Failed to save cache:", error);
    }
  }

  private getImageHash(url: string): string {
    return createHash("md5").update(url).digest("hex");
  }

  private getImagePath(hash: string): string {
    return path.join(this.cacheDir, "images", `${hash}.jpg`);
  }

  private async downloadImage(url: string): Promise<Buffer | null> {
    try {
      console.log(`Downloading image: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to download ${url}: ${response.status}`);
        return null;
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error(`Error downloading ${url}:`, error);
      return null;
    }
  }

  private async getImageBase64(url: string): Promise<string | null> {
    const hash = this.getImageHash(url);
    const imagePath = this.getImagePath(hash);

    // Check if image exists in cache
    if (fs.existsSync(imagePath)) {
      try {
        const imageBuffer = fs.readFileSync(imagePath);
        return imageBuffer.toString("base64");
      } catch (error) {
        console.error(`Failed to read cached image ${imagePath}:`, error);
      }
    }

    // Download and cache the image
    const imageBuffer = await this.downloadImage(url);
    if (!imageBuffer) {
      return null;
    }

    // Resize the image
    const image = sharp(imageBuffer);
    const resizedImage = image.resize({
      width: 800,
      fit: "contain",
    });
    const imageBufferResized = await resizedImage.toBuffer();

    try {
      fs.writeFileSync(imagePath, imageBufferResized);
      this.cache.imageHashes[url] = hash;
      return imageBufferResized.toString("base64");
    } catch (error) {
      console.error(`Failed to cache image ${imagePath}:`, error);
      return imageBufferResized.toString("base64");
    }
  }

  public async processEntry(
    entry: GameEntry
  ): Promise<ProcessedGameEntry | null> {
    // Check if entry is already processed and cached
    if (this.cache.processedEntries[entry.torrent_id]) {
      //console.log(`Using cached entry: ${entry.torrent_id}`);
      return this.cache.processedEntries[entry.torrent_id];
    }

    //console.log(`Processing entry: ${entry.torrent_id}`);

    // Process hero image
    const heroBase64 = await this.getImageBase64(entry.hero_img);
    if (!heroBase64) {
      console.error(
        `Failed to process hero image for entry ${entry.torrent_id}`
      );
      return null;
    }

    // Process screenshots
    const screenshotsBase64: string[] = [];
    for (const screenshot of entry.screenshots) {
      if (!screenshot) {
        console.warn("Screenshot is null, skipping");
        continue;
      }
      const screenshotBase64 = await this.getImageBase64(screenshot);
      if (screenshotBase64) {
        screenshotsBase64.push(screenshotBase64);
      } else {
        console.warn(
          `Failed to process screenshot ${screenshot} for entry ${entry.torrent_id}`
        );
      }
    }

    const processedEntry: ProcessedGameEntry = {
      id: entry.torrent_id,
      hero_img_base64: heroBase64,
      screenshots_base64: screenshotsBase64,
      title: entry.name,
      description: entry.description === "null" ? null : entry.description,
      genres: entry.genres,
      info_hash: entry.info_hash,
    };

    // Cache the processed entry
    this.cache.processedEntries[entry.torrent_id] = processedEntry;
    this.saveCache();

    return processedEntry;
  }

  public updateLastFetch(): void {
    this.cache.lastFetch = new Date().toISOString();
    this.saveCache();
  }

  public getStats(): { totalImages: number; cacheSize: string } {
    const imageDir = path.join(this.cacheDir, "images");
    let totalImages = 0;
    let totalSize = 0;

    try {
      const files = fs.readdirSync(imageDir);
      totalImages = files.length;

      for (const file of files) {
        const filePath = path.join(imageDir, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }
    } catch (error) {
      console.error("Error calculating cache stats:", error);
    }

    return {
      totalImages,
      cacheSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
    };
  }
}
