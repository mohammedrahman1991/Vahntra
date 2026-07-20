const cache = {};

async function loadJson(path) {
  if (cache[path]) return cache[path];
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  const json = await res.json();
  cache[path] = json;
  return json;
}

export function getProducts() {
  return loadJson("data/products.json");
}

export function getFits() {
  return loadJson("data/fits.json");
}

export function getArticles() {
  return loadJson("data/articles.json");
}

export function getDemoReviews() {
  return loadJson("data/demo-reviews.json");
}

export function calculateFitTotal(items) {
  let total = 0;
  let hasUnknown = false;
  for (const item of items) {
    if (typeof item.price === "number") {
      total += item.price;
    } else {
      hasUnknown = true;
    }
  }
  if (hasUnknown && total === 0) return null;
  return { total, hasUnknown };
}

export async function joinFitWithProducts(fit) {
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = fit.productIds
    .map((id) => byId.get(id))
    .filter(Boolean);
  return { ...fit, items };
}

export async function getFitById(id) {
  const fits = await getFits();
  const fit = fits.find((f) => f.id === id);
  if (!fit) return null;
  return joinFitWithProducts(fit);
}

export async function getFitBySlug(slug) {
  const fits = await getFits();
  const fit = fits.find((f) => f.slug === slug);
  if (!fit) return null;
  return joinFitWithProducts(fit);
}

export async function getSimilarFits(fit, limit = 3) {
  const fits = await getFits();
  return fits
    .filter((f) => f.id !== fit.id && (f.style === fit.style || f.gender === fit.gender))
    .slice(0, limit);
}

export function filterFits(fits, { gender, style, newOnly } = {}) {
  return fits.filter((fit) => {
    const genderMatch = !gender || gender === "all" || fit.gender.toLowerCase() === gender.toLowerCase();
    const styleMatch = !style || style === "all" || fit.style.toLowerCase() === style.toLowerCase();
    const newMatch = !newOnly || fit.newArrival;
    return genderMatch && styleMatch && newMatch;
  });
}

export async function getProductById(id) {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

export async function getFitsContainingProduct(productId, limit = 4) {
  const fits = await getFits();
  return fits.filter((f) => f.productIds.includes(productId)).slice(0, limit);
}
