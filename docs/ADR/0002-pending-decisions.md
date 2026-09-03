# 2. Pending cross-cutting decisions

- **Status:** proposed (awaiting confirmation)
- **Date:** 2026-09-03

## Context

`docs/ANALYSIS.md` Part 4 lists ten cross-cutting choices. They do not block
Step 1 (workspace scaffold) but several block later steps. This ADR records
the current recommendation for each; each will be split into its own
accepted ADR when its step begins.

## Decisions (recommended defaults)

| #   | Topic              | Recommendation                                                                                  | Blocks                     |
| --- | ------------------ | ----------------------------------------------------------------------------------------------- | -------------------------- |
| 1   | Routing            | Subdomain: `treenweb.example` + `cms.treenweb.example`                                          | Step 8                     |
| 2   | Zod major          | `zod@^3.23`                                                                                     | Step 6                     |
| 3   | Task runner        | Turborepo for `build/lint/test/typecheck` + CI cache                                            | Step 10 (optional earlier) |
| 4   | Prod media storage | S3-compatible (`@payloadcms/storage-s3`)                                                        | Step 4 / 11                |
| 5   | Plausible          | Cloud first; self-host later behind Traefik                                                     | Step 8                     |
| 6   | Deploy target      | Single Docker host + Compose; brief deploy blip accepted                                        | Step 10 / 11               |
| 7   | ACME challenge     | HTTP-01 (single host) unless wildcard needed -> DNS-01                                          | Step 8                     |
| 8   | i18n               | Single locale at launch, schema kept localization-ready                                         | Step 4                     |
| 9   | Admin protection   | Traefik IP allowlist + login lockout; forward-auth optional                                     | Step 8                     |
| 10  | Migration policy   | `push` dev only; generated migrations + `payload migrate` in staging/prod; expand/contract only | Step 4                     |

## Consequences

If the defaults stand, later steps proceed without re-litigation. Any
change here is made by superseding this ADR before the affected step.
