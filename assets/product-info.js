if (!customElements.get("product-info")) {
  customElements.define(
    "product-info",
    class ProductInfo extends HTMLElement {
      constructor() {
        super();
        this.input = this.querySelector(".quantity__input");
        this.currentVariant = this.querySelector(".product-variant-id");
        this.variantSelects = this.querySelector("variant-radios");
        this.submitButton = this.querySelector('[type="submit"]');
      }

      cartUpdateUnsubscriber = undefined;
      variantChangeUnsubscriber = undefined;

      connectedCallback() {
        if (!this.input) {
          this.input = this.querySelector('input[name="quantity"]');
        }

        if (this.input) {
          this.quantityForm = this.querySelector(".product-form__quantity");
          if (this.quantityForm) {
            this.setQuantityBoundries();
          }

          this.input.addEventListener("change", () => this.updateSubtotal());
          this.input.addEventListener("input", () => this.updateSubtotal());
        }

        if (!this.dataset.originalSection) {
          this.cartUpdateUnsubscriber = subscribe(
            PUB_SUB_EVENTS.cartUpdate,
            this.fetchQuantityRules.bind(this),
          );
        }
        this.variantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.variantChange,
          (event) => {
            const sectionId = this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section;
            if (event.data.sectionId !== sectionId) return;
            this.updateQuantityRules(event.data.sectionId, event.data.html);
            this.updateSubtotal(event.data.html);
            this.setQuantityBoundries();
          },
        );

        this.updateSubtotal();

        // REMOVED: Aggressive polling was causing 429 errors
        // Apps like Teeinblue should trigger PUB_SUB_EVENTS instead
        // If subtotal doesn't update, use event listeners, not polling
      }

      disconnectedCallback() {
        if (this.cartUpdateUnsubscriber) {
          this.cartUpdateUnsubscriber();
        }
        if (this.variantChangeUnsubscriber) {
          this.variantChangeUnsubscriber();
        }
      }

      setQuantityBoundries() {
        if (!this.input || !this.input.dataset) return;
        const data = {
          cartQuantity: this.input.dataset.cartQuantity
            ? parseInt(this.input.dataset.cartQuantity)
            : 0,
          min: this.input.dataset.min ? parseInt(this.input.dataset.min) : 1,
          max: this.input.dataset.max ? parseInt(this.input.dataset.max) : null,
          step: this.input.step ? parseInt(this.input.step) : 1,
        };

        let min = data.min;
        const max = data.max === null ? data.max : data.max - data.cartQuantity;
        if (max !== null) min = Math.min(min, max);
        if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

        this.input.min = min;
        this.input.max = max;
        if (this.input.value < min) this.input.value = min;
        publish(PUB_SUB_EVENTS.quantityUpdate, undefined);
      }

      fetchQuantityRules() {
        if (!this.currentVariant || !this.currentVariant.value) return;
        const loadingOverlay = this.querySelector(
          ".quantity__rules-cart .loading-overlay",
        );
        if (loadingOverlay) loadingOverlay.classList.remove("hidden");
        fetch(
          `${this.dataset.url}?variant=${this.currentVariant.value}&section_id=${this.dataset.section}`,
        )
          .then((response) => {
            return response.text();
          })
          .then((responseText) => {
            const html = new DOMParser().parseFromString(
              responseText,
              "text/html",
            );
            this.updateQuantityRules(this.dataset.section, html);
            this.updateSubtotal(html);
            this.setQuantityBoundries();
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            if (loadingOverlay) loadingOverlay.classList.add("hidden");
          });
      }

      updateQuantityRules(sectionId, html) {
        const quantityFormUpdated = html.getElementById(
          `Quantity-Form-${sectionId}`,
        );
        if (!quantityFormUpdated || !this.quantityForm) return;

        const selectors = [
          ".quantity__input",
          ".quantity__rules",
          ".quantity__label",
        ];
        for (let selector of selectors) {
          const current = this.quantityForm.querySelector(selector);
          const updated = quantityFormUpdated.querySelector(selector);
          if (!current || !updated) continue;
          if (selector === ".quantity__input") {
            const attributes = [
              "data-cart-quantity",
              "data-min",
              "data-max",
              "step",
            ];
            for (let attribute of attributes) {
              const valueUpdated = updated.getAttribute(attribute);
              if (valueUpdated !== null)
                current.setAttribute(attribute, valueUpdated);
            }
          } else {
            current.innerHTML = updated.innerHTML;
          }
        }
      }

      updateSubtotal(html) {
        if (html) {
          const subtotalUpdated = html.querySelector(".product-subtotal-block");
          const subtotalCurrent = this.querySelector(".product-subtotal-block");
          if (subtotalUpdated && subtotalCurrent) {
            subtotalCurrent.dataset.price = subtotalUpdated.dataset.price;
            subtotalCurrent.dataset.compareAtPrice =
              subtotalUpdated.dataset.compareAtPrice;
          }
        }

        const subtotalBlock = this.querySelector(".product-subtotal-block");
        if (!subtotalBlock) return;

        // Try to find quantity from standard input or fallback
        const qtyInput =
          this.querySelector(".quantity__input") ||
          this.querySelector('input[name="quantity"]');
        const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

        // Update item count
        const itemCountEls = this.querySelectorAll(".js-item-count");
        itemCountEls.forEach((el) => {
          el.textContent = quantity;
        });

        // Try to find actual price from custom_price block (which polls from apps)
        const customPriceEl = document.querySelector(".custom-current-price");
        const customComparePriceEl = document.querySelector(
          ".custom-compare-price",
        );

        let price;
        if (
          customPriceEl &&
          customPriceEl.innerText &&
          customPriceEl.offsetParent !== null
        ) {
          const priceText = customPriceEl.innerText.replace(/[^\d.]/g, "");
          price = Math.round(parseFloat(priceText) * 100);
        } else {
          price = parseInt(subtotalBlock.dataset.price);
        }

        let comparePrice;
        if (
          customComparePriceEl &&
          customComparePriceEl.innerText &&
          customComparePriceEl.offsetParent !== null
        ) {
          const comparePriceText = customComparePriceEl.innerText.replace(
            /[^\d.]/g,
            "",
          );
          comparePrice = Math.round(parseFloat(comparePriceText) * 100);
        } else {
          comparePrice = parseInt(subtotalBlock.dataset.compareAtPrice);
        }

        const moneyFormat = subtotalBlock.dataset.moneyFormat;
        const subtotal = price * quantity;
        const totalCompare = comparePrice * quantity;
        const totalSaving = totalCompare - subtotal;

        // Update Subtotal (top)
        const subtotalValue = this.querySelector('[id^="SubtotalValue-"]');
        if (subtotalValue && !isNaN(subtotal)) {
          subtotalValue.textContent = this.renderMoney(subtotal, moneyFormat);
        }

        // Update Saving
        const savingRow = this.querySelector(".product-subtotal__row--saving");
        const savingValue = this.querySelector('[id^="SavingValue-"]');
        if (savingRow && savingValue) {
          if (totalSaving > 0) {
            savingRow.style.display = "flex";
            savingValue.textContent = this.renderMoney(
              totalSaving,
              moneyFormat,
            );
          } else {
            savingRow.style.display = "none";
          }
        }

        // Update Item Subtotal (bottom)
        const itemSubtotalValue = this.querySelector(
          '[id^="ItemSubtotalValue-"]',
        );
        if (itemSubtotalValue && !isNaN(subtotal)) {
          itemSubtotalValue.textContent = this.renderMoney(
            subtotal,
            moneyFormat,
          );
        }
      }

      renderMoney(cents, format) {
        if (!format) return (cents / 100).toFixed(2);

        let value = (cents / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        if (format.includes("{{amount}}")) {
          return format.replace("{{amount}}", value);
        } else if (format.includes("{{amount_no_decimals}}")) {
          return format.replace(
            "{{amount_no_decimals}}",
            Math.round(cents / 100).toLocaleString("en-US"),
          );
        } else if (format.includes("{{amount_with_comma_separator}}")) {
          return format.replace(
            "{{amount_with_comma_separator}}",
            value.replace(/\./g, ","),
          );
        }

        return value;
      }
    },
  );
}
