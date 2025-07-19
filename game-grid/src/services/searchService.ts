import { SearchIndexEntry, SearchFilters } from "../types/interfaces";

/**
 * Service class for handling search functionality
 */
export class SearchService {
  /**
   * Debounce utility function
   */
  static debounce<T extends (...args: any[]) => void, U>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return function (this: U, ...args: Parameters<T>) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /**
   * Performs search on the search index and returns matching page/ID combinations
   */
  static performSearch(
    query: string,
    searchIndex: SearchIndexEntry[],
    filters?: SearchFilters
  ): Map<number, string[]> {
    const gameMatches = new Map<number, string[]>();

    if (!query && !filters) {
      return gameMatches;
    }

    const results = searchIndex
      .filter((entry) => {
        // Text search
        const matchesQuery =
          !query || entry.searchableText.includes(query.toLowerCase());

        // Filters
        const matchesFilters =
          !filters ||
          Object.keys(filters).every((key) => {
            const filterValue = filters[key];
            const entryValue = entry.filters[key];

            if (Array.isArray(filterValue)) {
              return filterValue.some((val) => entryValue?.includes?.(val));
            }
            return entryValue === filterValue;
          });

        return matchesQuery && matchesFilters;
      })
      // Simple match ranking
      .sort((a, b) => {
        if (!query) return 0;
        const aScore = a.searchableText.split(query.toLowerCase()).length - 1;
        const bScore = b.searchableText.split(query.toLowerCase()).length - 1;
        return bScore - aScore;
      })
      // 12 best candidates
      .slice(0, 12);

    results.forEach((entry) => {
      if (gameMatches.has(entry.page_nr)) {
        gameMatches.get(entry.page_nr)!.push(entry.id);
      } else {
        gameMatches.set(entry.page_nr, [entry.id]);
      }
    });

    return gameMatches;
  }

  /**
   * Helper function to trim start matches from a string
   */
  static trimStartMatches(str: string, match: string): string {
    if (match === "") return str; // avoid infinite loop
    while (str.startsWith(match)) {
      str = str.slice(match.length);
    }
    return str;
  }
}
