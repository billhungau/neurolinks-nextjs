export const MEDIA = {
  logo: "/media/images/New-Logo.png",
  logoWhite: "/media/images/New-Logo-white.png",
  landingLogo: "/media/images/neurolinks-logo-BL-mDCNZ.webp",
  eval: "/media/images/0N4A2677-768x512.jpg",
  tmsClinic: "/media/images/0N4A2661-768x512.jpg",
  reception: "/media/images/Brickyard-Neurolink-Office-10-3-768x512.jpg",
  office: "/media/images/Brickyard-Neurolink-Office-4-768x512.jpg",
  /** Full-resolution original of MEDIA.office (WP 2022/11, 1920×1281). */
  aboutHero: "/media/images/Brickyard-Neurolink-Office-4.webp",
  tmsMachine: "/media/images/TMS-machine-768x512.jpg",
  team: "/media/images/0N4A2651-768x512.jpg",
  drAu: "/media/images/Neurolink-Portraits-Au-768x768.jpg",
  julie: "/media/images/0N4A2683-768x764.jpg",
  hannah: "/media/images/Hannah-768x901.jpg",
  lauralee: "/media/images/Lauralee-768x960.jpeg",
  consult: "/media/images/medical-consultation-768x432.jpg",
  cognitive: "/media/images/cognitive-testing-768x512.jpg",
  brain: "/media/images/human-brain-768x614.jpg",
  neurons: "/media/images/neurons-768x576.jpg",
  serotonin: "/media/images/serotonin-300x145.jpg",
  tmsPoster: "/media/posters/tms-cover.jpg",
  ketPoster: "/media/posters/ketamine-cover.jpg",
  referralPdf: "/media/pdfs/physician_referral_form-2.pdf",
  landingHero: "/media/images/hero-treatment-modalities-CnTkU5m8.webp",
  homeHero: "/media/images/home-hero-banner.jpg",
  homeHeroMobile: "/media/images/home-hero-mobile.webp",
  tmsBanner: "/media/images/tms-banner.jpg",
  ketamineBanner: "/media/images/ketamine-banner.jpg",
  servicesBanner: "/media/images/services-banner.jpg",
  aboutBanner: "/media/images/about-banner.jpg",
  contactBanner: "/media/images/contact-banner.jpg",
  referralBanner: "/media/images/referral-banner.jpg",
} as const;

/** Homepage hero: WP media 5544 (page 1318 section ca7541c). Combined TMS + ketamine JPEG. Full 1920 URL is CDN-rewritten to WebP 5946; local file is the 1536×768 JPEG derivative (116,907 bytes, FF D8). */
export const HOME_HERO_ASSET = {
  wpId: 5544,
  wpUrl:
    "https://neurolinks.ca/wp-content/uploads/2024/06/Orange-And-Blue-Modern-Professional-Construction-Banner-Design-2.jpg",
  wpDerivativeUrl:
    "https://neurolinks.ca/wp-content/uploads/2024/06/Orange-And-Blue-Modern-Professional-Construction-Banner-Design-2-1536x768.jpg",
  local: "/media/images/home-hero-banner.jpg",
  width: 1536,
  height: 768,
  restAlt: "",
} as const;

/**
 * Portrait art direction of the same photograph for the mobile hero: the 2:1
 * diptych cropped to a phone viewport keeps only its centre seam, losing both
 * subjects. Regenerate with `node scripts/build-home-hero-mobile.mjs`.
 */
export const HOME_HERO_MOBILE_ASSET = {
  local: "/media/images/home-hero-mobile.webp",
  width: 1080,
  height: 1560,
  source: HOME_HERO_ASSET.wpUrl,
} as const;

/** WP media 5946. Live Elementor image widget (not a CSS background). */
export const LANDING_HERO_ASSET = {
  wpId: 5946,
  wpUrl: "https://neurolinks.ca/wp-content/uploads/2026/01/hero-treatment-modalities-CnTkU5m8.webp",
  local: "/media/images/hero-treatment-modalities-CnTkU5m8.webp",
  width: 1920,
  height: 960,
  htmlAlt: "hero treatment modalities CnTkU5m8",
  restAlt: "",
} as const;

/** Hosted on WordPress pending a video CDN (too large for the git repo). */
export const WP_VIDEOS = {
  tms: {
    src: "https://neurolinks.ca/wp-content/uploads/2025/05/TMS-FINAL-COPYYYY-JULIE-USE.mp4",
    bytes: 236243496,
  },
  ketamine: {
    src: "https://neurolinks.ca/wp-content/uploads/2025/05/KETAMINE-VIDEO-JULIE-USE.mp4",
    bytes: 205260350,
  },
} as const;

export const LANDING_YOUTUBE = {
  tms: "hIMYP1bC3UE",
  ketamine: "tbAN-E4iXzY",
} as const;
