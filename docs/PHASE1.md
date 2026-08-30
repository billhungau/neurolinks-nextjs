# Phase 1 — local Next.js rebuild (WordPress untouched)

Local project: `C:\Users\User\Documents\neurolinks`
Preview: `npm run dev` → http://localhost:3000 (trailing slashes enabled)

## Form backend decisions still required (do not enable on production yet)

Adapter: `src/lib/forms/adapter.ts` (`FORM_ADAPTER` not wired to a live provider).

Still need to select:

1. Delivery: Formidable on WP vs email (to which inbox?) vs EHR/fax vs a third-party form API
2. File uploads (referral PDF is currently a static WP media link only)
3. Spam protection (WP uses Formidable CAPTCHA; keys not imported)
4. Privacy: PHN and clinical data storage, retention, PIPEDA/PIPA
5. Confirmation emails and clinic notification
6. Whether submissions should ever write back to WordPress

## SEO

Canonical, title, description, Open Graph, index/follow, clinic JSON-LD on all pages.
Landing also preserves Rank Math title/description from WP.

## Location nav

WordPress Main Menu item **Location** → `https://neurolinks.ca#location` (homepage Elementor anchor `id=location`). Next.js uses `/#location`.
