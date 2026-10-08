# Architecture

How Sole Hand is put together, without the production code, which is private. The aim is to show the reasoning: every piece sits where it sits for a reason. The short version, with the diagram, is in the [README](../README.md#architecture).

## The pieces

**Website (solehand.com).** React 18, Vite 8 and TypeScript, Tailwind CSS 4, GSAP and Lenis. Spanish at the root, English under `/en/` and a Mexican variant under `/mx/`. A build step prerenders 36 routes with Playwright, so every page ships as real HTML. Served by nginx from a Docker image.

**Lead service.** A small Node 24 service in its own container. It receives the contact form, validates it, sends the acknowledgement to the person and a short alert to the team.

**Sole Hand App (app.solehand.com).** React 18, React Router 7, Vite 8, TypeScript in strict mode and Tailwind CSS 4, shipped as an installable web app with 70 screens: sign-up and sign-in, account and membership, the member directory, events and seat booking, the Sole Hand Scale area, the portal for people who recommend, the agents' area and the admin panel.

**Backend.** Self-hosted Supabase on a European VPS: PostgreSQL 17 with row-level security, auth, file storage, a REST layer over the database and 33 edge functions in TypeScript on Deno. The schema is 101 SQL migrations.

**Agent service.** Node 24 and TypeScript in a container of its own, built and tested and not yet deployed: Hono for HTTP, grammY for the Telegram Bot API, pg-boss for jobs inside PostgreSQL, zod to validate every boundary and pino for logs. It connects to the same database with a role of its own.

**Scheduled jobs.** systemd timers on the server: the money watchdog every hour, push delivery every minute, account reminders every hour of the working day and the purges every night.

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

**Migrations are rehearsed before production sees them.** A rehearsal script starts PostgreSQL 17 inside the test process (PGlite), mounts a Supabase scaffold and applies every migration in order, each in its own transaction. Recent migrations come with a behaviour test for their policies, grants and edge cases, and most with an undo script. The whole rehearsal adds up to 1,071 checks and runs in the CI pipeline.

**Consent is stored whole.** Accepting the terms stores the version, the full text of that version and the time. Changing the text forces a new version: the history is never rewritten, so it is always possible to know exactly what each person accepted.

**Erasure is real.** An account can be removed for good: personal data, business data and files go. What the law requires to keep, such as the tax records behind a payout, stays for its legal period and is then purged by a nightly job that reads its periods from a single table. Every erasure is recorded, so it is applied again if an older backup is ever restored.

**The audit trail cannot be rewritten.** Nobody, not even the service role, can update, delete or truncate it, and it is minimised: no IP addresses and no emails, only keyed fingerprints.

**Payments follow Stripe, not the event.** The webhook applies the state Stripe holds at that moment instead of the payload it received, so retries and out-of-order deliveries end in the same place. Every call to Stripe has a pinned API version and a timeout, and a watchdog emails the team when anything about money goes wrong, without personal data in the message.

**The design system checks itself.** Colours and sizes come from a single scale, and checks fail the build if anything steps outside it: no colour off the palette, no invented size, no corner that does not come from the scale. Before each deploy every screen is walked in a real browser on a phone viewport, looking for overflow, console errors and touch targets too small for a finger.

**Push notifications without a vendor.** The Web Push standards are implemented directly with WebCrypto: the VAPID signature is an ES256 token (RFC 8292) and the payload is encrypted with ECDH P-256, HKDF-SHA-256 and AES-128-GCM in the aes128gcm format (RFC 8291 and RFC 8188), tested against the RFC's own vector. A trigger turns each relevant notice into one row per device in a queue inside PostgreSQL, and a timer drains it every minute. A device that the push service rejects is removed; a temporary failure is retried and never deletes it. On an iPhone this works once the app is installed, so the prompt to turn it on appears after installing.

**Bank details are encrypted where they are written.** People who recommend can be paid by bank transfer. The IBAN is checked against the SEPA lengths and the mod-97 rule in three places (the browser, the function and the database, with a test that keeps them identical) and encrypted with AES-256-GCM: a fresh 12-byte nonce each time, the owner's account as authenticated data so a ciphertext moved to another row does not decrypt, and a version prefix so the key can be rotated one day. The person who typed it sees only a masked hint; the team's payout screen is the only place it is decrypted, and a new or changed account is reviewed before any money goes to it.

**Third parties stay inside a frame.** The monthly meeting is booked in an embedded calendar and event tickets are bought in an embedded checkout. Both come from their own origin and are allowed one by one in the content security policy, which still only runs the app's own scripts. When the calendar reports a booking, the time and the meeting link are validated on the server (a real date, in the future, a link from a known meeting host) before the meeting is stored as confirmed; anything that does not fit stays as a request for the team to schedule.

**A paid ticket is not a seat.** A seat is booked inside the app only when the event comes with the person's membership. When the ticket is sold elsewhere, the event page offers the checkout and nothing else, for every account, including the team's, which the database would otherwise let through.

**Scheduled work knocks on the inside door.** Each timer calls its function through the gateway on the server's own loopback, with a secret that belongs to that job alone. The proxy refuses those functions from the internet even with the right secret. A failed run reaches the team by email, or through the hourly health check for the job that runs every minute.

**Reminders need no table of their own.** Accounts left half done (no business, a profile without name or photo, or, for someone who recommends, the agreement, tax details or payout account missing) get an email after a day, three days and a week. Every reminder sent is a line in the audit trail, which already has its retention period, and that line is what counts how many a person has had. The button in the email survives signing in: the app remembers where it was sent and goes back there.

## AI tools

There is no catalogue. Each tool starts from a concrete problem of a business in Sole Hand Scale and is built for that business: problem first, tool second.

They all share a deliberate boundary: **they collect and hand over, and a person decides.** Two legal duties are part of the design from day one:

- The tool introduces itself as a virtual assistant, as Article 50 of the EU AI Act requires from 2 August 2026.
- Data is processed on European infrastructure, and each business signs a data processing agreement under Article 28 of the GDPR. The business decides what is kept and for how long.

### The agents

The first tools with a shape of their own are four agents for the owner of each business in Sole Hand Scale: follow-up, priorities, replies and reports. Each has six actions, and each action is either allowed, allowed after the owner approves, or blocked. In the first version nothing is sent without approval, and that rule is a constraint in the database, not a setting.

**A separate service with a narrow door.** The agents run in their own Node 24 service, which enters PostgreSQL with a role of its own: not a superuser, unable to bypass row-level security, with a cap on connections. Every one of the 25 tables in the agents' schema has row-level security forced, and their policies compare the row with the business pinned to the current transaction. That pin is set in exactly one function of the service, and a test fails if any other code sets it. Queries that must run before a business is known go through a handful of database functions that return ids and nothing else.

**The queue lives in the database.** Background jobs run on pg-boss inside PostgreSQL, so there is no second system to back up or secure. Requests from the app are rows in an orders table: a trigger notifies the service, which also sweeps every thirty seconds and claims each order with `FOR UPDATE SKIP LOCKED`. Job payloads may carry ids only; a key that looks like content is rejected before it is queued.

**Credits are a ledger.** A balance that a check constraint keeps at zero or above, and an append-only list of movements with a unique reference per movement. Work reserves credits before it starts, closes the reservation when it finishes and returns what it did not use; reservations that are left behind expire and come back on their own.

**Consent comes from the server.** Before an agent can do anything, the owner accepts the processing agreement in the app, and the server stores its own copy of the text with the time and the address it came from, never what the browser claims to have shown.

**Telegram, carefully.** Linking a chat starts in the app with a one-time code of 24 random bytes, stored only as its SHA-256, valid for ten minutes and usable once; the service redeems it and the owner confirms the link from the app. In production the bot only listens through a webhook whose secret is compared in constant time, with a cap on the body size. It answers private chats only, processes each update once, and sends messages through an allowlist of methods and fields with no formatting and no link previews.

**What the model will and will not do.** The language-model layer is designed and comes next. A model gets three narrow jobs: turning a forwarded email into a typed record validated against a schema, drafting a reply for the owner to approve, and transcribing voice notes. It has no tools and no network access. Deciding that something needs a follow-up is deterministic SQL; answers come from PostgreSQL full-text search and point to the email they rely on; and before a prompt ships it has to pass a set of labelled and adversarial cases with fixed precision and recall thresholds. The plan uses open-weight models through a provider pinned with no fallbacks and no data retention. Nothing here trains a model on anyone's data, profiles people or scores them.

## Content system

Social pieces are not made one by one by hand. The text of each piece lives in a JSON script with the source of every figure, a validator rejects anything that contradicts the brand (banned words, an amount typed by hand, more than one italic word per headline), and the browser renders each slide at native size with the real fonts and logo embedded. Every post comes out of the same mould as the website.
