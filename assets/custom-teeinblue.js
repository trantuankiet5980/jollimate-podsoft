document.addEventListener("DOMContentLoaded", () => {
  const galleryWrapperSelector = ".product > .grid__item.product__media-wrapper";
  const nativeGallerySelector = 'media-gallery[id^="MediaGallery-"]';
  const personalizeSelector =
    ".tee-btn--personalize, .tee-btn-wrapper--personalize, button, a, [role='button'], .tee-btn";
  const customizationControlSelector = [
    "#tee-artwork-form input",
    "#tee-artwork-form textarea",
    "#tee-artwork-form select",
    "#tee-artwork-form .tee-radio",
    "#tee-artwork-form .tee-swatch",
    "#tee-artwork-form .tee-clipart-col",
    "#tee-artwork-form .tee-img-variant-option",
    "#tee-artwork-form .tee-color-variant-option",
    "#tee-artwork-form .tee-upload",
    ".tee-customization-wrapper input",
    ".tee-customization-wrapper textarea",
    ".tee-customization-wrapper select",
    ".tee-customization-wrapper .tee-radio",
    ".tee-customization-wrapper .tee-swatch",
    ".tee-customization-wrapper .tee-clipart-col",
    ".tee-customization-wrapper .tee-img-variant-option",
    ".tee-customization-wrapper .tee-color-variant-option",
    ".tee-customization-wrapper .tee-upload",
  ].join(", ");
  const previewContainerSelector = [
    ".tee-gallery-content",
    "#tee-gallery",
    ".tee-gallery:not(.tee-dialog-gallery)",
    ".tee-product-preview",
    ".tee-artwork-preview",
    ".tee-preview-wrapper",
    ".tee-preview:not(.tee-preview-btn):not(button)",
  ].join(", ");
  const previewSurfaceSelector = [
    "#tee-gallery",
    ".tee-gallery",
    ".tee-mockup",
    ".tee-slider",
    "canvas",
    ".tee-gallery-content img",
    ".tee-product-preview img",
    ".tee-artwork-preview img",
    ".tee-preview-wrapper img",
    ".tee-preview img",
  ].join(", ");
  const previewHostClass = "tee-live-preview-host";
  const activeClass = "tee-live-preview-active";
  const layoutActiveClass = "tee-live-preview-layout";
  const emptyCustomizeFormClass = "tee-customize-main-form--empty";
  const customFitZoomAttr = "teeCustomFitZoom";

  function injectLivePreviewStyles() {
    if (document.getElementById("tee-live-preview-styles")) return;

    const style = document.createElement("style");
    style.id = "tee-live-preview-styles";
    style.textContent = `
      ${galleryWrapperSelector}.${activeClass} > ${nativeGallerySelector} {
        display: none !important;
      }
      @media screen and (min-width: 750px) {
        .product.${layoutActiveClass}:not(.product--no-media) > .product__media-wrapper {
          max-width: 48% !important;
          width: 48% !important;
        }
        .product.${layoutActiveClass}:not(.product--no-media) > .product__info-wrapper {
          max-width: 52% !important;
          width: 52% !important;
        }
      }
      ${galleryWrapperSelector}:not(.${activeClass}) > ${nativeGallerySelector} {
        display: block !important;
      }
      ${galleryWrapperSelector}:not(.${activeClass}) > .${previewHostClass},
      ${galleryWrapperSelector}:not(.${activeClass}) > .tee-gallery-content,
      ${galleryWrapperSelector}:not(.${activeClass}) > #tee-gallery,
      ${galleryWrapperSelector}:not(.${activeClass}) > .tee-gallery {
        inset: 0 auto auto 0;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        visibility: hidden !important;
        width: 100% !important;
        z-index: -1;
      }
      ${galleryWrapperSelector}.${activeClass} > .${previewHostClass},
      ${galleryWrapperSelector}.${activeClass} > .tee-gallery-content,
      ${galleryWrapperSelector}.${activeClass} > #tee-gallery,
      ${galleryWrapperSelector}.${activeClass} > .tee-gallery {
        opacity: 1 !important;
        pointer-events: auto !important;
        position: relative !important;
        visibility: visible !important;
        z-index: auto;
      }
      ${galleryWrapperSelector} .${previewHostClass} {
        display: block;
        width: 100%;
      }
      ${galleryWrapperSelector}.${activeClass} .tee-gallery-content,
      ${galleryWrapperSelector}.${activeClass} #tee-gallery,
      ${galleryWrapperSelector}.${activeClass} .tee-gallery {
        box-sizing: border-box;
        max-width: 100%;
        width: 100% !important;
      }
      ${galleryWrapperSelector}.${activeClass} .tee-gallery-content {
        background: #fff;
        height: auto !important;
        min-height: 0;
      }
      ${galleryWrapperSelector}.${activeClass} .tee-slider {
        max-width: 100%;
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 1 / 1;
        overflow: hidden;
      }
      ${galleryWrapperSelector}.${activeClass} .tee-slider__inner,
      ${galleryWrapperSelector}.${activeClass} .tee-slider__track,
      ${galleryWrapperSelector}.${activeClass} .tee-slide--active {
        min-height: 100%;
        width: 100%;
      }
      ${galleryWrapperSelector}.${activeClass} .tee-thumbnails,
      ${galleryWrapperSelector}.${activeClass} .tee-slider__button,
      ${galleryWrapperSelector}.${activeClass} .tee-slider__dots {
        display: none !important;
      }
      ${galleryWrapperSelector}.${activeClass} .tee-slide:not(.tee-slide--active) {
        display: none !important;
      }
      ${galleryWrapperSelector}.${activeClass} .tee-slide--active {
        display: flex !important;
      }
      ${galleryWrapperSelector}.${activeClass} .tee-mockup,
      ${galleryWrapperSelector}.${activeClass} .tee-mockup img,
      ${galleryWrapperSelector}.${activeClass} .tee-slider img {
        max-width: 100%;
      }
      @media screen and (max-width: 749px) {
        body:not(.gallery--sticky) ${galleryWrapperSelector}.${activeClass} .tee-gallery-content {
          position: relative !important;
          top: auto !important;
        }
      }
      .tee-customize-main-form.${emptyCustomizeFormClass} {
        border: 0 !important;
        display: none !important;
        margin: 0 !important;
        min-height: 0 !important;
        padding: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function isVisibleTeeField(field) {
    if (!field || field.closest(".sr-only")) return false;
    if (field.hidden || field.getAttribute("aria-hidden") === "true") return false;

    const style = window.getComputedStyle(field);
    if (style.display === "none" || style.visibility === "hidden") return false;

    const rect = field.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1;
  }

  function hasVisibleCustomizationFields(form) {
    return Array.from(form.querySelectorAll(".tee-field")).some(isVisibleTeeField);
  }

  function syncEmptyCustomizeForms() {
    document.querySelectorAll(".tee-customize-main-form").forEach((form) => {
      form.classList.remove(emptyCustomizeFormClass);
      form.classList.toggle(
        emptyCustomizeFormClass,
        !hasVisibleCustomizationFields(form),
      );
    });
  }

  let emptyCustomizeFormTimer = null;

  function scheduleEmptyCustomizeFormSync(delay = 0) {
    clearTimeout(emptyCustomizeFormTimer);
    emptyCustomizeFormTimer = window.setTimeout(syncEmptyCustomizeForms, delay);
  }

  function isDialogPreview(element) {
    return Boolean(
      element.closest(
        ".tee-dialog-gallery, .tee-dialog, .vm--modal, .vm--container, [role='dialog']",
      ),
    );
  }

  function hasPreviewSurface(element) {
    return Boolean(
      element.matches(previewSurfaceSelector) ||
        element.querySelector(previewSurfaceSelector),
    );
  }

  function findTeeLivePreview() {
    const galleryContentCandidates = Array.from(
      document.querySelectorAll(".tee-gallery-content, #tee-gallery, .tee-gallery"),
    ).filter((element) => !isDialogPreview(element) && hasPreviewSurface(element));

    const galleryContent =
      galleryContentCandidates.find(
        (element) => !element.closest(`.${previewHostClass}`),
      ) || galleryContentCandidates[0];

    if (galleryContent) return galleryContent;

    const gallery = Array.from(
      document.querySelectorAll(previewContainerSelector),
    ).find((element) => !isDialogPreview(element) && hasPreviewSurface(element));

    if (!gallery) return null;
    return gallery.closest(".tee-gallery-content") || gallery;
  }

  function getPreviewHost(galleryWrapper) {
    let host = galleryWrapper.querySelector(`:scope > .${previewHostClass}`);
    if (host) return host;

    host = document.createElement("div");
    host.className = previewHostClass;

    const nativeGallery = galleryWrapper.querySelector(nativeGallerySelector);
    if (nativeGallery) {
      galleryWrapper.insertBefore(host, nativeGallery);
    } else {
      galleryWrapper.prepend(host);
    }

    return host;
  }

  let mountingPreview = false;
  let previewObserver = null;
  let previewObserverTarget = null;
  let livePreviewRequested = false;
  let previewResizeNotified = false;
  let _rt;

  function isTeeTextInput(element) {
    if (!element || !element.matches) return false;
    if (
      !element.closest(
        "#tee-artwork-form, .tee-customization-wrapper, .tee-campaign-container",
      )
    ) {
      return false;
    }

    const tagName = element.tagName.toLowerCase();
    const inputType = (element.getAttribute("type") || "text").toLowerCase();

    return (
      tagName === "textarea" ||
      (tagName === "input" &&
        ["text", "search", "email", "tel", "url"].includes(inputType)) ||
      element.matches("input.tee-input-text, textarea.tee-input-text")
    );
  }

  function getActiveTeeTextInput() {
    return isTeeTextInput(document.activeElement)
      ? document.activeElement
      : null;
  }

  function clearCustomMockupScaling() {
    document
      .querySelectorAll(".tee-gallery:not(.tee-dialog-gallery) .tee-mockup")
      .forEach((mockup) => {
        if (mockup.dataset[customFitZoomAttr] !== "true") return;

        mockup.style.removeProperty("zoom");
        delete mockup.dataset[customFitZoomAttr];
      });
  }

  function notifyTeeinblueGeometryChanged() {
    [0, 80].forEach((delay) => {
      window.setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, delay);
    });
  }

  function refreshLivePreview(delay = 200) {
    if (!livePreviewRequested) return;

    clearTimeout(_rt);
    _rt = setTimeout(() => {
      mountTeeLivePreview();
      if (!getActiveTeeTextInput()) scaleMockups();
    }, delay);
  }

  function observeLivePreview(teePreview) {
    if (!teePreview || previewObserverTarget === teePreview) return;

    if (previewObserver) previewObserver.disconnect();
    previewObserverTarget = teePreview;
    previewObserver = new MutationObserver(() => refreshLivePreview(150));
    previewObserver.observe(teePreview, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "src"],
    });
  }

  function notifyTeeinbluePreviewVisible() {
    if (previewResizeNotified) return;

    previewResizeNotified = true;
    [0, 80, 250, 700].forEach((delay) => {
      window.setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, delay);
    });
  }

  function activateLivePreview(galleryWrapper, teePreview) {
    const wasActive = galleryWrapper.classList.contains(activeClass);
    galleryWrapper.closest(".product")?.classList.add(layoutActiveClass);
    galleryWrapper.classList.add(activeClass);
    observeLivePreview(teePreview);

    if (!wasActive) notifyTeeinbluePreviewVisible();
  }

  function mountTeeLivePreview() {
    if (!livePreviewRequested) return;
    if (mountingPreview) return;

    const galleryWrapper = document.querySelector(galleryWrapperSelector);
    const teePreview = findTeeLivePreview();

    if (!galleryWrapper) return;
    if (!teePreview) {
      galleryWrapper.classList.remove(activeClass);
      return;
    }

    injectLivePreviewStyles();
    if (teePreview.closest(`.${previewHostClass}`)) {
      activateLivePreview(galleryWrapper, teePreview);
      return;
    }

    mountingPreview = true;

    const host = getPreviewHost(galleryWrapper);
    host.appendChild(teePreview);
    activateLivePreview(galleryWrapper, teePreview);

    teePreview.style.height = "100%";
    requestAnimationFrame(() => {
      scaleMockups();
      mountingPreview = false;
    });
  }

  function scheduleMountTeeLivePreview(delay = 0) {
    window.setTimeout(mountTeeLivePreview, delay);
  }

  function scheduleMountAttempts() {
    livePreviewRequested = true;
    [0, 100, 300, 700, 1200, 2000, 3500, 5000].forEach(
      scheduleMountTeeLivePreview,
    );
  }

  function isCustomizeStartClick(target) {
    const action = target.closest(personalizeSelector);
    if (action) {
      const actionText = [
        action.innerText,
        action.value,
        action.getAttribute("aria-label"),
        action.getAttribute("title"),
        action.className,
      ]
        .join(" ")
        .toLowerCase();

      if (/personalize|personalise|customize|customise|custom/.test(actionText)) {
        return true;
      }
    }

    return Boolean(target.closest(customizationControlSelector));
  }

  // === DESKTOP: Scale main mockup to fit slider ===
  // Only targets .tee-gallery (main gallery), NOT mobile configurator or dialog
  function scaleMockups() {
    if (window.innerWidth < 750) return; // skip on mobile
    if (getActiveTeeTextInput()) return;

    const gallery = document.querySelector(".tee-gallery:not(.tee-dialog-gallery)");
    if (!gallery) return;
    const slider = gallery.querySelector(".tee-slider");
    if (!slider) return;
    const w = slider.offsetWidth;
    if (w <= 0) return;
    slider.querySelectorAll(".tee-mockup").forEach((m) => {
      const mw = parseFloat(m.style.width) || 648;
      if (mw > 0) {
        m.style.zoom = w / mw;
        m.dataset[customFitZoomAttr] = "true";
      }
    });
  }

  setTimeout(scaleMockups, 500);
  setTimeout(scaleMockups, 2000);
  injectLivePreviewStyles();
  syncEmptyCustomizeForms();
  [200, 800, 1800, 3500].forEach((delay) => {
    window.setTimeout(syncEmptyCustomizeForms, delay);
  });

  document.addEventListener(
    "click",
    (e) => {
      if (livePreviewRequested || !isCustomizeStartClick(e.target)) return;

      scheduleMountAttempts();
    },
    true,
  );

  document.addEventListener(
    "focusin",
    (e) => {
      if (!isTeeTextInput(e.target)) return;

      clearCustomMockupScaling();
      notifyTeeinblueGeometryChanged();
    },
    true,
  );

  document.addEventListener(
    "focusout",
    (e) => {
      if (!isTeeTextInput(e.target)) return;

      window.setTimeout(() => {
        if (!getActiveTeeTextInput()) scaleMockups();
      }, 450);
    },
    true,
  );

  window.addEventListener("resize", () => {
    refreshLivePreview(150);
  });

  // Watch Teeinblue's async app render without observing every style/class change on the whole page.
  if (document.body) {
    new MutationObserver(() => {
      refreshLivePreview(200);
      scheduleEmptyCustomizeFormSync(100);
    }).observe(document.body, {
      childList: true,
      subtree: true,
    });
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
