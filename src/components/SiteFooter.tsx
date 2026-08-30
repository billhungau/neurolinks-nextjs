import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-[#1a2744] text-slate-200">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 text-sm">
        <p className="italic">
          NeuroLinks — Specialist care for treatment-resistant mental health
          conditions.
        </p>
        <p>© NeuroLinks 2022 –</p>
        <p>{SITE.addressLine}</p>
        <p>
          Tel:{" "}
          <a className="text-[#e8b923] underline" href={SITE.phoneHref}>
            {SITE.phone}
          </a>
        </p>
        <p className="flex gap-4">
          <a href={SITE.facebook} rel="noopener noreferrer" target="_blank">
            Facebook
          </a>
          <a href={SITE.instagram} rel="noopener noreferrer" target="_blank">
            Instagram
          </a>
        </p>
        <p>
          <Link className="text-white underline" href="/contact/">
            Contact
          </Link>
        </p>
      </div>
    </footer>
  );
}
