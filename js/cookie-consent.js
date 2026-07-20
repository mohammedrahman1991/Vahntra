const KEY = "vahntra_cookie_consent";

function ensureDom() {
  if (document.querySelector("[data-cookie-consent]")) return;
  const el = document.createElement("div");
  el.className = "cookie-consent";
  el.setAttribute("data-cookie-consent", "");
  el.setAttribute("role", "region");
  el.setAttribute("aria-label", "Cookie notice");
  el.innerHTML = `
    <p>Vahntra uses minimal local storage to remember saved fits and site preferences. No tracking cookies are active until an analytics provider is connected.</p>
    <div class="cookie-consent-actions">
      <button type="button" class="btn btn-primary" data-cookie-accept>Okay</button>
      <a class="btn btn-outline" href="privacy-policy.html">Privacy Policy</a>
    </div>
  `;
  document.body.appendChild(el);
  el.querySelector("[data-cookie-accept]").addEventListener("click", () => {
    localStorage.setItem(KEY, "1");
    el.classList.remove("is-visible");
  });
}

export function initCookieConsent() {
  if (localStorage.getItem(KEY) === "1") return;
  ensureDom();
  setTimeout(() => {
    document.querySelector("[data-cookie-consent]")?.classList.add("is-visible");
  }, 600);
}
