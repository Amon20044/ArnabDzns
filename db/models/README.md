# MongoDB Content Model

The public site now uses Mongoose instead of Postgres/Drizzle.

## Collection

`content_blocks`

Each document represents one visible content area. The shape stays intentionally
simple for editing:

- `key`: stable id, for example `home_hero`, `services`, `faq`
- `title`: string or string array
- `desc`: short description/body copy
- `text`: extra visible copy, such as eyebrow/helper text
- `color`: primary visual/accent color
- `order`: display order
- `images`: bounded embedded image/logo items
- `items`: bounded embedded cards/FAQ/service/testimonial summaries
- `data`: exact typed payload used by the existing React components

MongoDB works well here because each section is read as a whole. The bounded
arrays keep each section update atomic and avoid joins.

## Runtime Flow

- Public pages call `getHomeContent()`, `getLayoutContent()`, and
  `getContactPageContent()` from `db/content.ts`.
- Those reads use `unstable_cache` with explicit tags from `db/cache-tags.ts`.
- If `MONGODB_URI` is missing or Mongo is unavailable, the app falls back to the
  existing static `data/*` content so local builds still work.
- Admin writes can call `PATCH /api/content/[key]` with `REVALIDATE_SECRET`.
  The route updates MongoDB, then calls `revalidateTag(tag, "max")` and
  `revalidatePath(...)` for the affected page.

## Seeding

Run:

```bash
npm run db:seed
```

Use `npm run db:seed:missing` to insert only missing documents without
overwriting edited MongoDB content.
