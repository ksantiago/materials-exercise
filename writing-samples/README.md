# Shopify Theme System Architecture – Thinx.com (Post-Migration)

This diagram is from the Shopify theme project we launched after Kimberly-Clark acquired Thinx.  
It’s separate from the headless Shopify + Next.js code samples in the `work-samples` folder — this was for the new storefront architecture after the migration.

I created this diagram shortly after launch so both engineering and non-technical teams could have a single, high-level view of all the tools and integrations in play.

## Why I made it
- To onboard new engineers quickly without diving into every repo or integration doc.
- To help product, marketing, and ops teams see dependencies and where each tool fit into the flow.
- To spot potential points of failure or complexity when planning new features or vendor changes.

## What it shows
- **Shopify as the core hub** for products, checkout, and orders.
- **Third-party integrations** for reviews (Yotpo), analytics (Heap), compliance (OneTrust, DataGrail), and marketing (Yotpo SMS, GTM scripts).
- **Operational tools** for ERP (NetSuite via Celigo), shipping (Aftership), returns (Loop), and fraud prevention.
- **UI/UX layer** components from the Shopify Theme, plus embedded scripts and customizations.

This was essentially our team’s “source of truth” for how the post-migration system fit together — a quick reference that made it easier to collaborate and troubleshoot across departments.
