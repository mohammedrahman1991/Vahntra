const SESSION_KEY = "vahntra_intro_seen";
const AUTO_ADVANCE_MS = 2000;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initIntro() {
  const intro = document.querySelector("[data-intro]");
  if (!intro) return;

  const config = window.SITE_CONFIG || {};
  const alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";

  if (alreadySeen && !config.showIntroEveryVisit) {
    intro.setAttribute("hidden", "");
    return;
  }

  const finish = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    intro.classList.add("is-leaving");
    document.body.classList.remove("no-scroll");
    const done = () => intro.setAttribute("hidden", "");
    if (prefersReducedMotion()) {
      done();
    } else {
      intro.addEventListener("transitionend", done, { once: true });
      setTimeout(done, 900);
    }
  };

  document.body.classList.add("no-scroll");

  if (prefersReducedMotion()) {
    intro.classList.add("is-active");
    finish();
    return;
  }

  requestAnimationFrame(() => intro.classList.add("is-active"));

  const enterBtn = intro.querySelector("[data-intro-enter]");
  const skipBtn = intro.querySelector("[data-intro-skip]");
  enterBtn?.addEventListener("click", finish);
  skipBtn?.addEventListener("click", finish);

  const timer = setTimeout(finish, AUTO_ADVANCE_MS);
  intro.addEventListener("click", (e) => {
    if (e.target === intro) {
      clearTimeout(timer);
      finish();
    }
  });
}
