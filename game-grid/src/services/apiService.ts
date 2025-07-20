import {
  Card,
  Metadata,
  EntriesResponse,
  SearchIndexEntry,
} from "../types/interfaces";
import { fetchAsType } from "../utils/fetchUtils";

/**
 * Service class for handling API requests
 */
export class ApiService {
  /**
   * Fetches metadata including total pages and entries per page
   */
  static async fetchMetadata(): Promise<Metadata | null> {
    try {
      const metadata = fetchAsType<Metadata>("./data/metadata.json");
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
      const entriesData = await fetchAsType<EntriesResponse>(
        `./data/page-${page}.json`
      );

      return entriesData.entries.map(
        ({
          id,
          title,
          description,
          genres,
          hero_img_base64,
          info_hash,
          screenshots_base64,
          sys_requirements,
          title_text,
        }) => ({
          id,
          title,
          description,
          genres,
          hero_img_base64,
          info_hash,
          screenshots_base64,
          title_text,
          content: `
            ${
              sys_requirements
                ? `<p><b>System Requirements:</b> ${sys_requirements}</p>`
                : ""
            }
          ${
            screenshots_base64.length > 0
              ? `
            <p><b>Screenshots:</b></p>
            ${screenshots_base64
              .map(
                (base64) =>
                  `<img src="data:image/png;base64,${base64}" alt="${title}">`
              )
              .join("")}`
              : ""
          }`,
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
        const entriesData = await fetchAsType<EntriesResponse>(
          `./data/page-${page}.json`
        );
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
      const searchIndex = await fetchAsType<SearchIndexEntry[]>(
        "./data/search-index.json"
      );
      console.log("Search index entries:", searchIndex.length);
      return searchIndex;
    } catch (error) {
      console.error("Error fetching search index:", error);
      return [];
    }
  }
}
