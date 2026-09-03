# @treenweb/richtext

Lexical (Payload richtext) → safe HTML/AST serializer.

- Strict node/mark allowlist shared with the Payload editor config
- URL sanitisation (`http`/`https`/`mailto`/`tel` only)
- Defense-in-depth pass through `sanitize-html` / DOMPurify
- Unknown nodes dropped (never passed through raw)

Implemented in **Step 7** of [docs/ANALYSIS.md](../../docs/ANALYSIS.md).
