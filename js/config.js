/* Vahntra site configuration — edit values here, not in page code. */
const SITE_CONFIG = {
  siteName: "Vahntra",
  displayName: "VAHNTRA",
  domain: "https://vahntra.com",
  tagline: "Wear the Next Version",
  supportingLine: "Curated outfits. Every piece shoppable.",
  contactEmail: "",
  instagramUrl: "",
  tiktokUrl: "",
  pinterestUrl: "",
  amazonStoreUrl: "",
  googleAnalyticsId: "",
  showIntroEveryVisit: false,
  enableDemoReviews: true,
  enableAdminPreview: false
};

if (typeof window !== "undefined") {
  window.SITE_CONFIG = SITE_CONFIG;
}
