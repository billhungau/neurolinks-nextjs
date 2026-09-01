/** `sizes` hints for next/image (layout width, not file dimensions). */
export const IMG_SIZES = {
  fullBleed: "100vw",
  half: "(max-width: 768px) 100vw, 50vw",
  third: "(max-width: 768px) 100vw, 33vw",
  staff: "(max-width: 768px) 100vw, 240px",
  logo: "(min-width: 768px) 181px, 160px",
  footerLogo: "162px",
  landingLogo: "48px",
  diagram: "(max-width: 640px) 50vw, 300px",
} as const;
