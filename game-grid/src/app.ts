import { Card, AppState, SearchFilters } from "./types/interfaces";
import { ApiService } from "./services/apiService";
import { SearchService } from "./services/searchService";
import { DOMUtils } from "./utils/domUtils";
import { ThemeManager } from "./managers/themeManager";
import { ModalManager } from "./managers/modalManager";
import { GlobalInterface } from "./globalInterface";

/**
 * Main application class
 */
export class App {
  private state: AppState;
  private modalManager: ModalManager;
  private debouncedSearch: (...args: any[]) => void;

  constructor() {
    this.state = {
      cardsPerPage: 12,
      totalPages: 1,
      totalEntries: 1,
      currentCardIndex: 0,
      currentPage: 1,
      searchIndex: [],
      cardData: [],
    };

    this.modalManager = new ModalManager(this.state);
    this.debouncedSearch = SearchService.debounce(
      this.executeSearch.bind(this),
      300
    );
    this.setupEventListeners();
  }

  /**
   * Initialize the application
   */
  async init(): Promise<void> {
    this.addSearchBar();
    ThemeManager.initializeTheme();

    // Load search index
    this.state.searchIndex = await ApiService.fetchSearchIndex();

    // Load metadata
    const metadata = await ApiService.fetchMetadata();
    if (metadata) {
      this.state.totalPages = metadata.totalPages;
      this.state.cardsPerPage = metadata.entriesPerPage;
      this.state.totalEntries = metadata.totalEntries;
    }

    await this.renderCards();
  }

  /**
   * Renders cards to the grid
   */
  async renderCards(gameMatches?: Map<number, string[]>): Promise<void> {
    const grid = DOMUtils.querySelector<HTMLDivElement>(".grid");
    if (!grid) return;

    // Fetch card data based on optional provided matches
    if (gameMatches && gameMatches.size > 0) {
      this.state.cardData = await ApiService.fetchEntriesByMatches(gameMatches);
    } else {
      this.state.cardData = await ApiService.fetchEntries(
        this.state.currentPage
      );
    }

    // Create a document fragment to minimize reflows
    const fragment = document.createDocumentFragment();

    // Create or update card elements
    this.state.cardData.forEach((card, index) => {
      // Check if the card already exists in the grid
      let cardElement = grid.querySelector<HTMLDivElement>(
        `.card[data-id="${card.id}"]`
      );

      if (!cardElement) {
        // Create a new card element if it doesn't exist
        cardElement = DOMUtils.createCardElement(
          card,
          index,
          (idx) => this.modalManager.openModal(idx),
          SearchService.trimStartMatches
        );
      }

      // Append the card element to the document fragment
      fragment.appendChild(cardElement);
    });

    // Clear the grid and append the new cards
    grid.innerHTML = "";
    grid.appendChild(fragment);

    this.renderPagination();
  }

  /**
   * Renders pagination controls
   */
  private renderPagination(): void {
    const paginationContainer =
      DOMUtils.getElementById<HTMLDivElement>("pagination");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, this.state.currentPage - halfVisible);
    let endPage = Math.min(
      this.state.totalPages,
      this.state.currentPage + halfVisible
    );

    if (this.state.currentPage <= halfVisible) {
      endPage = Math.min(this.state.totalPages, maxVisiblePages);
    } else if (this.state.currentPage + halfVisible >= this.state.totalPages) {
      startPage = Math.max(1, this.state.totalPages - maxVisiblePages + 1);
    }

    // First page button
    if (startPage > 1) {
      const firstBtn = DOMUtils.createPaginationButton("1", () => {
        this.state.currentPage = 1;
        this.renderCards();
      });
      paginationContainer.appendChild(firstBtn);

      if (startPage > 2) {
        paginationContainer.appendChild(DOMUtils.createPaginationEllipsis());
      }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      const btn = DOMUtils.createPaginationButton(
        i.toString(),
        () => {
          this.state.currentPage = i;
          this.renderCards();
        },
        i === this.state.currentPage
      );
      paginationContainer.appendChild(btn);
    }

    // Last page button
    if (endPage < this.state.totalPages) {
      if (endPage < this.state.totalPages - 1) {
        paginationContainer.appendChild(DOMUtils.createPaginationEllipsis());
      }

      const lastBtn = DOMUtils.createPaginationButton(
        this.state.totalPages.toString(),
        () => {
          this.state.currentPage = this.state.totalPages;
          this.renderCards();
        }
      );
      paginationContainer.appendChild(lastBtn);
    }
  }

  /**
   * Adds search bar to the header
   */
  private addSearchBar(): void {
    const header = DOMUtils.querySelector<HTMLDivElement>(".header");
    if (!header) return;

    const searchInput = DOMUtils.createSearchInput((value) =>
      this.performSearch(value)
    );
    header.appendChild(searchInput);
  }

  /**
   * Performs search with debouncing
   */
  private performSearch(query: string, filters?: SearchFilters): void {
    if (query === "") {
      this.renderCards();
      return;
    }

    this.debouncedSearch(query, filters);
  }

  /**
   * Executes the actual search
   */
  private async executeSearch(
    query: string,
    filters?: SearchFilters
  ): Promise<void> {
    const gameMatches = SearchService.performSearch(
      query,
      this.state.searchIndex,
      filters
    );

    if (gameMatches.size === 0) {
      const grid = DOMUtils.querySelector<HTMLDivElement>(".grid");
      if (grid) {
        grid.innerHTML = "<p>No results found.</p>";
      }
      return;
    }

    await this.renderCards(gameMatches);
  }

  /**
   * Sets up global event listeners
   */
  private setupEventListeners(): void {
    document.addEventListener("DOMContentLoaded", () => {
      this.init();
    });
  }

  /**
   * Exposes theme toggle function globally
   */
  static toggleTheme(): void {
    ThemeManager.toggleTheme();
  }
}

// Create global app instance
const app = new App();
const _globalInterface = new GlobalInterface(app);
