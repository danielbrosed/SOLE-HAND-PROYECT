# Build log

The project's milestones, with their dates. Updated as the build moves. The summary table is in the [README](../README.md#roadmap).

## October 2026

**6 October.** The AI agents get their foundations and their front door in a single day. Underneath: the agents run as a separate service that enters the same PostgreSQL with a role of its own, so the database itself keeps each business apart (forced row-level security on every table, and with no business pinned to the session the service sees nothing at all); the job queue lives inside Postgres; credits are a ledger that never goes below zero, with reservations that expire and are returned; and the owner's consent to the data-processing agreement is signed on the server, with the server's own copy of the text and the IP address it came from, never with what the browser sends. The migration was rehearsed against an in-memory PostgreSQL and then measured on a separate staging stack, where it turned up what the in-memory rehearsal cannot see. Three rounds of adversarial review went over it before the first commit. On top: the agents' screens in the Sole Hand App stop being a mock-up and read from the database, honest about what is not running yet, and a four-step onboarding (your business, where I read from, how much I decide alone, where I talk to you) saves as you go.

**4 and 5 October.** The command centre for the agents is drawn from a finished design and kept local while the plan is written: phases, tests and the order of every production step, with the cost of each agent worked out per customer before a line of it is built.

**30 September.** Four agents are decided for the owner of each business (follow-up, priorities, replies and reports): they read the email the business forwards, talk over Telegram, and in this first version they propose and wait for the owner's approval.

## September 2026

**Late September.** A full security audit of the platform (code, database, infrastructure and secrets) becomes a six-phase hardening programme: perimeter and backups, secrets, payments, identity and access, data, files and GDPR, and supply chain and staging. Phases 1 to 5 are deployed in production; phase 6 is rolling out. Membership sales open when the programme closes.

**20 to 25 September.** The feed is rebuilt with pieces that teach something even if nobody joins: two carousels (what it costs to build a business alone, and the questions to ask before paying anyone for AI) and two single pieces. The composition system is generalised: every post is a JSON script with the source of each figure, a validator rejects text that contradicts the brand or an amount typed by hand, and the slides are rendered by the browser at native size.

**16 and 17 September.** Second piece from the video workshop: an interview recorded at a conference, reframed per speaker, with subtitles placed under whoever is speaking and name and role captions. The chain becomes repeatable: swap the raw footage and the script, then run the steps in order.

**15 September.** The six-month programme is renamed **Sole Hand Scale**. The change runs through the whole website in its three locales: routes, metadata, structured data, terms and translations.

**11 September.** The programme's price goes on the website, where it used to be discussed in the meeting, and the video workshop starts: local transcription, an animated graphic layer rendered from HTML, and a final composition that keeps the original footage exactly as it came out of the camera.

**10 September.** The website is measured on the phone with a script that opens an emulated handset, walks the page screen by screen and counts how much pure black each screen shows. With the numbers on the table come the green halos and the adjustments that only affect small screens: the desktop layout is left alone.

**9 September.** The new logo arrives (a shield with an open hand and the letters S and H in its strokes) and with it the look of a Mediterranean club: cream instead of white, film grain and editorial imagery. The brand manual is published at solehand.com/marca, generated from the same tokens the website paints with. Past events get their real recordings.

**8 September.** The project is redefined: Sole Hand is now told as a community of entrepreneurs that meets in person, with a six-month programme for people starting out (today Sole Hand Scale) and a recommendation programme with its rules in plain sight. The website is rebuilt in three locales, with a new palette (black, white and greens), event and programme pages, and build guards that watch the copy, the prices and the contrast. The community's conversation goes back to WhatsApp; the app keeps the events, the account and the portal for people who recommend.

## August 2026

**24 August.** Sign-up loses its queue: whoever arrives registers and gets in, as a member or as someone who recommends, with no application for anyone to approve. The community is emptied of demo data and made ready for real people.

**23 August.** A top-to-bottom aesthetic pass, with an audit that measures instead of eyeballing: font sizes, touch targets, corners and the phone's safe area. Out of it come the rounded corners across the app and a type scale designed for the phone rather than inherited from the desktop.

**22 August.** A security pass on the platform, and account deletion that honours the GDPR right to erasure without leaving other people's conversations half empty.

**20 and 21 August.** The community moves from WhatsApp to a home of its own: channels, posts with files, three-level threads, reactions and direct messages. With it come the tools lab and the portal for people who recommend.

**19 August.** The social series is ready: five carousels on what the project is, how the community works, how to join and how to collaborate. Every cover is a different object from the marble collection, and all of it comes out of the in-house composition system.

**18 August.** Hardening day: security headers in nginx, a reproducible build of the lead service, and the email address out of the HTML, which was where the spam came from. Whoever wants to write uses the form.

**17 August.** Launch: solehand.com serves the full website in Spanish and English. The home page stops being a pre-landing.

**15 and 16 August.** Infrastructure week: own domain, Docker packaging with nginx, the lead service in production, and community sign-up with phone number and explicit consent. The community settles in WhatsApp.

**12 August.** The members' card takes shape, and the /hablamos page is born with three doors: join the community, ask for a meeting, or propose a collaboration.

**8 to 10 August.** The website goes from idea to a finished piece: bilingual, with the community as the lead, and an identity that does not look like it came from an agency. The copy rules that govern the whole project are written down.

## July 2026

**Last week of July.** The brand photo collection (Carrara marble, chrome and black) and the open circle that was the project's first symbol are born. They were made for an earlier idea that was dropped, and they survived the pivot. The first website and the first social pieces came out of that collection, until the current identity replaced it in September 2026.
