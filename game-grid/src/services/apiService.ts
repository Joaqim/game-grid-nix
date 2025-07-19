import {
  Card,
  Metadata,
  EntriesResponse,
  SearchIndexEntry,
} from "../types/interfaces";

/**
 * Service class for handling API requests
 */
export class ApiService {
  /**
   * Fetches metadata including total pages and entries per page
   */
  static async fetchMetadata(): Promise<Metadata | null> {
    try {
      const response = await fetch("./data/metadata.json");
      if (!response.ok) {
        throw new Error("Failed to fetch metadata");
      }
      const metadata = (await response.json()) as Metadata;
      console.log("Metadata:", metadata);
      return metadata;
    } catch (error) {
      console.error("Error fetching metadata:", error);
      return null;
    }
  }

  /**
   * Fetches entries for a specific page
   */
  static async fetchEntries(page: number): Promise<Card[]> {
    try {
      const response = await fetch(`./data/page-${page}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch entries for page ${page}`);
      }
      const entriesData = (await response.json()) as EntriesResponse;

      return entriesData.entries.map(
        ({
          id,
          title,
          description,
          genres,
          hero_img_base64,
          info_hash,
          screenshots_base64,
        }) => ({
          id,
          title,
          description,
          genres,
          hero_img_base64,
          info_hash,
          screenshots_base64,
          content:
            screenshots_base64.length > 0
              ? `
            <p><b>Screenshots:</b></p>
            ${screenshots_base64
              .map(
                (base64) =>
                  `<img src="data:image/png;base64,${base64}" alt="${title}">`
              )
              .join("")}
          `
              : "",
        })
      );
    } catch (error) {
      console.error("Error fetching entries:", error);
      return [];
    }
  }

  /**
   * Fetches entries by matching page numbers and IDs
   */
  static async fetchEntriesByMatches(
    matches: Map<number, string[]>
  ): Promise<Card[]> {
    const filteredEntries: Card[] = [];

    // Fetch entries from hinted page numbers
    for (const [page, ids] of matches.entries()) {
      try {
        const response = await fetch(`./data/page-${page}.json`);
        if (!response.ok) {
          throw new Error(`Failed to fetch entries for page ${page}`);
        }
        const entriesData = (await response.json()) as EntriesResponse;
        if (!entriesData || !entriesData.entries) {
          throw new Error(`Failed to fetch entries for page ${page}`);
        }

        const matchedEntries = entriesData.entries.filter((entry) =>
          ids.includes(entry.id)
        );

        filteredEntries.push(...matchedEntries);

        if (filteredEntries.length >= ids.length) {
          break;
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
      }
    }

    return filteredEntries;
  }

  /**
   * Fetches the search index
   */
  static async fetchSearchIndex(): Promise<SearchIndexEntry[]> {
    try {
      const response = await fetch("./data/search-index.json");
      if (!response.ok) {
        throw new Error("Failed to fetch search index");
      }
      const searchIndex = (await response.json()) as SearchIndexEntry[];
      console.log("Search index length:", searchIndex.length);
      return searchIndex;
    } catch (error) {
      console.error("Error fetching search index:", error);
      return [];
    }
  }
}
