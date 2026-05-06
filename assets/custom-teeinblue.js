document.addEventListener("DOMContentLoaded", () => {
  const teeGalleryTimeout = setTimeout(() => {
    const teeGallery = document.querySelector(".tee-gallery-content");
    if (teeGallery) {
      teeGallery.style.height = "100%";
    }
    clearTimeout(teeGalleryTimeout);
  }, 2000);

  // === DESKTOP: Scale main mockup to fit slider ===
  // Only targets .tee-gallery (main gallery), NOT mobile configurator or dialog
  function scaleMockups() {
    if (window.innerWidth < 750) return; // skip on mobile
    const gallery = document.querySelector(".tee-gallery:not(.tee-dialog-gallery)");
    if (!gallery) return;
    const slider = gallery.querySelector(".tee-slider");
    if (!slider) return;
    const w = slider.offsetWidth;
    if (w <= 0) return;
    slider.querySelectorAll(".tee-mockup").forEach((m) => {
      const mw = parseFloat(m.style.width) || 648;
      if (mw > 0) m.style.zoom = w / mw;
    });
  }

  setTimeout(scaleMockups, 500);
  setTimeout(scaleMockups, 2000);

  let _rt;
  window.addEventListener("resize", () => { clearTimeout(_rt); _rt = setTimeout(scaleMockups, 150); });

  // Watch for variant/option changes (re-scale when Teeinblue renders new mockup)
  const _root = document.querySelector(".tee-gallery-content, .tee-campaign-container");
  if (_root) {
    new MutationObserver(() => { clearTimeout(_rt); _rt = setTimeout(scaleMockups, 200); })
      .observe(_root, { childList: true, subtree: true, attributeFilter: ["style"] });
  }


  // === TEEINBLUE QUANTITY LIMIT (9999) ===
  // We use event delegation because Teeinblue elements are often added dynamically
  document.addEventListener(
    "input",
    (e) => {
      if (e.target.matches(".tee-quantity input, .tee-quantity-group input")) {
        const val = parseInt(e.target.value);
        if (val > 9999) {
          e.target.value = 9999;
          if (window.showQuantityLimitPopup) window.showQuantityLimitPopup();
          // Trigger change so app state updates
          e.target.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    },
    true,
  );

  document.addEventListener(
    "click",
    (e) => {
      const plusBtn = e.target.closest(".tee-quantity-plus");
      if (plusBtn) {
        const container = plusBtn.closest(".tee-quantity, .tee-quantity-group");
        if (container) {
          const input = container.querySelector("input");
          if (input && parseInt(input.value) >= 9999) {
            if (window.showQuantityLimitPopup) window.showQuantityLimitPopup();
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        }
      }
    },
    true,
  );

  document.addEventListener(
    "keydown",
    (e) => {
      if (
        e.key === "Enter" &&
        e.target.matches(".tee-quantity input, .tee-quantity-group input")
      ) {
        e.preventDefault();
      }
    },
    true,
  );

  // === TEEINBLUE QUANTITY VALIDATION (qty <= 0) ===
  // Intercept Teeinblue's add-to-cart to validate all quantity inputs
  document.addEventListener(
    "click",
    (e) => {
      const addToCartBtn = e.target.closest(
        '.tee-add-to-cart-btn, .tee-btn-add-to-cart, [class*="tee"][class*="add-to-cart"], .tee-submit-btn',
      );
      if (addToCartBtn) {
        const qtyInputs = document.querySelectorAll(
          ".tee-quantity input, .tee-quantity-group input",
        );
        for (const input of qtyInputs) {
          const val = parseInt(input.value);
          if (isNaN(val) || val <= 0) {
            e.preventDefault();
            e.stopImmediatePropagation();
            input.focus();
            if (window.showQuantityMinPopup) window.showQuantityMinPopup();
            return;
          }
        }
      }
    },
    true,
  );

  // Also validate Teeinblue quantity on input change - prevent setting to 0 or negative
  document.addEventListener(
    "change",
    (e) => {
      if (e.target.matches(".tee-quantity input, .tee-quantity-group input")) {
        const val = parseInt(e.target.value);
        if (isNaN(val) || val <= 0) {
          e.target.value = 1;
          e.target.style.border = "2px solid red";
          e.target.dispatchEvent(new Event("change", { bubbles: true }));
          setTimeout(() => {
            e.target.style.border = "";
          }, 3000);
        }
      }
    },
    true,
  );
});
