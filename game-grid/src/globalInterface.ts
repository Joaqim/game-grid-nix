import { App } from "./app";

/**
 * Global interface for exposing functions to HTML
 */
export class GlobalInterface {
  private app: App;

  constructor(app: App) {
    this.app = app;
    this.exposeGlobalFunctions();
  }

  /**
   * Expose all necessary functions to the global window object
   */
  private exposeGlobalFunctions(): void {
    // Theme functions
    (window as any).toggleTheme = () => App.toggleTheme();

    // Modal functions - accessing private modalManager through bracket notation
    (window as any).openModal = (index: number) =>
      (this.app as any).modalManager.openModal(index);

    (window as any).closeModal = () =>
      (this.app as any).modalManager.closeModal();

    (window as any).nextCard = () => (this.app as any).modalManager.nextCard();

    (window as any).prevCard = () => (this.app as any).modalManager.prevCard();

    // Search function
    (window as any).performSearch = (query: string) =>
      (this.app as any).performSearch(query);

    // App reference for advanced usage
    //(window as any).app = this.app;
  }
}
