/*
 * Integration point: connect one of Mailchimp, ConvertKit, Beehiiv or Resend.
 * Replace the body of submitToProvider() with a real API call once a
 * provider and API key are available. Until then, submissions are not stored.
 */
async function submitToProvider(email) {
  return { connected: false, email };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function initNewsletter() {
  document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    const input = form.querySelector("input[type='email']");
    const msg = form.querySelector("[data-newsletter-msg]") || form.parentElement.querySelector("[data-newsletter-msg]");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!isValidEmail(email)) {
        if (msg) msg.textContent = "Enter a valid email address.";
        return;
      }
      const result = await submitToProvider(email);
      if (msg) {
        msg.textContent = result.connected
          ? "You're on the list."
          : "Newsletter is not connected to a provider yet. Your email was not stored.";
      }
      form.reset();
    });
  });
}
