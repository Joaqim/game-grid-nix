import { Card, AppState } from "../types/interfaces";
import { DOMUtils } from "../utils/domUtils";

/**
 * Manages modal functionality
 */
export class ModalManager {
  private state: AppState;

  constructor(state: AppState) {
    this.state = state;
    this.setupEventListeners();
  }

  /**
   * Opens modal with card data
   */
  openModal(index: number): void {
    this.state.currentCardIndex = index;
    const modal = DOMUtils.getElementById<HTMLDivElement>("modal");
    const card = this.state.cardData[index];

    if (!modal || !card) return;

    // Populate modal content
    const modalImage = DOMUtils.getElementById<HTMLImageElement>("modal-image");
    const modalOverlayImage = DOMUtils.getElementById<HTMLImageElement>(
      "modal-overlay-image"
    );
    const modalTitle =
      DOMUtils.getElementById<HTMLHeadingElement>("modal-title");
    const modalLink = DOMUtils.getElementById<HTMLAnchorElement>("modal-link");
    const modalDescription =
      DOMUtils.getElementById<HTMLParagraphElement>("modal-description");
    const modalContent =
      DOMUtils.getElementById<HTMLDivElement>("modal-content");

    if (modalImage)
      modalImage.src = `data:image/png;base64,${card.hero_img_base64}`;
    if (modalOverlayImage)
      modalOverlayImage.src = `data:image/png;base64,${card.hero_img_base64}`;
    if (modalTitle) modalTitle.textContent = card.title;
    if (modalLink)
      modalLink.href = `magnet:?xt=urn:btih:${card.info_hash}&dn=${card.title_text}`;
    if (modalDescription) modalDescription.textContent = card.description;
    if (modalContent) modalContent.innerHTML = card.content || "";

    // Create tags
    const metaDiv = DOMUtils.getElementById<HTMLDivElement>("modal-meta");
    if (metaDiv) {
      metaDiv.innerHTML = "";
      card.genres.forEach((tag) => {
        const tagElement = document.createElement("span");
        tagElement.className = "modal-tag";
        tagElement.textContent = tag;
        metaDiv.appendChild(tagElement);
      });
    }

    // Show modal
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Update navigation arrows
    this.updateNavigation();
  }

  /**
   * Closes the modal
   */
  closeModal(): void {
    const modal = DOMUtils.getElementById<HTMLDivElement>("modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  }

  /**
   * Navigate to next card
   */
  nextCard(): void {
    if (
      this.state.currentCardIndex -
        this.state.cardsPerPage * (this.state.currentPage - 1) <
        this.state.cardsPerPage - 1 &&
      this.state.currentCardIndex < this.state.cardData.length - 1
    ) {
      this.openModal(this.state.currentCardIndex + 1);
    }
  }

  /**
   * Navigate to previous card
   */
  prevCard(): void {
    if (
      this.state.currentCardIndex > 0 &&
      this.state.currentCardIndex < this.state.cardsPerPage
    ) {
      this.openModal(this.state.currentCardIndex - 1);
    }
  }

  /**
   * Updates navigation button states
   */
  private updateNavigation(): void {
    const prevButton =
      DOMUtils.querySelector<HTMLButtonElement>(".nav-arrow.prev");
    const nextButton =
      DOMUtils.querySelector<HTMLButtonElement>(".nav-arrow.next");

    if (prevButton) {
      prevButton.classList.toggle(
        "disabled",
        this.state.currentCardIndex -
          this.state.cardsPerPage * (this.state.currentPage - 1) ===
          0
      );
    }

    if (nextButton) {
      nextButton.classList.toggle(
        "disabled",
        this.state.currentCardIndex === this.state.cardData.length - 1 ||
          this.state.currentCardIndex -
            this.state.cardsPerPage * (this.state.currentPage - 1) ===
            this.state.cardsPerPage - 1
      );
    }
  }

  /**
   * Sets up event listeners for modal functionality
   */
  private setupEventListeners(): void {
    // Close modal when clicking outside
    const modal = DOMUtils.getElementById<HTMLDivElement>("modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      const modal = DOMUtils.getElementById<HTMLDivElement>("modal");
      if (modal?.classList.contains("active")) {
        switch (e.key) {
          case "Escape":
            this.closeModal();
            break;
          case "ArrowRight":
            this.nextCard();
            break;
          case "ArrowLeft":
            this.prevCard();
            break;
        }
      }
    });
  }
}
