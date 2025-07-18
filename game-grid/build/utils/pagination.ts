import { PageData } from "../types.interface";

export interface PaginationConfig {
  entriesPerPage: number;
}

export class Paginator<T> {
  private config: PaginationConfig;

  constructor(config: PaginationConfig = { entriesPerPage: 50 }) {
    this.config = config;
  }

  public paginate(items: T[]): T[][] {
    const pages: T[][] = [];
    const { entriesPerPage } = this.config;

    for (let i = 0; i < items.length; i += entriesPerPage) {
      pages.push(items.slice(i, i + entriesPerPage));
    }

    return pages;
  }

  public createPageData(items: T[], pageNumber: number): PageData {
    const pages = this.paginate(items as any);
    const totalPages = pages.length;
    const entries = pages[pageNumber - 1] || [];

    return {
      entries: entries as any,
      page: pageNumber,
      totalPages,
      totalEntries: items.length,
    };
  }
}
