import { getProductById, getFitsContainingProduct } from "./data-loader.js";

export async function initProductPage() {
  const root = document.querySelector("[data-product-page]");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = id ? await getProductById(id) : null;

  if (!product) {
    root.innerHTML = `<div class="empty-state"><h2>Product not found</h2><p>Browse the full <a class="btn-link" href="fits.html">fit collection</a> to find it inside a curated look.</p></div>`;
    return;
  }

  document.title = `${product.name} — Vahntra`;

  root.querySelector("[data-product-crumb-title]").textContent = product.name;
  root.querySelector("[data-product-image]").src = product.image;
  root.querySelector("[data-product-image]").alt = product.name;
  root.querySelector("[data-product-name]").textContent = product.name;
  root.querySelector("[data-product-brand]").textContent = product.brand;
  root.querySelector("[data-product-price]").textContent = typeof product.price === "number" ? `$${product.price.toFixed(2)}` : "CHECK AMAZON";
  root.querySelector("[data-product-color]").textContent = product.color;
  root.querySelector("[data-product-sizes]").textContent = product.sizes.join(", ");
  root.querySelector("[data-product-amazon]").href = product.amazonLink;

  const fits = await getFitsContainingProduct(product.id);
  const relatedEl = root.querySelector("[data-product-fits]");
  if (relatedEl) {
    relatedEl.innerHTML = fits.map((f) => `<a href="fit.html?id=${f.id}">${f.title} — ${f.gender} · ${f.style}</a>`).join("");
  }
}

document.addEventListener("DOMContentLoaded", initProductPage);
