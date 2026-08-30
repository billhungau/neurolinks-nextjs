import { SITE, siteOrigin } from "@/lib/site";

export function ClinicJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: SITE.shortName,
    telephone: SITE.phone,
    email: SITE.email,
    url: `${siteOrigin()}/`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "202-6010 Brickyard Road",
      addressLocality: "Nanaimo",
      addressRegion: "BC",
      postalCode: "V9V 1S5",
      addressCountry: "CA",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
