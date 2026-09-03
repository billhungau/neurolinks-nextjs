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
  /** Supplied TMS video cover; logo sits on the blue field (no white badge). */
  landingTmsPoster: "/media/posters/tms-video-cover.webp",
  /** Supplied ketamine video cover; logo sits on the blue field (no white badge). */
  landingKetPoster: "/media/posters/ketamine-video-cover.webp",
  referralPdf: "/documents/physician-referral-form.pdf",
  landingHero: "/media/images/hero-treatment-modalities-CnTkU5m8.webp",
  homeHero: "/media/images/home-hero-banner.jpg",
  homeHeroIntegrated: "/media/images/home-hero-desktop.webp",
  homeHeroMobile: "/media/images/home-hero-portrait.webp",
  /** Supplied retouched homepage hero (1960×802). Used as-is. */
  homeHeroRetouched: "/media/images/neurolinks-hero-retouched.webp",
  /** Ketamine treatment-room photograph (recliner, window, side table). */
  ketamineHero: "/media/images/ketamine-treatment-room-hero.webp",
  ketamineHeroMobile: "/media/images/ketamine-treatment-room-hero-mobile.webp",
  tmsBanner: "/media/images/tms-banner.jpg",
  ketamineBanner: "/media/images/ketamine-banner.jpg",
  /** Square editorial crop for the services ketamine card. */
  ketamineVial: "/media/images/ketamine-vial-sill.webp",
  servicesBanner: "/media/images/services-banner.jpg",
  aboutBanner: "/media/images/about-banner.jpg",
  contactBanner: "/media/images/contact-banner.jpg",
  referralBanner: "/media/images/referral-banner.jpg",
} as const;

/**
 * Homepage hero. The retouched 1960×802 composite is used directly;
 * additional contrast is only a light CSS blend on small screens.
 */
export const HOME_HERO_ASSET = {
  local: "/media/images/neurolinks-hero-retouched.webp",
  width: 1960,
  height: 802,
  restAlt: "",
} as const;

/**
 * Legacy portrait crop from the previous composite. Homepage no longer uses it.
 */
export const HOME_HERO_MOBILE_ASSET = {
  local: "/media/images/home-hero-portrait.webp",
  width: 1080,
  height: 1600,
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

export const OG = {
  default: "/media/og/default.jpg",
  home: "/media/og/home.jpg",
  tms: "/media/og/tms.jpg",
  ketamine: "/media/og/ketamine.jpg",
  services: "/media/og/services.jpg",
  about: "/media/og/about.jpg",
  contact: "/media/og/contact.jpg",
  referral: "/media/og/referral.jpg",
  landing: "/media/og/landing.jpg",
} as const;

export const LANDING_YOUTUBE = {
  tms: "hIMYP1bC3UE",
  ketamine: "tbAN-E4iXzY",
} as const;

/**
 * Supplied ads-landing video covers. Near 16:9. The NeuroLinks wordmark sits
 * directly on the blue field (no white logo badge). Play control is CSS-only.
 */
export const LANDING_VIDEO_POSTERS = {
  tms: {
    local: MEDIA.landingTmsPoster,
    width: 1672,
    height: 941,
  },
  ketamine: {
    local: MEDIA.landingKetPoster,
    width: 1672,
    height: 941,
  },
} as const;
