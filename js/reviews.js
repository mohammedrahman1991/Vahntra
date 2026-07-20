import { getDemoReviews, getFits } from "./data-loader.js";

function starRow(rating) {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? "★" : "☆")).join("");
}

export async function renderDemoReviews(container) {
  if (!container) return;
  const config = window.SITE_CONFIG || {};
  if (!config.enableDemoReviews) {
    container.innerHTML = `<p class="text-muted">Fit feedback is currently disabled.</p>`;
    return;
  }
  const [reviews, fits] = await Promise.all([getDemoReviews(), getFits()]);
  const fitsById = new Map(fits.map((f) => [f.id, f]));

  container.innerHTML = reviews.map((review) => {
    const fit = fitsById.get(review.fitId);
    return `
      <article class="review-card">
        <div class="review-card-top">
          <span class="review-stars" aria-label="${review.rating} out of 5 stars">${starRow(review.rating)}</span>
          ${review.demo ? `<span class="review-demo-tag">DEMO REVIEW</span>` : ""}
        </div>
        <p>&ldquo;${review.comment}&rdquo;</p>
        <span class="review-card-name">${review.name}</span>
        ${fit ? `<span class="review-fit-ref">On ${fit.title}</span>` : ""}
      </article>
    `;
  }).join("");
}

export function initReviewForm() {
  document.querySelectorAll("[data-review-form]").forEach((form) => {
    const msg = form.querySelector("[data-review-msg]");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (msg) {
        msg.textContent = "Review submission is not connected yet.";
      }
    });
  });
}
