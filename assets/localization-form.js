if (!customElements.get("localization-form")) {
  customElements.define(
    "localization-form",
    class LocalizationForm extends HTMLElement {
      constructor() {
        super();
        this.elements = {
          input: this.querySelector(
            'input[name="locale_code"], input[name="country_code"]',
          ),
          button: this.querySelector("button"),
          panel: this.querySelector(".disclosure__list-wrapper"),
        };
        this.elements.button.addEventListener(
          "click",
          this.openSelector.bind(this),
        );
        this.elements.button.addEventListener(
          "focusout",
          this.closeSelector.bind(this),
        );
        this.addEventListener("keyup", this.onContainerKeyUp.bind(this));

        this.elements.searchInput = this.querySelector(
          ".disclosure__search-input",
        );
        if (this.elements.searchInput) {
          this.elements.searchInput.addEventListener(
            "input",
            this.filterCountries.bind(this),
          );
          this.elements.searchInput.addEventListener("click", (e) =>
            e.stopPropagation(),
          );
        }

        this.querySelectorAll("a").forEach((item) =>
          item.addEventListener("click", this.onItemClick.bind(this)),
        );
      }

      hidePanel() {
        this.elements.button.setAttribute("aria-expanded", "false");
        this.elements.panel.setAttribute("hidden", true);
      }

      onContainerKeyUp(event) {
        if (event.code.toUpperCase() !== "ESCAPE") return;

        this.hidePanel();
        this.elements.button.focus();
      }

      onItemClick(event) {
        event.preventDefault();
        const form = this.querySelector("form");
        const clickedItem = event.currentTarget;
        this.elements.input.value = clickedItem.dataset.value;
        if (form) {
          // Show loading state on button
          this.elements.button.classList.add("loading");
          const buttonSpan = this.elements.button.querySelector("span");
          if (buttonSpan) buttonSpan.style.opacity = "0.5";

          // Show loading state on clicked item
          clickedItem.classList.add("loading");

          form.submit();
        }
      }

      openSelector() {
        this.elements.button.focus();
        const isOpening = this.elements.panel.hasAttribute("hidden");
        this.elements.panel.toggleAttribute("hidden");
        this.elements.button.setAttribute(
          "aria-expanded",
          isOpening.toString(),
        );

        if (isOpening && this.elements.searchInput) {
          setTimeout(() => this.elements.searchInput.focus(), 100);
        }
      }

      filterCountries(event) {
        const searchTerm = event.target.value.toLowerCase();
        const items = this.querySelectorAll(
          ".disclosure__item:not(.disclosure__no-results)",
        );
        const noResults = this.querySelector(".disclosure__no-results");
        let foundCount = 0;

        items.forEach((item) => {
          const text = item.textContent.toLowerCase();
          if (text.includes(searchTerm)) {
            item.classList.remove("hidden");
            foundCount++;
          } else {
            item.classList.add("hidden");
          }
        });

        if (noResults) {
          noResults.classList.toggle("hidden", foundCount > 0);
        }
      }

      closeSelector(event) {
        const isChild =
          this.elements.panel.contains(event.relatedTarget) ||
          this.elements.button.contains(event.relatedTarget);
        if (!event.relatedTarget || !isChild) {
          this.hidePanel();
        }
      }
    },
  );
}
