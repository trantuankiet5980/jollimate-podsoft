if (!customElements.get("media-gallery")) {
  customElements.define(
    "media-gallery",
    class MediaGallery extends HTMLElement {
      constructor() {
        super();
        this.elements = {
          liveRegion: this.querySelector('[id^="GalleryStatus"]'),
          viewer: this.querySelector('[id^="GalleryViewer"]'),
          thumbnails: this.querySelector('[id^="GalleryThumbnails"]'),
        };
        this.mql = window.matchMedia("(min-width: 750px)");
        if (!this.elements.thumbnails) return;

        this.elements.viewer.addEventListener(
          "slideChanged",
          debounce(this.onSlideChanged.bind(this), 500),
        );
        this.elements.thumbnails
          .querySelectorAll("[data-target]")
          .forEach((mediaToSwitch) => {
            mediaToSwitch
              .querySelector("button")
              .addEventListener(
                "click",
                this.setActiveMedia.bind(
                  this,
                  mediaToSwitch.dataset.target,
                  false,
                ),
              );
          });
        if (
          this.dataset.desktopLayout.includes("thumbnail") &&
          this.mql.matches
        )
          this.removeListSemantic();
      }

      onSlideChanged(event) {
        const thumbnail = this.elements.thumbnails.querySelector(
          `[data-target="${event.detail.currentElement.dataset.mediaId}"]`,
        );
        this.setActiveThumbnail(thumbnail);
      }

      setActiveMedia(mediaId, prepend) {
        const activeMedia = this.elements.viewer.querySelector(
          `[data-media-id="${mediaId}"]`,
        );
        if (!activeMedia) return;

        this.elements.viewer
          .querySelectorAll("[data-media-id]")
          .forEach((element) => {
            element.classList.remove("is-active");
          });
        activeMedia.classList.add("is-active");

        if (prepend) {
          activeMedia.parentElement.prepend(activeMedia);
          if (this.elements.thumbnails) {
            const activeThumbnail = this.elements.thumbnails.querySelector(
              `[data-target="${mediaId}"]`,
            );
            activeThumbnail.parentElement.prepend(activeThumbnail);
          }
          if (this.elements.viewer.slider) this.elements.viewer.resetPages();
        }

        this.preventStickyHeader();
        window.setTimeout(() => {
          if (this.elements.thumbnails) {
            activeMedia.parentElement.scrollTo({
              left: activeMedia.offsetLeft,
            });
          }
          if (
            !this.elements.thumbnails ||
            this.dataset.desktopLayout === "stacked"
          ) {
            activeMedia.scrollIntoView({ behavior: "smooth" });
          }
        });
        this.playActiveMedia(activeMedia);

        if (!this.elements.thumbnails) return;
        const activeThumbnail = this.elements.thumbnails.querySelector(
          `[data-target="${mediaId}"]`,
        );
        this.setActiveThumbnail(activeThumbnail);
        this.announceLiveRegion(
          activeMedia,
          activeThumbnail.dataset.mediaPosition,
        );
      }

      setActiveThumbnail(thumbnail) {
        if (!this.elements.thumbnails || !thumbnail) return;

        this.elements.thumbnails
          .querySelectorAll("button")
          .forEach((element) => element.removeAttribute("aria-current"));
        thumbnail.querySelector("button").setAttribute("aria-current", true);
        if (this.elements.thumbnails.isSlideVisible(thumbnail, 10)) return;

        this.elements.thumbnails.slider.scrollTo({
          left: thumbnail.offsetLeft,
        });
      }

      announceLiveRegion(activeItem, position) {
        const image = activeItem.querySelector(
          ".product__modal-opener--image img",
        );
        if (!image) return;
        image.onload = () => {
          this.elements.liveRegion.setAttribute("aria-hidden", false);
          this.elements.liveRegion.innerHTML =
            window.accessibilityStrings.imageAvailable.replace(
              "[index]",
              position,
            );
          setTimeout(() => {
            this.elements.liveRegion.setAttribute("aria-hidden", true);
          }, 2000);
        };
        image.src = image.src;
      }

      playActiveMedia(activeItem) {
        window.pauseAllMedia();
        const deferredMedia = activeItem.querySelector(".deferred-media");
        if (deferredMedia) deferredMedia.loadContent(false);
      }

      preventStickyHeader() {
        this.stickyHeader =
          this.stickyHeader || document.querySelector("sticky-header");
        if (!this.stickyHeader) return;
        this.stickyHeader.dispatchEvent(new Event("preventHeaderReveal"));
      }

      removeListSemantic() {
        if (!this.elements.viewer.slider) return;
        this.elements.viewer.slider.setAttribute("role", "presentation");
        this.elements.viewer.sliderItems.forEach((slide) =>
          slide.setAttribute("role", "presentation"),
        );
      }

      filterByAlt(altText) {
        if (
          this.dataset.noFilter === "true" ||
          document.getElementById("tee-gallery")
        )
          return;
        const mediaItems = this.elements.viewer.querySelectorAll(
          ".product__media-item",
        );
        // Thumbnails might not exist on mobile or if configured off
        const thumbnailItems = this.elements.thumbnails
          ? this.elements.thumbnails.querySelectorAll(".thumbnail-list__item")
          : [];

        let firstVisibleMedia = null;

        // Helper to clean text for comparison
        const clean = (str) => (str ? str.trim().toLowerCase() : "");

        const targetAlts = Array.isArray(altText)
          ? altText.map(clean)
          : [clean(altText)];

        let hasMatch = false;
        mediaItems.forEach((item) => {
          const itemAlt = clean(item.getAttribute("data-alt"));
          // Try to match exact option or if the alt text contains the option (for grouped alts)
          // We split by comma in case someone puts "Black, M" in alt
          const itemAltParts = itemAlt.split(",").map((s) => s.trim());
          const matches = targetAlts.some(
            (t) => itemAltParts.includes(t) || itemAlt === t,
          );
          if (itemAlt && matches) {
            hasMatch = true;
          }
        });

        // If no images match the selected variant options, do not filter out images
        if (!hasMatch) {
          mediaItems.forEach((item) => (item.style.display = ""));
          if (thumbnailItems.length) {
            thumbnailItems.forEach((item) => (item.style.display = ""));
          }
          if (this.elements.viewer.resetPages)
            this.elements.viewer.resetPages();
          if (this.elements.thumbnails && this.elements.thumbnails.resetPages)
            this.elements.thumbnails.resetPages();
          return;
        }

        mediaItems.forEach((item) => {
          const itemAlt = clean(item.getAttribute("data-alt"));
          const itemAltParts = itemAlt.split(",").map((s) => s.trim());
          const shouldShow =
            targetAlts.some((t) => itemAltParts.includes(t) || itemAlt === t) ||
            itemAlt === "common" ||
            itemAlt === "";

          item.style.display = shouldShow ? "" : "none";
          if (shouldShow && !firstVisibleMedia) firstVisibleMedia = item;
        });

        if (thumbnailItems.length) {
          thumbnailItems.forEach((item) => {
            const itemAlt = clean(item.getAttribute("data-alt"));
            const itemAltParts = itemAlt.split(",").map((s) => s.trim());
            const shouldShow =
              targetAlts.some(
                (t) => itemAltParts.includes(t) || itemAlt === t,
              ) ||
              itemAlt === "common" ||
              itemAlt === "";
            item.style.display = shouldShow ? "" : "none";
          });
        }

        // Re-init slider logic to account for hidden items
        if (this.elements.viewer.resetPages) this.elements.viewer.resetPages();
        if (this.elements.thumbnails && this.elements.thumbnails.resetPages)
          this.elements.thumbnails.resetPages();

        // If active media is hidden, switch to first visible
        const activeMedia = this.elements.viewer.querySelector(
          ".product__media-item.is-active",
        );
        if (
          activeMedia &&
          activeMedia.style.display === "none" &&
          firstVisibleMedia
        ) {
          const mediaId = firstVisibleMedia.getAttribute("data-media-id");
          this.setActiveMedia(mediaId, true);
        }
      }
    },
  );
}
