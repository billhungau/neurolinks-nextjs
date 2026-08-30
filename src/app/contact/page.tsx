import { ContactForm } from "@/components/ContactForm";
import { PageBanner } from "@/components/PageBanner";
import { SiteChrome } from "@/components/SiteChrome";
import { Section } from "@/components/ui";
import { MEDIA } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact NeuroLinks | Nanaimo TMS and Ketamine Clinic",
  description:
    "Contact NeuroLinks at 202-6010 Brickyard Road, Nanaimo. Phone 250-739-5530 or email contact@neurolinks.ca.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <SiteChrome>
      <PageBanner src={MEDIA.contactBanner} alt="" objectPosition="center -120px" />
      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h1 className="font-serif text-3xl font-bold">Our office</h1>
            <dl className="mt-6 grid gap-4 text-sm">
              <div>
                <dt className="font-semibold">Phone number</dt>
                <dd>
                  <a className="text-[#3260eb] underline" href={SITE.phoneHref}>
                    {SITE.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Fax number</dt>
                <dd>{SITE.fax}</dd>
              </div>
              <div>
                <dt className="font-semibold">E-mail</dt>
                <dd>
                  <a className="text-[#3260eb] underline" href={`mailto:${SITE.email}`}>
                    {SITE.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Address</dt>
                <dd>
                  <a
                    className="text-[#3260eb] underline"
                    href={SITE.mapsUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {SITE.addressLine}
                  </a>
                </dd>
              </div>
            </dl>
            <iframe
              title="NeuroLinks location"
              className="mt-8 h-64 w-full rounded border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=6010%20Brickyard%20Road%2C%20Nanaimo%2C%20BC&t=m&z=13&output=embed&iwloc=near"
            />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold">Send a message</h2>
            <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              Development preview: this form is not connected. Submissions are not delivered,
              stored, emailed, or logged.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>
    </SiteChrome>
  );
}
