import { initNavigation } from "./navigation.js";
import { initSavedCountBadges } from "./saved-fits.js";
import { initSearch } from "./search.js";
import { initNewsletter } from "./newsletter.js";
import { initCookieConsent } from "./cookie-consent.js";
import { initReviewForm, renderDemoReviews } from "./reviews.js";
import { initFitGrid } from "./fit-grid.js";
import { initBreakdownFromUrl } from "./fit-breakdown.js";
import { initIntro } from "./intro.js";
import { SAVED_CHANGED_EVENT } from "./saved-fits.js";

function initFadeUp() {
  const targets = document.querySelectorAll(".fade-up");
  if (!targets.length) return;
  if (!("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach((t) => observer.observe(t));
}

function initInfoModal() {
  const triggers = document.querySelectorAll("[data-info-modal-trigger]");
  if (!triggers.length) return;

  let overlay = document.querySelector("[data-info-modal-overlay]");
  if (!overlay) {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="info-modal-overlay" data-info-modal-overlay>
        <div class="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-modal-title" tabindex="-1">
          <h2 id="info-modal-title">Before You Shop</h2>
          <ul>
            <li>Purchases are completed on Amazon.</li>
            <li>Prices and availability can change at any time.</li>
            <li>Vahntra may earn a commission on qualifying purchases.</li>
            <li>Always verify final price, size and availability on Amazon.</li>
            <li>Vahntra does not process payment or shipping.</li>
          </ul>
          <button type="button" class="btn btn-primary info-modal-close" data-info-modal-close>Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap.firstElementChild);
    overlay = document.querySelector("[data-info-modal-overlay]");
  }

  const open = () => {
    overlay.classList.add("is-open");
    document.body.classList.add("no-scroll");
    overlay.querySelector(".info-modal").focus();
  };
  const close = () => {
    overlay.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  };

  triggers.forEach((t) => t.addEventListener("click", (e) => {
    e.preventDefault();
    open();
  }));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector("[data-info-modal-close]").addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
}

function initFaq() {
  document.querySelectorAll("[data-faq-item]").forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    question.addEventListener("click", () => {
      const isOpen = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", String(!isOpen));
      question.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = isOpen ? "0px" : `${answer.scrollHeight}px`;
    });
  });
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const msg = form.querySelector("[data-contact-msg]");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (msg) msg.textContent = "Message sending is not connected to a backend yet. Please email us directly once a contact address is configured.";
    form.reset();
  });
}

function initYear() {
  document.querySelectorAll("[data-current-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

async function initPageFitGrid() {
  const body = document.body;
  const page = body.getAttribute("data-page");
  if (page === "saved") return;
  const gridEl = document.querySelector("[data-fit-grid]");
  if (!gridEl) return;

  const baseFilters = {};
  if (page === "men") baseFilters.gender = "men";
  if (page === "women") baseFilters.gender = "women";
  if (page === "unisex") baseFilters.gender = "unisex";
  if (page === "new") baseFilters.newOnly = true;

  await initFitGrid({ baseFilters });
}

async function initHomeSections() {
  const featured = document.querySelector("[data-featured-fits]");
  const newFits = document.querySelector("[data-new-fits]");
  const savedFitsGrid = document.querySelector("[data-saved-edit-fits]");
  if (!featured && !newFits && !savedFitsGrid) return;

  const { getFits } = await import("./data-loader.js");
  const { renderFitGrid } = await import("./fit-grid.js");
  const { getSavedIds } = await import("./saved-fits.js");

  const fits = await getFits();
  if (featured) renderFitGrid(featured, fits.filter((f) => f.featured).slice(0, 3));
  if (newFits) renderFitGrid(newFits, fits.filter((f) => f.newArrival).slice(0, 3));
  if (savedFitsGrid) {
    const savedIds = new Set(getSavedIds());
    const savedFits = fits.filter((f) => savedIds.has(f.id)).slice(0, 3);
    renderFitGrid(savedFitsGrid, savedFits);
    const section = document.querySelector("[data-saved-edit-section]");
    if (section) section.hidden = savedFits.length === 0;
  }
}

async function initJournalPage() {
  const grid = document.querySelector("[data-journal-grid]");
  if (!grid) return;
  const { getArticles } = await import("./data-loader.js");
  const articles = await getArticles();
  grid.innerHTML = articles.map((a) => `
    <a class="journal-card" href="article.html?id=${a.id}">
      <div class="img-frame" style="aspect-ratio:4/3;"><img src="${a.coverImage}" alt="" loading="lazy" width="800" height="600"></div>
      <p class="label-sm">${a.readTime}</p>
      <h3>${a.title}</h3>
      <p>${a.excerpt}</p>
    </a>
  `).join("");
}

async function initArticlePage() {
  const root = document.querySelector("[data-article-page]");
  if (!root) return;
  const { getArticles } = await import("./data-loader.js");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const articles = await getArticles();
  const article = articles.find((a) => a.id === id);

  if (!article) {
    root.innerHTML = `<div class="empty-state"><h2>Article not found</h2><p>Browse the full <a class="btn-link" href="journal.html">journal</a>.</p></div>`;
    return;
  }

  document.title = `${article.title} — Vahntra Journal`;
  root.querySelector("[data-article-crumb-title]").textContent = article.title;
  root.querySelector("[data-article-title]").textContent = article.title;
  root.querySelector("[data-article-meta]").textContent = `${article.readTime} · ${article.dateAdded}`;
  root.querySelector("[data-article-image]").src = article.coverImage;
  root.querySelector("[data-article-image]").alt = article.title;
  root.querySelector("[data-article-body]").innerHTML = article.body.map((p) => `<p>${p}</p>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  initIntro();
  initNavigation();
  initSavedCountBadges();
  initSearch();
  initNewsletter();
  initCookieConsent();
  initReviewForm();
  initContactForm();
  initInfoModal();
  initFaq();
  initYear();
  initFadeUp();
  initBreakdownFromUrl();
  initPageFitGrid();
  initHomeSections();
  initJournalPage();
  initArticlePage();
  document.addEventListener(SAVED_CHANGED_EVENT, initHomeSections);

  document.querySelectorAll("[data-demo-reviews]").forEach(renderDemoReviews);
});
