import { getFitById, getFits, calculateFitTotal } from "./data-loader.js";
import { isSaved, toggleSaved } from "./saved-fits.js";

const CLOSE_ICON = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const HEART_ICON = `<svg viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor"><path d="M12 20s-7.5-4.6-10-9.3C.4 7.4 2.2 4 5.7 4 8 4 10 5.4 12 8c2-2.6 4-4 6.3-4 3.5 0 5.3 3.4 3.7 6.7C19.5 15.4 12 20 12 20z"/></svg>`;
const SHARE_ICON = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14"/></svg>`;
const CHEV_LEFT = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none" width="14" height="14"><path d="M15 6l-6 6 6 6"/></svg>`;
const CHEV_RIGHT = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none" width="14" height="14"><path d="M9 6l6 6-6 6"/></svg>`;

let state = {
  fitId: null,
  returnFocusEl: null,
  keydownHandler: null
};

function ensureDom() {
  if (document.querySelector("[data-breakdown-overlay]")) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="breakdown-overlay" data-breakdown-overlay></div>
    <section class="breakdown-panel" data-breakdown-panel role="dialog" aria-modal="true" aria-label="Fit breakdown" tabindex="-1">
      <header class="breakdown-head">
        <div>
          <p class="label-sm" data-breakdown-fitnumber></p>
          <h2 data-breakdown-title></h2>
          <p class="label-sm" data-breakdown-meta></p>
        </div>
        <div class="breakdown-head-actions">
          <button type="button" class="icon-btn" data-breakdown-save aria-label="Save fit">${HEART_ICON}</button>
          <button type="button" class="icon-btn" data-breakdown-share aria-label="Share fit">${SHARE_ICON}</button>
          <button type="button" class="icon-btn" data-breakdown-close aria-label="Close breakdown">${CLOSE_ICON}</button>
        </div>
      </header>
      <div class="breakdown-body">
        <div class="img-frame breakdown-media ratio-4-5">
          <img data-breakdown-image alt="">
        </div>
        <p data-breakdown-description class="text-muted"></p>
        <div class="breakdown-items" data-breakdown-items></div>
        <div class="breakdown-total">
          <span class="breakdown-total-label">Estimated Fit Total</span>
          <span class="breakdown-total-value" data-breakdown-total></span>
        </div>
        <p class="breakdown-note">Final pricing, colors, sizes and availability are confirmed on Amazon.</p>
        <p class="breakdown-note">As an Amazon Associate, Vahntra may earn from qualifying purchases.</p>
        <div class="breakdown-nav">
          <button type="button" data-breakdown-prev>${CHEV_LEFT} Previous</button>
          <a class="btn-link" data-breakdown-open-page href="#">Open Fit Page</a>
          <button type="button" data-breakdown-next>Next ${CHEV_RIGHT}</button>
        </div>
      </div>
      <div class="breakdown-mobile-bar">
        <button type="button" data-breakdown-save-mobile>Save Fit</button>
        <button type="button" data-breakdown-share-mobile>Share</button>
        <button type="button" data-breakdown-close-mobile>Close</button>
      </div>
    </section>
  `;
  document.body.append(...wrap.childNodes);
  wireStaticControls();
}

function itemRow(item) {
  const priceHtml = item.originalPrice
    ? `<span class="original">$${item.originalPrice.toFixed(2)}</span>$${item.price.toFixed(2)}`
    : typeof item.price === "number"
      ? `$${item.price.toFixed(2)}`
      : "CHECK AMAZON";
  return `
    <div class="breakdown-item">
      <div class="breakdown-item-thumb"><img src="${item.image}" alt="${item.name}" loading="lazy" width="64" height="64"></div>
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

async function populate(fitId) {
  const fit = await getFitById(fitId);
  if (!fit) return;
  const panel = document.querySelector("[data-breakdown-panel]");

  panel.querySelector("[data-breakdown-fitnumber]").textContent = `FIT ${fit.fitNumber}`;
  panel.querySelector("[data-breakdown-title]").textContent = fit.title;
  panel.querySelector("[data-breakdown-meta]").textContent = `${fit.gender} · ${fit.style}`;
  panel.querySelector("[data-breakdown-description]").textContent = fit.description;

  const img = panel.querySelector("[data-breakdown-image]");
  img.src = fit.fullImage;
  img.alt = `${fit.title} full outfit`;

  panel.querySelector("[data-breakdown-items]").innerHTML = fit.items.map(itemRow).join("");

  const totals = calculateFitTotal(fit.items);
  panel.querySelector("[data-breakdown-total]").textContent = totals ? `$${totals.total.toFixed(2)}` : "CHECK AMAZON";

  const saveBtn = panel.querySelector("[data-breakdown-save]");
  const saved = isSaved(fit.id);
  saveBtn.classList.toggle("is-saved", saved);
  saveBtn.setAttribute("aria-pressed", String(saved));

  panel.querySelector("[data-breakdown-open-page]").href = `fit.html?id=${fit.id}`;

  state.fitId = fit.id;
}

function wireStaticControls() {
  const overlay = document.querySelector("[data-breakdown-overlay]");
  const panel = document.querySelector("[data-breakdown-panel]");

  overlay.addEventListener("click", closeBreakdown);
  panel.querySelector("[data-breakdown-close]").addEventListener("click", closeBreakdown);
  panel.querySelector("[data-breakdown-close-mobile]").addEventListener("click", closeBreakdown);

  const doSave = async () => {
    const nowSaved = toggleSaved(state.fitId);
    panel.querySelectorAll("[data-breakdown-save]").forEach((btn) => {
      btn.classList.toggle("is-saved", nowSaved);
      btn.setAttribute("aria-pressed", String(nowSaved));
    });
  };
  panel.querySelector("[data-breakdown-save]").addEventListener("click", doSave);
  panel.querySelector("[data-breakdown-save-mobile]").addEventListener("click", doSave);

  const doShare = async () => {
    const url = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, "")}fit.html?id=${state.fitId}`;
    if (navigator.share) {
      navigator.share({ title: "Vahntra Fit", url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      showToast("Fit link copied");
    }
  };
  panel.querySelector("[data-breakdown-share]").addEventListener("click", doShare);
  panel.querySelector("[data-breakdown-share-mobile]").addEventListener("click", doShare);

  panel.querySelector("[data-breakdown-prev]").addEventListener("click", () => step(-1));
  panel.querySelector("[data-breakdown-next]").addEventListener("click", () => step(1));
}

function showToast(message) {
  let region = document.querySelector(".toast-region");
  if (!region) {
    region = document.createElement("div");
    region.className = "toast-region";
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

async function step(direction) {
  const fits = await getFits();
  const idx = fits.findIndex((f) => f.id === state.fitId);
  if (idx === -1) return;
  const next = fits[(idx + direction + fits.length) % fits.length];
  await populate(next.id);
}

function trapFocus(e) {
  const panel = document.querySelector("[data-breakdown-panel]");
  if (e.key === "Escape") {
    closeBreakdown();
    return;
  }
  if (e.key !== "Tab") return;
  const focusable = panel.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

export async function openBreakdown(fitId, { returnFocusEl } = {}) {
  ensureDom();
  await populate(fitId);
  state.returnFocusEl = returnFocusEl || document.activeElement;

  const overlay = document.querySelector("[data-breakdown-overlay]");
  const panel = document.querySelector("[data-breakdown-panel]");
  overlay.classList.add("is-open");
  panel.classList.add("is-open");
  document.body.classList.add("no-scroll");
  panel.focus();

  state.keydownHandler = trapFocus;
  document.addEventListener("keydown", state.keydownHandler);
}

export function closeBreakdown() {
  const overlay = document.querySelector("[data-breakdown-overlay]");
  const panel = document.querySelector("[data-breakdown-panel]");
  if (!overlay || !panel) return;
  overlay.classList.remove("is-open");
  panel.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
  if (state.keydownHandler) {
    document.removeEventListener("keydown", state.keydownHandler);
    state.keydownHandler = null;
  }
  state.returnFocusEl?.focus?.();
}

export function initBreakdownFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const openId = params.get("open");
  if (openId) openBreakdown(openId);
}
