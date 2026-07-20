const STORAGE_KEY = "vahntra_saved_fits";
export const SAVED_CHANGED_EVENT = "vahntra:saved-changed";

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  document.dispatchEvent(new CustomEvent(SAVED_CHANGED_EVENT, { detail: { ids } }));
}

export function getSavedIds() {
  return read();
}

export function isSaved(fitId) {
  return read().includes(fitId);
}

export function toggleSaved(fitId) {
  const ids = read();
  const idx = ids.indexOf(fitId);
  if (idx === -1) {
    ids.push(fitId);
  } else {
    ids.splice(idx, 1);
  }
  write(ids);
  return ids.includes(fitId);
}

export function removeSaved(fitId) {
  const ids = read().filter((id) => id !== fitId);
  write(ids);
}

export function clearSaved() {
  write([]);
}

export function savedCount() {
  return read().length;
}

export function initSavedCountBadges() {
  const update = () => {
    const count = savedCount();
    document.querySelectorAll("[data-saved-count]").forEach((el) => {
      el.textContent = String(count);
    });
  };
  update();
  document.addEventListener(SAVED_CHANGED_EVENT, update);
}
