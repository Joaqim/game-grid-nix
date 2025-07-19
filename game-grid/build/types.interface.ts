export interface GameEntry {
  torrent_id: string;
  name: string;
  description?: string | "null";
  genres: string[];
  hero_img: string;
  info_hash: string;
  languages?: string;
  screenshots: string[];
  support_link: string;
  sys_requirements?: string;
  title_text: string;
  total_size?: string;
  version?: string;
  seeders: number;
  leechers: number;
}

export interface ProcessedGameEntry {
  id: string;
  title: string;
  description?: string;
  genres: string[];
  hero_img_base64: string;
  info_hash: string;
  languages?: string;
  screenshots_base64: string[];
  support_link: string;
  sys_requirements?: string;
  title_text: string;
  total_size?: number;
  version?: string;
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
