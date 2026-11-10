# Image delivery

Public images render in the initial server-generated HTML. `SiteImage` selects
responsive WebP and AVIF files from `lib/image-assets.json`; those files live under
`public/media` and use content hashes with immutable browser/CDN caching. The
original CMS URLs are preserved for editing, but synced images do not contact
ImgBB or invoke the Next.js image optimizer when visitors view them.

Run `npm run images:sync` after adding or replacing CMS images, then deploy the
updated manifest and `public/media` together. This command reads `content_blocks`
using `MONGODB_URI` and `MONGODB_DB` from `.env.local`; it does not write to the
database. It also generates variants for local raster images under `public`.
Review any reported download failures before deployment. Original download
copies are cached under `.cache/image-sources` and survive Next.js builds; delete
the corresponding cached source if an upstream URL was overwritten in place.

Page previews are capped at 960 pixels and use stronger compression. Browsers
receive AVIF when its combined variants are smaller, with WebP as a fallback.
Lazy images use their rendered width where the browser supports automatic sizes,
and gallery sizing also includes an explicit CSS calculation as a fallback.

New, unsynced uploads still use Next.js optimization. Browser uploads resize
large originals to at most 2400 pixels on the longest edge with WebP encoding.
Gallery images outside the viewport load lazily; initial visible tiles and the
active lightbox image load eagerly. Opening a lightbox no longer preloads large
originals from the external host.

Public pages retain server generation with five-minute incremental revalidation.
The image sitemap uses the same optimized URLs as the gallery. The initial page
has no full-screen loading overlay, and hero/header content is visible before
JavaScript hydration.
