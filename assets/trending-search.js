document.addEventListener("DOMContentLoaded", () => {
  const searchInputs = document.querySelectorAll(
    ".search__input, .custom-top-bar__search-input",
  );
  const RECENT_KEY = "recent_searches";
  const MAX_RECENT = 5;

  const readRecent = () => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const writeRecent = (list) => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch (e) {
      return;
    }
  };

  const hideAllTrending = () => {
    document
      .querySelectorAll(".trending-search-results")
      .forEach((el) => (el.style.display = "none"));
  };

  searchInputs.forEach((input) => {
    const form = input.closest("form");
    // Ensure we find the container related to this specific form/input context
    // Since the snippet is rendered inside the form (or adjacent), we need to find it relative to the input
    let trendingContainer = form.querySelector("[data-trending-search]");

    // Fallback if it's not inside the form (depending on placement)
    if (!trendingContainer) {
      // Try looking in the parent wrapper
      trendingContainer = input
        .closest(".search-modal__content")
        ?.querySelector("[data-trending-search]");
    }

    if (!trendingContainer) return;

    const renderRecent = () => {
      const recentWrapper = trendingContainer.querySelector(
        "[data-recent-searches]",
      );
      const recentList = trendingContainer.querySelector("[data-recent-list]");
      const clearButton = trendingContainer.querySelector(
        "[data-clear-recent]",
      );
      if (!recentWrapper || !recentList || !clearButton) return;

      const recent = readRecent();
      recentList.innerHTML = "";

      if (!recent.length) {
        recentWrapper.hidden = true;
        return;
      }

      recentWrapper.hidden = false;
      recent.forEach((term) => {
        const item = document.createElement("li");
        item.className = "trending-search__item";

        const link = document.createElement("a");
        link.className = "trending-search__link link link--text";
        link.href = `${form.action}?q=${encodeURIComponent(term)}`;
        link.innerHTML = `
                    <svg class="icon icon-search" aria-hidden="true" focusable="false">
                      <use href="#icon-search"></use>
                    </svg>
                    <span></span>
                `;
        link.querySelector("span").textContent = term;

        item.appendChild(link);
        recentList.appendChild(item);
      });
    };

    const showTrending = () => {
      if (input.value.trim() === "") {
        renderRecent();
        trendingContainer.style.display = "block";
      }
    };

    // Save recent on submit
    form.addEventListener("submit", () => {
      let query = input.value.trim();

      if (!query) return;
      const recent = readRecent().filter(
        (item) => item.toLowerCase() !== query.toLowerCase(),
      );
      recent.unshift(query);
      writeRecent(recent.slice(0, MAX_RECENT));
    });

    // Clear recent searches
    const clearButton = trendingContainer.querySelector("[data-clear-recent]");
    if (clearButton) {
      clearButton.addEventListener("click", (e) => {
        e.preventDefault();
        writeRecent([]);
        renderRecent();
      });
    }

    // Show on Click (even if already focused)
    input.addEventListener("click", (e) => {
      e.stopPropagation();
      hideAllTrending();
      showTrending();
    });

    // Show on Focus
    input.addEventListener("focus", (e) => {
      e.stopPropagation();
      hideAllTrending();
      showTrending();
    });

    // Handle Typing
    input.addEventListener("input", () => {
      if (input.value.trim() !== "") {
        trendingContainer.style.display = "none";
      } else {
        showTrending();
      }
    });

    // Prevent closing when clicking inside trending
    trendingContainer.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    // Check if click is inside any search form
    let insideSearch = false;
    searchInputs.forEach((input) => {
      if (input.closest("form").contains(e.target)) insideSearch = true;
    });

    // Also check if clicking inside the trending container itself (handled by stopPropagation, but good to be safe)
    if (e.target.closest("[data-trending-search]")) insideSearch = true;

    if (!insideSearch) {
      hideAllTrending();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideAllTrending();
  });
});
