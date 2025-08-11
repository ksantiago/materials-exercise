# Privacy Preferences Technical Brief

## Overview

This document outlines the design and implementation of the privacy preferences system launched on Thinx.com after its migration to a Shopify theme under Kimberly-Clark. The system was built to capture and persist user privacy preferences for both authenticated and unauthenticated users, enforce these preferences across the storefront, and sync them to downstream systems for compliance and marketing segmentation.

The solution replaced a non-compliant third-party tool, integrated with OneTrust for cookie enforcement, and synced preferences to Simon Data in near real time. It was designed to be secure, scalable, and aligned with Kimberly-Clark’s enterprise privacy standards.

The **Privacy Preferences Flow Diagram** (see attached) visually represents the logic for guest and logged-in users in both initial render and post-change scenarios.

---

## Key Requirements

* Support privacy preference management for both guest (unauthenticated) and logged-in (authenticated) users.
* Provide a consistent UI on both the public-facing Privacy Settings page and the Account Dashboard.
* Persist preferences across sessions and devices.
* Update Shopify customer tags to reflect privacy choices for authenticated users.
* Sync preferences to Simon Data in near real time for compliance, auditing, and marketing segmentation.
* Integrate with OneTrust to automatically enforce cookie settings based on user preferences.
* Meet KC enterprise security requirements for code hosting, API authentication, and data handling.

---

## Technical Architecture

### Frontend

Two forms were implemented:
1. **Privacy Settings Page** – accessible to all users, regardless of authentication status.
2. **Account Dashboard Page** – available only to logged-in users.

Forms captured two distinct preferences:
1. *Do Not Sell or Share My Personal Information*
2. *Limit the Use of My Sensitive Personal Information*

Selections were validated, persisted, and triggered updates to both cookies and backend services.

---

### Backend

A KC-security-approved Node.js server hosted the core business logic. This server:
* Authenticated incoming requests from the Shopify storefront via a whitelist.
* Reformatted submitted preferences for compatibility with the Shopify Admin GraphQL API.
* Updated Shopify customer tags to store preferences for logged-in users.
* Issued a follow-up request to Simon Data to update the centralized consent record.

All backend processing was executed securely behind KC firewalls, with request logging, error handling, and audit tracking in place.

---

## Preference Handling Scenarios

### Guest User – Initial Render

For unauthenticated users, the initial state of each checkbox was determined solely by the presence of `do_not_sell` or `limit_the_use` cookies.

* If a cookie existed, the corresponding checkbox was pre-selected and the setting applied.
* If no cookie existed, the checkbox remained unchecked.

OneTrust listens for the existence of the cookies to adjust its settings automatically once a preference change was submitted.

---

### Guest User – Preference Change

When a guest user submitted a privacy preference change:

1. Cookies were set or cleared to reflect their new choices.
2. OneTrust listened for these cookies and updated its targeting/marketing cookie settings accordingly.
3. No Shopify or Simon Data updates occurred until the user logged in, at which point the preferences could be merged into their account.

---

### Logged-In User – Initial Render

For authenticated users, the system first checked for the presence of `do_not_sell` or `limit_the_use` cookies, then retrieved a user's stored preferences from the Shopify Admin GraphQL API. Both sources were evaluated, and the more privacy-protective option was applied.

* If either a cookie **or** a Shopify tag existed for a preference, the corresponding checkbox was pre-selected and that setting was enforced. This could result in an update of cookies or a user's privacy tags in Shopify.
* If neither existed, all checkboxes defaulted to unchecked.

---

### Logged-In User – Preference Change

When an authenticated user submitted changes:

1. Cookies were set or cleared to match their selections.
2. The Node.js server was called via a secure API endpoint.
3. The server reformatted the data for the Shopify Admin GraphQL API and updated the user’s customer tags.
4. The server then issued a second request to Simon Data to sync the updated preferences.
5. OneTrust automatically applied or removed marketing/targeting cookies based on the cookies that were set/new preferences.

---

## Data Flow Summary

1. **Frontend Forms** → Capture user selections.
2. **Cookies** → Persist guest preferences and assist with logged-in preference resolution.
3. **Shopify Admin API** → Store logged-in user preferences as customer tags.
4. **Simon Data API** → Centralize preferences for compliance and segmentation.
5. **OneTrust** → Enforce cookie behavior based on preferences.

---

## Security & Compliance

* All backend logic was hosted on a KC-approved Node.js server behind firewalls.
* API requests were authenticated and whitelisted to only accept calls from the Shopify storefront.
* All data changes were logged for audit purposes.
* The system defaulted to the most privacy-protective setting in cases of conflict.

