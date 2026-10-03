# CLAUDE.md

Capstone for the Parsity AI Engineering program: attribution-first RAG over You Are Not So Smart (YANSS) episodes, plus an ad/sponsor ledger extracted from the audio. Goal is transferable skills and finishing, not a business.

## Scope guard
Before adding a feature, ask which course module or skeleton stage it serves. If none, defer it. Prefer the simplest design that exercises the module. Build a thin end-to-end walking skeleton (episode 335) first; deepen one stage at a time.

## Stack
TypeScript, Node, Next.js, Zod, Pinecone, OpenAI, LangSmith. Python only for offline preprocessing (Whisper). Config via environment variables only.

## Architecture
Two deployables: a stateless web app and a pipeline worker/CLI. Heavy work never runs in a web request. Contract between them is Zod-validated data (episodes, transcript JSON, ad segments, chunks). Steps are idempotent, keyed by episode guid + content hash. Small adapters, one implementation each: ObjectStorage, Transcriber, VectorStore, LLM, LedgerStore, Tracer. Do not depend on local disk persisting in hosted environments.

## Pipeline rules
Ad detection runs on raw text before any cleanup (codes like SMART50 must not be altered). Chunks never straddle an ad. Summaries are metadata only, never replacing source text. Ad-boundary and sponsor examples in the plan are hypotheses until verified against audio.

## Creator-respecting
Link back to the creator's audio, quote briefly, and make no claims about whether sponsor product claims are true. No YouTube scraping.

## Private folder
`private/` is git-ignored. It holds .env/API keys, cached audio, full transcripts, hand labels, and scratch notes. Never print, summarize, or commit the contents of `private/` or any `.env` file. CI fails if anything under it is tracked.

## Working agreement
- Every change is tracked by an issue with checklist acceptance criteria. No work without an issue.
- One branch per issue: `issue-<n>-short-slug`. One PR per issue; body says `Closes #<n>`, what and why, how tested, and eval numbers when relevant.
- Claude opens PRs but never merges them, never pushes to main, never force-pushes. The user reviews and squash-merges.
- CI (typecheck, lint, tests, private-file guard) must pass before merge.
- Plan-changing decisions go in `docs/decisions/` as short numbered notes, via PR.
- Do not commit Parsity course materials or exercise solutions to a public repo.
