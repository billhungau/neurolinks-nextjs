import Link from "next/link";
import { SiteChrome } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="nl-wrap py-20">
        <h1 className="font-serif text-4xl font-bold text-[#1a2744]">Page not found</h1>
        <p className="mt-4 max-w-xl leading-relaxed">
          This page could not be found. Return to the homepage or contact the clinic if you
          need help.
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
