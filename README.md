Thinx.com Product Display Page + A/B Test Context
GitHub Repo: https://github.com/ksantiago/materials-exercise

Includes:
- `pdp-index.js` – The main Product Detail Page (PDP) logic for Thinx.com.
- `abtestcontext-index.tsx` – The A/B testing context provider.

Overview
These two files are from my time at Thinx, where I worked on a multi-brand storefront built on a headless Shopify + Next.js setup. We pulled data from Shopify’s Storefront API, CMS content via Nacelle + Contentful, and tied in marketing/analytics tools.

I picked these because they show two sides of how I work:
- Building high-impact, customer-facing pages that pull from multiple systems.
- Setting up reusable, low-maintenance infrastructure so other teams (like marketing) can move faster without extra dev work.

**I. Product Display Page (`pdp-index.js`)**

The PDP is one of the most important pages on the site — this is where all the product info, merchandising logic, and CMS-driven content come together.

It had to handle Thinx’s unique product options/variants (size, absorbency, style), work well for both mobile and desktop, and be flexible enough to swap layouts depending on the brand or section of the site.

PDP Highlights
Multiple data sources:
- Shopify Storefront API for product data, variants, pricing.
- Contentful via Nacelle for CMS-managed blocks (pdpData).
- Layout flexibility – Shared layout components (SiteLayout, HeaderLayout, FooterLayout) so we can render the nav/header for the appropriate brand.
- Marketing experiments – Hooks into our A/B testing context so marketing can run tests without breaking the PDP.
- Performance-first – SSR-friendly so product data is already in the HTML for faster loads and better SEO.
- One main file – Keeps the full PDP flow in one place, so it’s easier for engineers to follow without bouncing between templates.

--- 

**II. A/B Test Context (`abtestcontext-index.tsx`)**
This is a global React Context that centralizes A/B test variation data from Dynamic Yield.
The goal was to make it dead simple for any component to check an experiment state without making its own API call.

Context Highlights
- One source of truth – All test setup starts in allAbTestsConstants.
- Dynamic Yield integration – Pulls active user variations from window.DYO.getUserObjectsAndVariations.
- Dev-friendly – Falls back to sampleVariations in non-prod so you can work locally without needing live data.
- Strong typing – TypeScript interfaces for both variation objects and context values.
- Easy to use – Components just call useAbTestContext() to read variations.


---

Why I chose these files:
- PDP: Shows how I handle complex, high-traffic pages with multiple integrations, business logic, and performance needs.
- AbTestContext: Shows how I set up small but important infrastructure that lets other teams move faster.

Together, they show:
- I can balance business goals with clean, maintainable code.
- I’m comfortable working on both big, customer-facing features and small architectural pieces.
- I keep my work accessible for other engineers who come in after me.
