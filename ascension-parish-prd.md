# Product Requirements Document
## Catholic Church of the Ascension — Parish Website

**Version:** 1.0  
**Date:** May 2026  
**Location:** MMIA, Ikeja, Lagos, Nigeria  
**Status:** Draft

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Tech Stack](#3-tech-stack)
4. [Information Architecture](#4-information-architecture)
5. [Feature Specifications](#5-feature-specifications)
   - 5.1 [About / Parish History](#51-about--parish-history)
   - 5.2 [Our Clergy](#52-our-clergy)
   - 5.3 [Give / Donations](#53-give--donations)
   - 5.4 [Daily Readings](#54-daily-readings)
   - 5.5 [Parish Schedule / Calendar](#55-parish-schedule--calendar)
   - 5.6 [Parish Announcements](#56-parish-announcements)
   - 5.7 [Homilies](#57-homilies)
   - 5.8 [Sacraments / Becoming Catholic](#58-sacraments--becoming-catholic)
   - 5.9 [Livestream](#59-livestream)
   - 5.10 [Gallery](#510-gallery)
   - 5.11 [Media Review System](#511-media-review-system)
   - 5.12 [Contact Page](#512-contact-page)
6. [Sanity CMS Schema Overview](#6-sanity-cms-schema-overview)
7. [Third-Party Integrations Summary](#7-third-party-integrations-summary)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Roles & Permissions](#9-roles--permissions)
10. [Out of Scope](#10-out-of-scope)
11. [Open Questions](#11-open-questions)

---

## 1. Project Overview

The Catholic Church of the Ascension requires a modern, performant, and maintainable parish website that serves its congregation and the broader public. The site must be easy to update by non-technical parish staff, integrate with best-in-class third-party tools where appropriate, and reflect the dignity and identity of a Catholic parish.

**Primary Audiences:**
- Active parishioners seeking schedules, announcements, and resources
- New or prospective parishioners exploring the faith
- Visitors and the general public
- Parish administrators managing content

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Make parish information easily accessible | Bounce rate < 50%; avg. session > 2 min |
| Enable non-technical staff to manage content | Zero developer involvement for routine content updates |
| Drive online giving | Monthly donation transaction volume via Paystack |
| Grow RCIA inquiries | Number of RCIA inquiry form submissions per quarter |
| Increase homily reach | Homily audio plays per month |
| Support livestream attendance | YouTube live viewer count per stream |

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | **Next.js (App Router)** | SSR/SSG for SEO, performance, and flexibility |
| Styling | **SCSS Modules** | Scoped styles, maintainability, design precision |
| CMS | **Sanity CMS** | Structured content, custom Studio, generous free tier |
| Media Storage | **Cloudinary** | Images, audio, and video hosting with optimisation |
| Payments | **Paystack** | Leading Nigerian payment gateway; supports anonymous giving |
| Calendar | **Google Calendar API** | Non-technical management, fully custom-styled UI |
| Daily Readings | **Universalis API** | Free, reliable, structured liturgical content |
| Forms | **Tally.so** | No-backend embeddable forms; routes to email/Google Sheets |
| Livestream | **YouTube Data API v3** | Live detection + embed; no extra infrastructure |
| Email Delivery | **Resend** | Modern developer-friendly transactional email |
| Social Media Review | **Loomly** | Built-in approval workflow for all paid plans |
| Website Media Review | **Sanity Draft/Publish** | Native workflow; no extra tooling needed |

---

## 4. Information Architecture

```
/ (Home)
├── /about                      → About / Parish History
├── /clergy                     → Our Clergy
├── /give                       → Donations (Paystack)
├── /readings                   → Daily Readings (Universalis API)
├── /schedule                   → Parish Schedule (Google Calendar API)
├── /announcements              → Parish Announcements
│   └── /announcements/[slug]   → Single Announcement
├── /homilies                   → Homily Archive
│   └── /homilies/[slug]        → Single Homily
├── /sacraments                 → Sacraments Overview
│   ├── /sacraments/rcia        → RCIA / Becoming Catholic (+ Inquiry Form)
│   ├── /sacraments/baptism
│   ├── /sacraments/eucharist
│   ├── /sacraments/confirmation
│   ├── /sacraments/reconciliation
│   ├── /sacraments/anointing
│   └── /sacraments/matrimony
├── /livestream                 → Mass Livestream (YouTube)
├── /gallery                    → Photo & Video Gallery
│   └── /gallery/[event-slug]   → Single Event Album
└── /contact                    → Contact Page
```

---

## 5. Feature Specifications

---

### 5.1 About / Parish History

**Purpose:** Provide the historical and spiritual background of the parish for parishioners and visitors.

**Content managed via:** Sanity CMS

**Page Sections:**
- Hero image with parish name
- Rich-text narrative of the parish's founding and history
- Key milestones (optionally displayed as a timeline component)
- Parish mission statement
- Inline images and captions

**Sanity Document Type:** `aboutPage` (singleton)

**Fields:**
| Field | Type | Notes |
|---|---|---|
| `title` | String | Page title |
| `heroImage` | Image (Cloudinary) | Full-width banner |
| `body` | Portable Text | Rich text with image embeds |
| `milestones` | Array of objects | `{ year, title, description }` |
| `missionStatement` | Text | Displayed as a pull quote |

---

### 5.2 Our Clergy

**Purpose:** Display photos, names, roles, and contact details of the parish's clergy and catechists.

**Content managed via:** Sanity CMS

**Page Layout:**
- Filterable grid (All / Priests / Reverend Sisters / Catechists)
- Each card: photo, name, title/role, contact info (email, optionally phone)

**Sanity Document Type:** `clergyMember`

**Fields:**
| Field | Type | Notes |
|---|---|---|
| `name` | String | Full name |
| `title` | String | e.g. "Rev. Fr.", "Sr.", "Mr." |
| `role` | String (enum) | `priest`, `reverend_sister`, `catechist` |
| `photo` | Image (Cloudinary) | Portrait photo |
| `bio` | Portable Text | Short biography |
| `email` | String | Contact email |
| `phone` | String | Optional |
| `order` | Number | Controls display order |

---

### 5.3 Give / Donations

**Purpose:** Allow parishioners and visitors to make financial contributions to the parish, including anonymously.

**Powered by:** Paystack

**Page Sections:**
- Brief stewardship message
- Giving form with:
  - Donation category selector (e.g. General Offering, Building Fund, Charity, etc.)
  - Custom amount input
  - Optional name and email fields (anonymous giving supported — fields not required)
  - "Give Now" button triggers Paystack Popup JS

**Implementation Notes:**
- Use **Paystack Popup JS** (inline, not redirect) for better UX
- Donation categories stored in Sanity as a simple list (admin-editable)
- No donor data stored on the site's own backend; Paystack dashboard is the source of truth for transaction records
- A post-donation thank-you message displayed on success callback

**Anonymous Giving:** Name and email fields are clearly labelled as optional. The Paystack transaction still completes with a generated reference.

---

### 5.4 Daily Readings

**Purpose:** Display the Roman Catholic daily liturgical readings for the current day.

**Powered by:** Universalis API (`https://universalis.com/`)

**Implementation:**
- Fetched server-side via Next.js Route Handler on each request (no caching beyond ISR with short revalidation window — readings change daily)
- Displays: date, liturgical season/colour indicator, First Reading, Responsorial Psalm, Second Reading (if applicable), Gospel Acclamation, Gospel
- Each reading shown with scripture reference and full text
- "Today" defaults on page load; optional date picker to browse past readings

**API Endpoint Pattern:**
```
https://universalis.com/{date}/Mass.json
```
where `{date}` is `YYYYMMDD` or `today`.

---

### 5.5 Parish Schedule / Calendar

**Purpose:** Display upcoming parish activities including Masses, Confessions, novenas, events, and meetings.

**Powered by:** Google Calendar API (custom-styled UI)

**Calendar Management:**
- Parish staff manage events directly in **Google Calendar** (one dedicated parish calendar)
- Calendar is set to **public** to allow API key-only access (no OAuth required)
- Events use Google Calendar's colour coding to represent event types

**Event Type → Colour Mapping (suggested):**
| Colour | Event Type |
|---|---|
| Tomato (Red) | Mass |
| Blueberry (Blue) | Confession |
| Sage (Green) | Parish Events |
| Banana (Yellow) | Meetings |
| Grape (Purple) | Special Celebrations |

**Frontend Views:**
- **Month View** — visual grid calendar
- **List View** — scrollable upcoming events (default on mobile)
- Filter by event type
- Event detail modal/popover: title, date/time, location, description

**API Usage:**
- `events.list` endpoint with `timeMin = today`, `orderBy = startTime`, `singleEvents = true`
- Fetched via Next.js Route Handler; revalidated every hour (ISR)

---

### 5.6 Parish Announcements

**Purpose:** Publish timely notices, news, and updates to the congregation.

**Content managed via:** Sanity CMS

**Features:**
- Announcements list page with cards (title, excerpt, date)
- Individual announcement detail page
- Expiry date field — expired announcements automatically hidden from the frontend
- Pinned announcements (displayed at top regardless of date)

**Sanity Document Type:** `announcement`

**Fields:**
| Field | Type | Notes |
|---|---|---|
| `title` | String | |
| `slug` | Slug | Auto-generated from title |
| `body` | Portable Text | Full content |
| `publishedAt` | Datetime | |
| `expiresAt` | Datetime | Optional; hides post after this date |
| `pinned` | Boolean | Forces top position |
| `category` | String (enum) | e.g. `general`, `liturgy`, `youth`, `charity` |

---

### 5.7 Homilies

**Purpose:** Provide a searchable, filterable archive of priestly homilies, including audio recordings from Mass.

**Content managed via:** Sanity CMS  
**Audio storage:** Cloudinary

**Features:**
- Homily archive page with filter by priest, liturgical year, scripture reference
- Individual homily page with:
  - Title and date
  - Priest's name (linked to Clergy record)
  - Scripture reference(s)
  - Rich-text reflection body
  - Custom HTML5 audio player (styled with SCSS) for sermon recording
  - Optional: Liturgical season tag

**Sanity Document Type:** `homily`

**Fields:**
| Field | Type | Notes |
|---|---|---|
| `title` | String | |
| `slug` | Slug | |
| `author` | Reference → `clergyMember` | |
| `publishedAt` | Datetime | Date of the Mass |
| `scriptureReference` | String | e.g. "John 6:51-58" |
| `liturgicalSeason` | String (enum) | Advent, Christmas, Lent, Easter, Ordinary Time |
| `body` | Portable Text | Written reflection |
| `audioFile` | File (Cloudinary URL) | MP3 recording of the homily |
| `audioDuration` | String | e.g. "14:32" — entered manually |

---

### 5.8 Sacraments / Becoming Catholic

**Purpose:** Inform visitors about the sacraments offered by the Church and provide a pathway for those interested in joining the Catholic faith (RCIA).

**Content managed via:** Sanity CMS  
**Inquiry Form:** Tally.so embed

**Page Structure:**
- **Sacraments Overview** (`/sacraments`) — introductory page listing all seven sacraments with links
- **Individual Sacrament Pages** — rich-text content pages for each sacrament
- **RCIA Page** (`/sacraments/rcia`) — dedicated page explaining RCIA and the Catechumenate, with embedded Tally.so inquiry form

**RCIA Inquiry Form Fields (via Tally.so):**
- Full name
- Email address
- Phone number (optional)
- Current faith background
- How they heard about the parish
- Any specific questions or notes
- Preferred contact method

**Form submission** routes to a designated parish email address (configured in Tally.so).

**Sanity Document Type:** `sacramentPage`

**Fields:**
| Field | Type | Notes |
|---|---|---|
| `sacrament` | String (enum) | Slug key for the sacrament |
| `title` | String | Display title |
| `heroImage` | Image | |
| `body` | Portable Text | |
| `tallyFormId` | String | Only populated for RCIA page |

---

### 5.9 Livestream

**Purpose:** Allow parishioners who cannot attend Mass in person to watch live or access the most recent recorded Mass.

**Powered by:** YouTube Data API v3 + YouTube embed

**Logic:**
1. On page load, query the YouTube Data API for the parish channel's current live broadcast
2. **If live:** Display the live YouTube embed with a "LIVE" badge and viewer count
3. **If not live:** Display the most recent Mass recording from the channel
4. Supplementary text: Mass schedule, instructions for joining virtually

**Implementation Notes:**
- Parish YouTube channel ID stored as an environment variable
- API call made server-side (Route Handler) to protect API key
- Revalidated every 5 minutes (ISR)
- Graceful fallback if API quota is exceeded

---

### 5.10 Gallery

**Purpose:** Showcase photos and videos from parish events, organised and filterable.

**Content managed via:** Sanity CMS (metadata)  
**Media storage:** Cloudinary

**Features:**
- Gallery index page showing event albums as cards (cover photo, event name, date)
- Individual album page with masonry/grid photo layout
- Filter gallery index by year, category (e.g. Liturgical, Youth, Outreach, Fundraiser)
- Lightbox for full-size image viewing
- Video support (Cloudinary-hosted or YouTube embed)

**Sanity Document Type:** `galleryAlbum`

**Fields:**
| Field | Type | Notes |
|---|---|---|
| `title` | String | Event name |
| `slug` | Slug | |
| `eventDate` | Date | |
| `category` | String (enum) | |
| `coverImage` | Image (Cloudinary) | Thumbnail for album card |
| `description` | Text | Short description |
| `media` | Array of objects | `{ type: image/video, cloudinaryUrl, caption, altText }` |

---

### 5.11 Media Review System

**Purpose:** Ensure all media published on the website and social media channels is reviewed and approved by an authorised person before going public.

This is handled by two separate but complementary systems:

#### A. Website Media (Gallery / Homily Audio)

**Tool:** Sanity CMS native Draft/Publish workflow

- All media uploaded to Sanity starts as a **Draft** and is invisible on the live website
- A designated **Publisher** role (e.g. Parish Communications Officer, or an approved Priest) must review and click **Publish** in the Sanity Studio
- Unpublished content is never accessible via the public-facing site
- No additional tooling required

#### B. Social Media Posts

**Tool:** Loomly

- All social media content (Facebook, Instagram, etc.) drafted in Loomly
- An **approval workflow** is configured requiring sign-off from a designated reviewer before any post is scheduled or published
- Reviewer is notified by email when a post is submitted for approval
- Approved posts are scheduled automatically; rejected posts return to draft with comments
- Loomly's post preview feature shows exactly how content will appear on each platform before approval

---

### 5.12 Contact Page

**Purpose:** Provide visitors with the parish's contact details and a simple way to send a message.

**Form:** Tally.so embed (or native Next.js form → Resend)

**Page Sections:**
- Parish address: MMIA, Ikeja, Lagos
- Phone number(s)
- Email address
- Mass schedule summary (static, or pulled from Google Calendar)
- Embedded Google Map
- Contact form

**Contact Form Fields:**
- Full name
- Email address
- Subject / reason for contact (dropdown: General Enquiry, Sacramental Request, Volunteer, Other)
- Message
- Submit button

**Form submission** routes to the parish's general contact email via Tally.so or Resend.

---

## 6. Sanity CMS Schema Overview

| Document Type | Purpose |
|---|---|
| `aboutPage` | Singleton — About / Parish History page content |
| `clergyMember` | Individual clergy/catechist profiles |
| `announcement` | Parish announcements with expiry |
| `homily` | Homily records with audio and reflection |
| `sacramentPage` | Content for each sacrament page |
| `galleryAlbum` | Event photo/video albums |
| `donationCategory` | Admin-editable list of giving categories |
| `siteSettings` | Singleton — global settings (parish name, contact details, social links, YouTube channel ID) |

---

## 7. Third-Party Integrations Summary

| Service | Feature(s) | Auth Method |
|---|---|---|
| **Paystack** | Donations | Public key (client-side Popup JS) |
| **Universalis API** | Daily Readings | No auth (public API) |
| **Google Calendar API** | Parish Schedule | API Key (public calendar) |
| **YouTube Data API v3** | Livestream detection | API Key (server-side) |
| **Cloudinary** | Images, audio, video storage | API Key + Secret (server-side uploads) |
| **Tally.so** | RCIA form, Contact form | Embed ID (no backend required) |
| **Resend** | Transactional email (optional) | API Key (server-side) |
| **Loomly** | Social media approval workflow | SaaS — standalone tool |
| **Sanity CMS** | All content management | Project ID + Dataset + Token |

All API keys and secrets stored as **environment variables** — never committed to source control.

---

## 8. Non-Functional Requirements

### Performance
- Lighthouse score ≥ 90 on Performance, Accessibility, and SEO
- Core Web Vitals within "Good" thresholds
- Images served in next-gen formats (WebP/AVIF) via Cloudinary transformations
- Static pages (About, Sacraments, Clergy) built at compile time (SSG)
- Dynamic pages (Readings, Calendar, Livestream) use ISR with appropriate revalidation windows

### SEO
- Semantic HTML throughout
- Open Graph and Twitter Card meta tags on all pages
- Structured data (JSON-LD) for the parish as a `LocalBusiness` / `Church` entity
- Sitemap auto-generated via `next-sitemap`
- Canonical URLs configured

### Accessibility
- WCAG 2.1 AA compliance target
- Keyboard navigable
- Sufficient colour contrast ratios
- Alt text required on all images (enforced as a required field in Sanity)
- Audio player with accessible controls

### Security
- All secrets in environment variables (`.env.local` locally; hosting platform secrets in production)
- HTTPS enforced
- Tally.so and Paystack handle their own PCI/data compliance
- No unnecessary collection or storage of personal data

### Responsiveness
- Fully responsive: mobile-first design
- List view default for Calendar on mobile
- Touch-friendly gallery lightbox

### Hosting
- Recommended: **Vercel** (native Next.js support, preview deployments, easy environment variable management)

---

## 9. Roles & Permissions

### Website (Sanity Studio)

| Role | Permissions |
|---|---|
| **Administrator** | Full access — all document types, publish, delete, manage users |
| **Editor** | Create and edit all content; cannot publish or delete |
| **Publisher** | Create, edit, and publish all content; cannot manage users |
| **Media Reviewer** | Can view drafts and publish Gallery albums and Homily records only |

### Social Media (Loomly)

| Role | Permissions |
|---|---|
| **Admin** | Full access, billing, user management |
| **Manager / Reviewer** | Approve or reject posts submitted for review |
| **Contributor** | Draft posts, submit for review — cannot publish directly |

---

## 10. Out of Scope

The following are explicitly not included in v1.0 of this project:

- Online Mass registration or seat booking system
- Member/parishioner portal or login system
- Online confession scheduling
- Internal parish staff intranet
- Multilingual support (may be considered for v2)
- Native mobile application
- E-commerce (e.g. bookshop, merchandise)
- Automated social media cross-posting from the website

---

## 11. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | What is the parish's primary brand colour palette and existing logo assets? | Parish Communications | Open |
| 2 | Which Google account will own the parish Google Calendar? | Parish Admin | Open |
| 3 | Which YouTube channel will be used for livestreaming — existing or new? | Parish Admin | Open |
| 4 | Who will be the designated Sanity Publisher / Media Reviewer? | Parish Admin | Open |
| 5 | Will Paystack be registered under the parish's existing account or a new one? | Parish Finance | Open |
| 6 | What is the desired Loomly plan tier? (Base ~$32/mo recommended) | Parish Communications | Open |
| 7 | Are there existing photos/videos to seed the Gallery at launch? | Parish Communications | Open |
| 8 | Should the Tally.so RCIA form submissions also copy to a Google Sheet for tracking? | Parish Admin | Open |
| 9 | Is there a preference for the Sanity plan (Free tier or Growth)? | Dev / Admin | Open |
| 10 | What hosting environment is preferred — Vercel, or another provider? | Dev | Open |

---

*Document prepared for: Catholic Church of the Ascension, MMIA, Ikeja, Lagos.*  
*Next step: Review open questions with parish stakeholders, then proceed to project scaffolding and Sanity schema implementation.*
