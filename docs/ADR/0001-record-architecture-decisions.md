# 1. Record architecture decisions

- **Status:** accepted
- **Date:** 2026-09-03

## Context

We need a lightweight, durable record of the significant architectural
choices made while building `astro-payload-treenweb`, so future
contributors understand _why_ the system looks the way it does.

## Decision

We use Architecture Decision Records (ADRs), one Markdown file per decision
in `docs/ADR/`, numbered sequentially (`NNNN-title.md`). Each ADR has
Status, Date, Context, Decision, Consequences. ADRs are immutable once
accepted; a later ADR supersedes an earlier one and links back to it.

## Consequences

- Every item in `docs/ANALYSIS.md` Part 4 gets its own ADR before or during
  the step that depends on it.
- PRs that make an architectural choice must add or reference an ADR.
