# Writing Samples

## Shopify Theme System Architecture – Thinx.com (Post-Migration)

This diagram comes from the Shopify theme project we launched after Kimberly-Clark acquired Thinx.
It’s separate from the headless Shopify + Next.js code samples in the `work-samples` folder — this reflects the new storefront architecture we put in place after the migration.

I created it shortly after launch so both engineering and non-technical teams could share a single, high-level view of all the tools and integrations in use.

**[View the System Architecture Diagram (PDF)](https://github.com/ksantiago/materials-exercise/blob/main/writing-samples/THINX-Shopify-system-architecture.pdf)**

### Why I made it

* Help new engineers get up to speed quickly without digging through every repo or integration doc.
* Give product, marketing, and ops teams visibility into where each tool fits in the flow.
* Spot potential points of failure or complexity when planning new features or vendor changes.

### What it shows

* **Shopify as the core hub** for products, checkout, and orders.
* **Third-party integrations** for reviews (Yotpo), analytics (Heap), compliance (OneTrust, DataGrail), and marketing (Yotpo SMS, GTM scripts).
* **Operational tools** for ERP (NetSuite via Celigo), shipping (Aftership), returns (Loop), and fraud prevention.
* **UI/UX layer** components from the Shopify Theme, plus embedded scripts and customizations.

This became our team’s “source of truth” for how the post-migration system fit together — a quick reference that made cross-team collaboration and troubleshooting much easier.

---

## Thinx Privacy Preferences Technical Brief

This brief covers the design and implementation of the privacy preferences system launched on Thinx.com after migrating to a Shopify theme under Kimberly-Clark. It explains how the system captured and persisted preferences for both guest and logged-in users, integrated with OneTrust for cookie enforcement, and synced to Simon Data for compliance and segmentation.

* [**Read the Technical Brief**](https://github.com/ksantiago/materials-exercise/blob/main/writing-samples/privacy-preferences-technical-brief.md)
* [**View the Privacy Preferences Flow Diagram (PDF)**](https://github.com/ksantiago/materials-exercise/blob/main/writing-samples/thinx-privacy-preference-diagram.pdf)

The diagram provides a visual breakdown of the logic for guest and logged-in users, covering both initial render and post-change scenarios, and complements the details in the brief.
