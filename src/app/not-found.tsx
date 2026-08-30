import Link from "next/link";
import { SiteChrome } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="font-serif text-4xl font-bold text-[#1a2744]">Page not found</h1>
        <p className="mt-4 max-w-xl leading-relaxed">
          This address is not one of the eight approved English routes. Return to the clinic
          homepage or contact the office if you need help.
        </p>
        <p className="mt-8">
          <Link className="font-semibold text-[#3260eb] underline" href="/">
            Go to the NeuroLinks homepage
          </Link>
        </p>
      </div>
    </SiteChrome>
  );
}
