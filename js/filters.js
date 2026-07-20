export function getFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    gender: params.get("gender") || "all",
    style: params.get("style") || "all"
  };
}

function setUrlFilters(filters) {
  const params = new URLSearchParams(window.location.search);
  if (filters.gender && filters.gender !== "all") params.set("gender", filters.gender);
  else params.delete("gender");
  if (filters.style && filters.style !== "all") params.set("style", filters.style);
  else params.delete("style");
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState({}, "", url);
}

export function initFilters(root, onChange) {
  if (!root) return { setFilters: () => {}, getFilters: () => ({ gender: "all", style: "all" }) };

  const state = getFiltersFromUrl();

  const groups = root.querySelectorAll("[data-filter-group]");

  function applyPressedStates() {
    groups.forEach((group) => {
      const key = group.getAttribute("data-filter-group");
      group.querySelectorAll("[data-filter-value]").forEach((btn) => {
        const value = btn.getAttribute("data-filter-value").toLowerCase();
        const isActive = (state[key] || "all") === value;
        btn.setAttribute("aria-pressed", String(isActive));
      });
    });
  }

  function commit() {
    setUrlFilters(state);
    applyPressedStates();
    onChange({ ...state });
  }

  groups.forEach((group) => {
    const key = group.getAttribute("data-filter-group");
    const buttons = Array.from(group.querySelectorAll("[data-filter-value]"));
    buttons.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        state[key] = btn.getAttribute("data-filter-value").toLowerCase();
        commit();
      });
      btn.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const next = buttons[(index + dir + buttons.length) % buttons.length];
        next.focus();
      });
    });
  });

  applyPressedStates();
  onChange({ ...state });

  return {
    setFilters(next) {
      Object.assign(state, next);
      commit();
    },
    getFilters() {
      return { ...state };
    }
  };
}
