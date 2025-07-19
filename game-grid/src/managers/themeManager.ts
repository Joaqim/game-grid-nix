import { DOMUtils } from "../utils/domUtils";

/**
 * Manages theme switching between light and dark modes
 */
export class ThemeManager {
  /**
   * Toggles between light and dark theme
   */
  static toggleTheme(): void {
    const body = document.body;
    const button = DOMUtils.querySelector<HTMLButtonElement>(".theme-toggle");

    if (!button) return;

    if (body.dataset.theme === "dark") {
      body.dataset.theme = "light";
      button.textContent = "🌙 Dark Mode";
    } else {
      body.dataset.theme = "dark";
      button.textContent = "☀️ Light Mode";
    }
  }

  /**
   * Initializes theme based on system preference
   */
  static initializeTheme(): void {
    const button = DOMUtils.querySelector<HTMLButtonElement>(".theme-toggle");

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.body.dataset.theme = "dark";
      if (button) {
        button.textContent = "☀️ Light Mode";
      }
    }
  }
}
