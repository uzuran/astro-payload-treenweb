# @treenweb/schemas

Single source of truth for cross-service contracts:

- Zod env schemas for each app (fail-fast validation at boot)
- Zod request/response DTOs for every frontend ↔ backend boundary
- Re-export of the generated `payload-types` + `z.infer` parity helpers

Implemented in **Step 6** of [docs/ANALYSIS.md](../../docs/ANALYSIS.md).
