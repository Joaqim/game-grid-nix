export interface GameEntry {
  torrent_id: string;
  name: string;
  hero_img: string;
  screenshots: string[];
  description: string | "null";
  genres: string[];
  info_hash: string;
}

export interface ProcessedGameEntry {
  id: string;
  title: string;
  hero_img_base64: string;
  screenshots_base64: string[];
  description: string | null;
  genres: string[];
  info_hash: string;
}

export interface PageData {
  entries: ProcessedGameEntry[];
  page: number;
  totalPages: number;
  totalEntries: number;
}

export interface BuildCache {
  lastFetch: string;
  imageHashes: Record<string, string>; // URL -> hash
  processedEntries: Record<string, ProcessedGameEntry>; // id -> processed entry
}
