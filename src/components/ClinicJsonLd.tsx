import { PRODUCTION_ORIGIN, productionUrl, SITE } from "@/lib/site";

export function ClinicJsonLd() {
  const websiteId = `${PRODUCTION_ORIGIN}/#website`;
  const clinicId = `${PRODUCTION_ORIGIN}/#clinic`;
  const logo = `${PRODUCTION_ORIGIN}${SITE.logo}`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: productionUrl("/"),
        name: SITE.name,
        alternateName: [SITE.shortName, "neurolinks.ca"],
        publisher: { "@id": clinicId },
      },
      {
        "@type": "MedicalClinic",
        "@id": clinicId,
        name: SITE.name,
        alternateName: SITE.shortName,
        telephone: SITE.phone,
        email: SITE.email,
        url: productionUrl("/"),
        image: productionUrl("/media/og/default.jpg"),
        logo,
        sameAs: [SITE.googleListingUrl, SITE.facebook, SITE.instagram],
        address: {
          "@type": "PostalAddress",
          streetAddress: "202-6010 Brickyard Road",
          addressLocality: "Nanaimo",
          addressRegion: "BC",
          postalCode: "V9V 1S5",
          addressCountry: "CA",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
