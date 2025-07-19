export interface Card {
  id: string;
  title: string;
  description: string;
  genres: string[];
  hero_img_base64: string;
  info_hash: string;
  screenshots_base64: string[];
  content?: string;
}

export interface Metadata {
  totalPages: number;
  entriesPerPage: number;
  totalEntries: number;
}

export interface EntriesResponse {
  entries: Card[];
}

export interface SearchIndexEntry {
  id: string;
  page_nr: number;
  searchableText: string;
  filters: Record<string, any>;
}

export interface SearchFilters {
  [key: string]: string | string[];
}

export interface AppState {
  cardsPerPage: number;
  totalPages: number;
  totalEntries: number;
  currentCardIndex: number;
  currentPage: number;
  searchIndex: SearchIndexEntry[];
  cardData: Card[];
}
