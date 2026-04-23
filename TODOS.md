# TODOs

- [x] Add a fixed top header with logo, animated brand hover copy, availability badge, and social icons.
- [x] Move header and bottom navigation configuration into `data/navigation.ts`.
- [x] Add a Projects item with a `New` badge to the bottom dock.
- [x] Fix dock hover math to use real DOM positions instead of evenly split widths.
- [x] Fix nav label reveal animation and contact-item hover behavior.
- [ ] Replace the placeholder Discord and Instagram profile URLs in `data/navigation.ts`.
- [ ] Add real route content for `/projects` when that page is ready.

## Backend DB Modeling

- [x] Audit current content sources in `data/`, `content/`, and `types/`.
- [x] Read local Next.js 16 docs for data fetching, caching, revalidation, ISR, and metadata.
- [x] Verify Drizzle, postgres-js, Supabase, dotenv, and drizzle-kit dependencies are present.
- [x] Scaffold Drizzle config, environment example, schema barrel, and read/admin DB clients.
- [x] Model normalized Postgres tables for site, SEO, navigation, sections, media, impact, contact, and inquiries.
- [x] Add DB scripts for generate, push, studio, and migrate.
- [x] Document the backend data model, ShadCN dashboard UX shape, revalidation plan, and SEO-from-backend plan.
- [ ] Generate migrations after pruning/confirming the final table set.
- [ ] Seed Supabase from the current static website data.
