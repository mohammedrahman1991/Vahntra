export function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

export function initMobileNav() {
  const btn = document.querySelector("[data-mobile-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!btn || !nav) return;

  const close = () => {
    nav.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  };
  const open = () => {
    nav.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
  };

  btn.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    isOpen ? close() : open();
  });

  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) close();
  });
}

export function markCurrentNavLink() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a, .mobile-nav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) {
      a.setAttribute("aria-current", "page");
    }
  });
}

export function initNavigation() {
  initHeaderScroll();
  initMobileNav();
  markCurrentNavLink();
}
