# Thinx.com Product Display Page + A/B Test Context
GitHub Repo: https://github.com/ksantiago/materials-exercise

Includes:
- `pdp-index.js` – Main Product Display Page (PDP) logic for Thinx.com.
- `abtestcontext-index.tsx` – Global A/B testing context provider.

## Overview
These two files are from my time at Thinx, where I worked on a multi-brand storefront built on a headless Shopify + Next.js setup. We pulled data from Shopify’s Storefront API, CMS content via Nacelle + Contentful, and integrated marketing/analytics tools.

I picked them because they show two sides of my work:
- **High-impact, customer-facing pages** that orchestrate multiple systems (PDP).
- **Reusable infrastructure** that lets other teams (like marketing) move faster without extra dev work (A/B test context).

## I. Product Display Page (`pdp-index.js`)
The PDP is one of the most important revenue-driving pages on the site — it combines product info, merchandising logic, and CMS-driven content into a mobile-first experience.

**Highlights:**
- Merges data from Shopify Storefront API and CMS (Contentful via Nacelle).
- Flexible layout components that adapt to brand/section.
- Integrated with A/B test context for safe marketing experiments.
- SSR-friendly for performance and SEO.
- One main file to keep the full PDP flow easy to follow.

*(See top-of-file comments in `pdp-index.js` for more detail.)*

## II. A/B Test Context (`abtestcontext-index.tsx`)
A global React Context that centralizes Dynamic Yield experiment variations so any component can access them without duplicate API calls.

**Highlights:**
- Single source of truth from `allAbTestsConstants`.
- Vendor integration with safe dev/local fallbacks.
- TypeScript interfaces for clarity and maintainability.
- Simple POJO context value for easy testing.

*(See top-of-file comments in `abtestcontext-index.tsx` for full usage and design notes.)*

## How they work together
The PDP uses the A/B Test Context to decide which variant of an experiment to render — for example, testing alternate layouts or call-to-action designs without hardcoding experiment logic into the PDP itself. This separation keeps the PDP focused on product display logic while allowing marketing to run experiments safely and independently.

## Why I chose these files
Together, these files show:
- My approach to building complex, high-traffic pages with multiple integrations and performance needs.
- How I design small but impactful infrastructure that supports business agility.
- A focus on making code clear for future maintainers while balancing business goals and technical best practices.
