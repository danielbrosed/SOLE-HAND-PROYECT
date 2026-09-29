# Architecture

How Sole Hand is put together, without the production code, which is private. The aim is to show the reasoning: every piece sits where it sits for a reason. The short version, with the diagram, is in the [README](../README.md#architecture).

## The pieces

**Website (solehand.com).** React 18, Vite 8 and TypeScript, Tailwind CSS 4, GSAP and Lenis. Spanish at the root, English under `/en/` and a Mexican variant under `/mx/`. A build step prerenders 36 routes with Playwright, so every page ships as real HTML. Served by nginx from a Docker image.

**Lead service.** A small Node 24 service in its own container. It receives the contact form, validates it, sends the acknowledgement to the person and a short alert to the team.

**Sole Hand App (app.solehand.com).** React 18, React Router 7, Vite 8, TypeScript in strict mode and Tailwind CSS 4, shipped as an installable web app with 59 screens: sign-up and sign-in, account and membership, the member directory, events and seat booking, the Sole Hand Scale area, the portal for people who recommend, and the admin panel.

**Backend.** Self-hosted Supabase on a European VPS: PostgreSQL 17 with row-level security, auth, file storage, a REST layer over the database and 27 edge functions in TypeScript on Deno. The schema is 90 SQL migrations.

**Payments.** Stripe Checkout and the customer portal for memberships, signed webhooks into an edge function, and Stripe Connect for payouts to people who recommend.

**Content pipeline.** Social images and video rendered from HTML with the brand's own fonts and tokens (Playwright and GSAP), composed with ffmpeg and subtitled from a local whisper.cpp transcription.

## Website decisions

**Each locale has its own URL, decided at build time.** A build script writes the HTML for every locale with its own title, description, canonical, structured data and hreflang. The app reads the locale from the path when it boots, so there is no selector guessing anything and no content that changes after it has been painted. There is no router library: a handful of regular expressions map paths to pages.

**Prerendered for readers that do not run JavaScript.** Search crawlers, AI crawlers and link previews read the full page, legal pages included. The prerender fails the build if a route comes out with the wrong language or too little text.

**The copy is part of the system.** All the text lives in typed modules, one per locale, and the English module has to match the Spanish one in shape or the build fails. On top of that, a copy audit enforces the brand rules on every build: a list of words and phrases that must never appear, no long dashes, and the central claims present where they belong.

**Prices are never typed twice.** The website keeps an audited copy of what the app charges, and a build audit fails if they disagree or if a price is published before it is switched on.

**Contrast is recalculated on every build** against WCAG minimums for text and strokes, from the same palette tokens the site uses.

**Customer data does not pass through marketing platforms.** The form delivers to the lead service; details travel only through the company's own email. There are no tracking cookies.

**Security by default.** Security headers are set by hand in nginx (content policy, framing, referrer), HTML is served uncached so a fix is live at once, and the company's email address is out of the served HTML: address-harvesting bots were the source of spam, so the only written door is the form.

**Docker so that deploys are boring.** Reproducible builds, the same image locally and on the server, base images pinned by digest, and a server that only runs containers.

## Platform decisions

**Sign-up has no queue.** For the first weeks people applied and someone sent an invitation. It worked, but every new member cost a decision and an email, and whoever wanted in had to wait. Since late August sign-up is direct, as a member or as someone who recommends. What a person used to filter is now filtered by a honeypot field, per-address limits, mandatory consent and, since September, an email confirmation before any session exists.

**The database decides, not the screen.** Every table carries row-level policies: what a member can read, what the team can read and what nobody can read is written in the engine, not in the code that paints. A badly written screen can show too little; it cannot show too much. Operations that need privilege live in edge functions, and the key that carries that privilege never reaches the browser.

**Migrations are rehearsed before production sees them.** A rehearsal script starts PostgreSQL 17 inside the test process (PGlite), mounts a Supabase scaffold and applies every migration in order, each in its own transaction. Recent migrations come with a behaviour test for their policies, grants and edge cases, and most with an undo script. The whole rehearsal adds up to 806 checks and runs in the CI pipeline.

**Consent is stored whole.** Accepting the terms stores the version, the full text of that version and the time. Changing the text forces a new version: the history is never rewritten, so it is always possible to know exactly what each person accepted.

**Erasure is real.** An account can be removed for good: personal data, business data and files go. What the law requires to keep, such as the tax records behind a payout, stays for its legal period and is then purged by a nightly job that reads its periods from a single table. Every erasure is recorded, so it is applied again if an older backup is ever restored.

**The audit trail cannot be rewritten.** Nobody, not even the service role, can update, delete or truncate it, and it is minimised: no IP addresses and no emails, only keyed fingerprints.

**Payments follow Stripe, not the event.** The webhook applies the state Stripe holds at that moment instead of the payload it received, so retries and out-of-order deliveries end in the same place. Every call to Stripe has a pinned API version and a timeout, and a watchdog emails the team when anything about money goes wrong, without personal data in the message.

**The design system checks itself.** Colours and sizes come from a single scale, and checks fail the build if anything steps outside it: no colour off the palette, no invented size, no corner that does not come from the scale. Before each deploy every screen is walked in a real browser on a phone viewport, looking for overflow, console errors and touch targets too small for a finger.

## AI tools

There is no catalogue. Each tool starts from a concrete problem of a business in Sole Hand Scale and is built for that business: problem first, tool second.

They all share a deliberate boundary: **they collect and hand over, and a person decides.** Two legal duties are part of the design from day one:

- The tool introduces itself as a virtual assistant, as Article 50 of the EU AI Act requires from 2 August 2026.
- Data is processed on European infrastructure, and each business signs a data processing agreement under Article 28 of the GDPR. The business decides what is kept and for how long.

## Content system

Social pieces are not made one by one by hand. The text of each piece lives in a JSON script with the source of every figure, a validator rejects anything that contradicts the brand (banned words, an amount typed by hand, more than one italic word per headline), and the browser renders each slide at native size with the real fonts and logo embedded. Every post comes out of the same mould as the website.
