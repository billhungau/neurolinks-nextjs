import { SITE } from "@/lib/site";

export function ClinicMap({
  title = "NeuroLinks at 202-6010 Brickyard Road, Nanaimo, BC",
  className = "",
}: {
  title?: string;
  className?: string;
}) {
  return (
    <div className={`map-embed ${className}`.trim()}>
      <div className="map-embed-placeholder" aria-hidden="true">
        <p>{SITE.addressLine}</p>
      </div>
      <iframe
        title={title}
        className="map-embed-frame"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://maps.google.com/maps?q=6010%20Brickyard%20Road%2C%20Nanaimo%2C%20BC&t=m&z=15&output=embed&iwloc=near"
      />
    </div>
  );
}
