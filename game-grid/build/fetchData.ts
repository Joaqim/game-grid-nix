import { fileURLToPath } from "node:url";
import type { GameEntry } from "./types.interface";
import { readFileSync } from "node:fs";

export class DataFetcher {
  private dataUrl: string;

  constructor(dataUrl: string) {
    this.dataUrl = dataUrl;
  }

  public async fetchGameData(): Promise<GameEntry[]> {
    try {
      console.log("Fetching game data from:", this.dataUrl);
      if (this.dataUrl.startsWith("file://")) {
        this.dataUrl = fileURLToPath(this.dataUrl);
        return JSON.parse(readFileSync(this.dataUrl, "utf-8")) as GameEntry[];
      }
      const response = await fetch(this.dataUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as GameEntry[];
      console.log(`Fetched ${data.length} game entries`);

      return data;
    } catch (error) {
      console.error("Error fetching game data:", error);
      throw error;
    }
  }
}
