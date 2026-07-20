import { getFits, getProducts } from "./data-loader.js";

let index = null;
let activeIndex = -1;

function ensureDom() {
  if (document.querySelector("[data-search-overlay]")) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="search-overlay" data-search-overlay role="dialog" aria-modal="true" aria-label="Search Vahntra">
      <div class="container">
        <div class="search-head">
          <input type="text" class="search-input" data-search-input placeholder="SEARCH FITS, PRODUCTS, STYLES" aria-label="Search">
          <button type="button" class="icon-btn" data-search-close aria-label="Close search">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="search-results" data-search-results></div>
      </div>
    </div>
  `;
  document.body.appendChild(wrap.firstElementChild);
}

async function buildIndex() {
  if (index) return index;
  const [fits, products] = await Promise.all([getFits(), getProducts()]);
  const productsById = new Map(products.map((p) => [p.id, p]));
  index = fits.map((fit) => {
    const items = fit.productIds.map((id) => productsById.get(id)).filter(Boolean);
    const haystack = [
      fit.title, fit.style, fit.gender, ...fit.tags,
      ...items.map((p) => `${p.name} ${p.brand} ${p.category} ${p.color}`)
    ].join(" ").toLowerCase();
    return { fit, items, haystack };
  });
  return index;
}

function resultRow(entry, active) {
  const { fit, items } = entry;
  const total = items.reduce((sum, p) => sum + (typeof p.price === "number" ? p.price : 0), 0);
  return `
    <a class="search-result ${active ? "is-active" : ""}" href="fit.html?id=${fit.id}" data-search-result>
      <span class="search-result-thumb"><img src="${fit.coverImage}" alt="" loading="lazy" width="64" height="80"></span>
      <span>
        <span class="search-result-title">${fit.title}</span><br>
        <span class="search-result-meta">${fit.gender} · ${fit.style} · ${items.length} pieces</span>
      </span>
      <span class="search-result-meta">FROM $${total.toFixed(0)}</span>
    </a>
  `;
}

async function runSearch(query) {
  const results = document.querySelector("[data-search-results]");
  const idx = await buildIndex();
  const q = query.trim().toLowerCase();
  if (!q) {
    results.innerHTML = `<p class="search-empty">Start typing to search curated fits and individual pieces.</p>`;
    return;
  }
  const matches = idx.filter((entry) => entry.haystack.includes(q)).slice(0, 20);
  activeIndex = -1;
  if (!matches.length) {
    results.innerHTML = `<p class="search-empty">No fits or products match "${query}".</p>`;
    return;
  }
  results.innerHTML = matches.map((m) => resultRow(m)).join("");
}

export function openSearch() {
  ensureDom();
  const overlay = document.querySelector("[data-search-overlay]");
  overlay.classList.add("is-open");
  document.body.classList.add("no-scroll");
  const input = overlay.querySelector("[data-search-input]");
  input.value = "";
  runSearch("");
  setTimeout(() => input.focus(), 50);
}

export function closeSearch() {
  const overlay = document.querySelector("[data-search-overlay]");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
}

export function initSearch() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-search-toggle]")) {
      e.preventDefault();
      openSearch();
    }
    if (e.target.closest("[data-search-close]") || e.target.matches("[data-search-overlay]")) {
      closeSearch();
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.matches("[data-search-input]")) {
      runSearch(e.target.value);
    }
  });

  document.addEventListener("keydown", (e) => {
    const overlay = document.querySelector("[data-search-overlay]");
    const isOpen = overlay?.classList.contains("is-open");
    if (e.key === "/" && !isOpen && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
      return;
    }
    if (!isOpen) return;
    if (e.key === "Escape") {
      closeSearch();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const results = Array.from(overlay.querySelectorAll("[data-search-result]"));
      if (!results.length) return;
      activeIndex = (activeIndex + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      results.forEach((r, i) => r.classList.toggle("is-active", i === activeIndex));
      results[activeIndex].scrollIntoView({ block: "nearest" });
    }
    if (e.key === "Enter") {
      const active = overlay.querySelector(".search-result.is-active");
      if (active) {
        e.preventDefault();
        window.location.href = active.getAttribute("href");
      }
    }
  });
}
