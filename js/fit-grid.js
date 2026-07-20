import { getFits, filterFits, getFitById } from "./data-loader.js";
import { initFilters } from "./filters.js";
import { isSaved, toggleSaved, getSavedIds, clearSaved, SAVED_CHANGED_EVENT } from "./saved-fits.js";
import { openBreakdown } from "./fit-breakdown.js";

const HEART_ICON = `<svg viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor"><path d="M12 20s-7.5-4.6-10-9.3C.4 7.4 2.2 4 5.7 4 8 4 10 5.4 12 8c2-2.6 4-4 6.3-4 3.5 0 5.3 3.4 3.7 6.7C19.5 15.4 12 20 12 20z"/></svg>`;
const ARROW_ICON = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

function fitCardMarkup(fit, index) {
  const saved = isSaved(fit.id);
  return `
    <article class="fit-card" data-fit-card data-fit-id="${fit.id}" style="--i:${index}" tabindex="0" aria-label="View breakdown for ${fit.title}, ${fit.gender} ${fit.style}">
      <div class="fit-card-media img-frame ratio-4-5">
        <img src="${fit.coverImage}" alt="${fit.title} — ${fit.gender} ${fit.style} fit" loading="lazy" width="720" height="900">
        <span class="fit-card-index">FIT ${fit.fitNumber}</span>
        <button type="button" class="fit-card-save ${saved ? "is-saved" : ""}" data-save-btn data-fit-id="${fit.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove from saved fits" : "Save fit"}">
          ${HEART_ICON}
        </button>
      </div>
      <div class="fit-card-info">
        <h3 class="fit-card-title">${fit.title}</h3>
        <p class="fit-card-meta">${fit.gender} · ${fit.style} · ${fit.productIds.length} pieces</p>
        <span class="fit-card-action" data-view-breakdown data-fit-id="${fit.id}">View Breakdown ${ARROW_ICON}</span>
      </div>
    </article>
  `;
}

export function renderFitGrid(container, fits) {
  if (!container) return;
  if (!fits.length) {
    container.innerHTML = `<div class="fit-grid-empty">No fits match these filters yet. Try clearing a filter.</div>`;
    return;
  }
  container.innerHTML = fits.map((fit, i) => fitCardMarkup(fit, i)).join("");
}

function wireGridInteractions(container, announce) {
  container.addEventListener("click", async (e) => {
    const saveBtn = e.target.closest("[data-save-btn]");
    if (saveBtn) {
      e.preventDefault();
      e.stopPropagation();
      const fitId = saveBtn.getAttribute("data-fit-id");
      const nowSaved = toggleSaved(fitId);
      saveBtn.classList.toggle("is-saved", nowSaved);
      saveBtn.setAttribute("aria-pressed", String(nowSaved));
      saveBtn.setAttribute("aria-label", nowSaved ? "Remove from saved fits" : "Save fit");
      return;
    }
    const card = e.target.closest("[data-fit-card]");
    if (card) {
      e.preventDefault();
      const fitId = card.getAttribute("data-fit-id");
      openBreakdown(fitId, { returnFocusEl: card });
    }
  });

  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest("[data-fit-card]");
    if (card) {
      e.preventDefault();
      openBreakdown(card.getAttribute("data-fit-id"), { returnFocusEl: card });
    }
  });
}

export async function initFitGrid(options = {}) {
  const container = document.querySelector(options.gridSelector || "[data-fit-grid]");
  const countEl = document.querySelector("[data-fit-count]");
  const statusEl = document.querySelector("[data-filter-status]");
  const filterRoot = document.querySelector(options.filterSelector || "[data-fit-filters]");

  if (!container) return;

  const allFits = await getFits();
  const baseFilters = options.baseFilters || {};

  function apply(filters) {
    const merged = { ...baseFilters, ...filters };
    const filtered = filterFits(allFits, merged);
    renderFitGrid(container, filtered);
    if (countEl) countEl.innerHTML = `<strong>${filtered.length}</strong> fits`;
    if (statusEl) statusEl.textContent = `Showing ${filtered.length} fit${filtered.length === 1 ? "" : "s"}.`;
  }

  wireGridInteractions(container, statusEl);

  if (filterRoot) {
    initFilters(filterRoot, apply);
  } else {
    apply(getFiltersFromUrlSafe());
  }
}

function getFiltersFromUrlSafe() {
  const params = new URLSearchParams(window.location.search);
  return { gender: params.get("gender") || "all", style: params.get("style") || "all" };
}

export async function initSavedFitsPage() {
  const container = document.querySelector("[data-fit-grid]");
  const emptyState = document.querySelector("[data-saved-empty]");
  const clearBtn = document.querySelector("[data-clear-saved]");
  const countEl = document.querySelector("[data-fit-count]");
  if (!container) return;

  wireGridInteractions(container);

  async function render() {
    const allFits = await getFits();
    const savedIds = new Set(getSavedIds());
    const saved = allFits.filter((f) => savedIds.has(f.id));
    renderFitGrid(container, saved);
    if (countEl) countEl.innerHTML = `<strong>${saved.length}</strong> saved`;
    if (emptyState) emptyState.hidden = saved.length > 0;
    container.hidden = saved.length === 0;
    if (clearBtn) clearBtn.hidden = saved.length === 0;
  }

  clearBtn?.addEventListener("click", () => {
    clearSaved();
  });

  document.addEventListener(SAVED_CHANGED_EVENT, render);
  render();
}
