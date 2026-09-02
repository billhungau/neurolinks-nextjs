import { PRODUCTION_ORIGIN, productionUrl, SITE } from "@/lib/site";

export function ClinicJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: SITE.shortName,
    telephone: SITE.phone,
    email: SITE.email,
    url: productionUrl("/"),
    image: productionUrl("/media/og/default.jpg"),
    logo: `${PRODUCTION_ORIGIN}${SITE.logo}`,
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
