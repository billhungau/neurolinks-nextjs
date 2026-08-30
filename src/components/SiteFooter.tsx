import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[var(--nl-navy-deep)] text-[var(--nl-cream)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl text-white">NeuroLinks</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            Specialist care for treatment-resistant mental health conditions in Nanaimo, BC.
          </p>
        </div>
        <div className="text-sm leading-relaxed">
          <p className="eyebrow text-[var(--nl-yellow)]">Clinic</p>
          <p className="mt-3">{SITE.addressLine}</p>
          <p className="mt-2">
            Tel:{" "}
            <a className="text-[var(--nl-yellow)] underline" href={SITE.phoneHref}>
              {SITE.phone}
            </a>
          </p>
        </div>
        <div className="text-sm">
          <p className="eyebrow text-[var(--nl-yellow)]">Visit</p>
          <p className="mt-3 flex flex-col gap-2">
            <Link className="text-white underline-offset-4 hover:underline" href="/contact/">
              Contact
            </Link>
            <Link className="text-white underline-offset-4 hover:underline" href="/physician-referral/">
              Physician referral
            </Link>
            <a href={SITE.facebook} rel="noopener noreferrer" target="_blank">
              Facebook
            </a>
            <a href={SITE.instagram} rel="noopener noreferrer" target="_blank">
              Instagram
            </a>
          </p>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
        © NeuroLinks 2022–{year}
      </p>
    </footer>
  );
}
