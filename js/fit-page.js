import { getFitById, calculateFitTotal, getSimilarFits } from "./data-loader.js";
import { isSaved, toggleSaved } from "./saved-fits.js";
import { renderFitGrid } from "./fit-grid.js";

const RECENT_KEY = "vahntra_recent_fits";
const RECENT_LIMIT = 6;

function pushRecentlyViewed(fitId) {
  let ids = [];
  try {
    ids = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    ids = [];
  }
  ids = [fitId, ...ids.filter((id) => id !== fitId)].slice(0, RECENT_LIMIT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
}

function getRecentlyViewed(excludeId) {
  try {
    const ids = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    return ids.filter((id) => id !== excludeId);
  } catch {
    return [];
  }
}

function itemRow(item) {
  const priceHtml = item.originalPrice
    ? `<span class="original">$${item.originalPrice.toFixed(2)}</span>$${item.price.toFixed(2)}`
    : typeof item.price === "number" ? `$${item.price.toFixed(2)}` : "CHECK AMAZON";
  return `
    <div class="breakdown-item">
      <a class="breakdown-item-thumb" href="${item.amazonLink}" target="_blank" rel="noopener noreferrer sponsored" aria-label="View ${item.name} on Amazon"><img src="${item.image}" alt="${item.name}" loading="lazy" width="64" height="64"></a>
      <div class="breakdown-item-info">
        <span class="breakdown-item-label">${item.label}</span>
        <span class="breakdown-item-name">${item.name}</span>
        <span class="breakdown-item-brand">${item.brand}</span>
        <span class="breakdown-item-attrs">${item.color} · Sizes: ${item.sizes.join(", ")}</span>
      </div>
      <div class="breakdown-item-right">
        <span class="breakdown-item-price">${priceHtml}</span>
        <a class="breakdown-item-amazon" href="${item.amazonLink}" target="_blank" rel="noopener noreferrer sponsored">View on Amazon</a>
      </div>
    </div>
  `;
}

export async function initFitPage() {
  const root = document.querySelector("[data-fit-page]");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const fit = id ? await getFitById(id) : null;

  if (!fit) {
    root.innerHTML = `<div class="empty-state"><h2>Fit not found</h2><p>This fit may have been retired. Browse the full <a class="btn-link" href="fits.html">fit collection</a>.</p></div>`;
    return;
  }

  document.title = `${fit.title} — Vahntra`;
  pushRecentlyViewed(fit.id);

  root.querySelector("[data-fit-crumb-title]").textContent = fit.title;
  root.querySelector("[data-fit-image]").src = fit.fullImage;
  root.querySelector("[data-fit-image]").alt = `${fit.title} full outfit`;
  root.querySelector("[data-fit-title]").textContent = fit.title;
  root.querySelector("[data-fit-meta]").textContent = `FIT ${fit.fitNumber} · ${fit.gender} · ${fit.style}`;
  root.querySelector("[data-fit-description]").textContent = fit.description;
  root.querySelector("[data-fit-items]").innerHTML = fit.items.map(itemRow).join("");

  const totals = calculateFitTotal(fit.items);
  root.querySelector("[data-fit-total]").textContent = totals ? `$${totals.total.toFixed(2)}` : "CHECK AMAZON";

  const saveBtn = root.querySelector("[data-fit-save]");
  const syncSave = () => {
    const saved = isSaved(fit.id);
    saveBtn.classList.toggle("is-saved", saved);
    saveBtn.textContent = saved ? "Saved ♥" : "Save Fit";
  };
  syncSave();
  saveBtn.addEventListener("click", () => {
    toggleSaved(fit.id);
    syncSave();
  });

  const shareBtn = root.querySelector("[data-fit-share]");
  shareBtn?.addEventListener("click", async () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: fit.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      shareBtn.textContent = "Link Copied";
      setTimeout(() => (shareBtn.textContent = "Share"), 1800);
    }
  });

  const similar = await getSimilarFits(fit, 3);
  const similarGrid = document.querySelector("[data-similar-fits]");
  if (similarGrid) renderFitGrid(similarGrid, similar);

  const recentIds = getRecentlyViewed(fit.id);
  const recentGrid = document.querySelector("[data-recent-fits]");
  if (recentGrid && recentIds.length) {
    const { getFits } = await import("./data-loader.js");
    const allFits = await getFits();
    const recentFits = recentIds.map((rid) => allFits.find((f) => f.id === rid)).filter(Boolean);
    renderFitGrid(recentGrid, recentFits);
    document.querySelector("[data-recent-fits-section]")?.removeAttribute("hidden");
  }
}

document.addEventListener("DOMContentLoaded", initFitPage);
