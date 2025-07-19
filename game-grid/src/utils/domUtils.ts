/**
 * Utility functions for DOM manipulation
 */
export class DOMUtils {
  /**
   * Creates a card element from card data
   */
  static createCardElement(
    card: any,
    index: number,
    onCardClick: (index: number) => void,
    trimStartMatches: (str: string, match: string) => string
  ): HTMLDivElement {
    const cardElement = document.createElement("div");
    cardElement.className = "card";
    cardElement.setAttribute("data-id", card.id);
    cardElement.onclick = () => onCardClick(index);

    cardElement.innerHTML = `
        <div class="card-image">
          <img src="data:image/png;base64,${card.hero_img_base64}" alt="${
      card.title
    }">
        </div>
        <div class="card-content">
          <img src="data:image/png;base64,${
            card.hero_img_base64
          }" aria-hidden="true" class="overlay-image">
          <h3 class="card-title">${card.title}</h3>
          <p class="card-description">${
            card.description
              ? trimStartMatches(card.description, `${card.title}:`).trim()
              : ""
          }</p>
          <div class="card-meta">
            ${card.genres
              .map((tag: string) => `<span class="card-tag">${tag}</span>`)
              .join("")}
          </div>
          <div class="card-expanded">
            ${
              card.description && card.content
                ? `<p>${card.content.split("</p>")[0]}</p>`
                : card.content || ""
            }
          </div>
        </div>
      `;

    return cardElement;
  }

  /**
   * Creates a pagination button
   */
  static createPaginationButton(
    text: string,
    onClick: () => void,
    isDisabled: boolean = false
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.innerText = text;
    button.onclick = onClick;
    button.className = "pagination-button";
    button.disabled = isDisabled;
    return button;
  }

  /**
   * Creates a pagination ellipsis
   */
  static createPaginationEllipsis(): HTMLSpanElement {
    const ellipsis = document.createElement("span");
    ellipsis.innerText = "...";
    ellipsis.className = "pagination-ellipsis";
    return ellipsis;
  }

  /**
   * Creates the search input element
   */
  static createSearchInput(onInput: (value: string) => void): HTMLInputElement {
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search games...";
    searchInput.style.marginTop = "10px";
    searchInput.oninput = (e) => onInput((e.target as HTMLInputElement).value);
    return searchInput;
  }

  /**
   * Gets element by ID with type safety
   */
  static getElementById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
  }

  /**
   * Gets element by selector with type safety
   */
  static querySelector<T extends HTMLElement>(selector: string): T | null {
    return document.querySelector(selector) as T | null;
  }

  /**
   * Gets all elements by selector with type safety
   */
  static querySelectorAll<T extends HTMLElement>(
    selector: string
  ): NodeListOf<T> {
    return document.querySelectorAll(selector) as NodeListOf<T>;
  }
}
