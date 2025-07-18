import { ProcessedGameEntry } from "./types.interface";

export interface IndexedEntry {
  id: string;
  page_nr: number;
  searchableText: string; // Combined searchable fields
  filters: {
    genres: string[];
  };
}

export class IndexedDataGenerator {
  public generateIndexedData(pages: ProcessedGameEntry[][]): IndexedEntry[] {
    return pages
      .map((entries, pageIndex) =>
        entries.map((entry) => ({
          id: entry.id,
          page_nr: pageIndex + 1,
          searchableText: this.createSearchableText(entry),
          filters: this.extractFilters(entry),
        }))
      )
      .flat();
  }

  private createSearchableText(entry: ProcessedGameEntry): string {
    // Combine all searchable fields into one string
    const searchFields = [
      entry.title,
      entry.description,
      // entry.genres?.join(' '),
    ].filter(Boolean);

    return searchFields.join(" ").toLowerCase();
  }

  private extractFilters(entry: ProcessedGameEntry): IndexedEntry["filters"] {
    return {
      genres: entry.genres,
    };
  }
}
