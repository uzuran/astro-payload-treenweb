# @treenweb/frontend

Astro 5 SSR site (`output: 'server'`, `@astrojs/node` standalone). Renders
content from Payload over the internal network; the browser never talks to the
CMS directly.

## Layout

```
src/
  env.ts               Zod-validated server env (fail fast)
  middleware.ts         defense-in-depth headers + HTML cache-control
  lib/
    payload/client.ts   typed + Zod-validated fetch client (timeout, PayloadError)
    seo/                buildMeta + JSON-LD builders (unit-tested)
    richtext/render.ts  PLACEHOLDER — replaced by @treenweb/richtext in Step 7
  components/           BaseHead.astro, RichText.astro
  layouts/BaseLayout.astro
  pages/
    index.astro         home (Payload page slug "home")
    [...slug].astro     any page by slug — real 404 via Astro.response.status
    posts/[slug].astro  a post by slug
    404.astro
    healthz.ts          liveness JSON
    robots.txt.ts       robots + sitemap pointer
    sitemap.xml.ts       dynamic sitemap from published pages + posts
```

## Commands

| Command                                      | Purpose                                                     |
| -------------------------------------------- | ----------------------------------------------------------- |
| `pnpm --filter @treenweb/frontend dev`       | Astro dev server on :4321                                   |
| `pnpm --filter @treenweb/frontend build`     | SSR build → `dist/server/entry.mjs`                         |
| `pnpm --filter @treenweb/frontend preview`   | serve the production build                                  |
| `pnpm --filter @treenweb/frontend typecheck` | `astro check`                                               |
| `pnpm --filter @treenweb/frontend test:unit` | Vitest — SEO builders, richtext placeholder, payload client |

From the repo root: `make up` runs it in a container alongside Postgres + Payload.

## Environment

- **In the compose stack** (`make up`): env is injected by `infra/docker-compose.dev.yml`.
- **On the host**: `make env` writes `frontend/.env`; set `PAYLOAD_INTERNAL_URL`
  to `http://localhost:3000` (not `@backend:`).

Vars: `PUBLIC_SITE_URL`, `PAYLOAD_INTERNAL_URL`, `PUBLIC_PLAUSIBLE_DOMAIN`,
`PUBLIC_PLAUSIBLE_SRC`. See `.env.example`.

## Deferred

- **`@astrojs/react` islands** — added when the first interactive component
  lands (no islands in the skeleton, keeps the React tree out for now).
- **Sentry** (`@sentry/astro`) — wired with sourcemap upload in Step 10.
- **Real richtext** — `src/lib/richtext/render.ts` is a passthrough that escapes
  everything; Step 7 swaps in the sanitising serializer.
- **`@astrojs/sitemap`** — replaced by the dynamic `sitemap.xml.ts` endpoint
  because routes are DB-driven.
