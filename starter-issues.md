# Starter issues — draft for review

This is a planning draft, not an initialized repository or implemented project.
Approve or revise this list before creating GitHub issues. No project code starts
until its issue exists. Issue numbers below are deliberately not assigned.

## Scope and sequence

Build a Parsity capstone for learning and completion: attribution-first RAG over
10–20 episodes of You Are Not So Smart, with an audio-derived sponsor ledger
feeding the chat. Start with episode 335. Keep audio, full transcripts, and
per-episode labels private. Public answers use short excerpts and creator links.
Report what an ad says without endorsing or verifying its product claims.

Sequence: repository setup → walking skeleton → deepen one stage at a time.
Every feature must serve a course module or pipeline stage; otherwise defer it.
All example ad boundaries, sponsor fields, and codes in the handoff are hypotheses
to verify against downloaded audio, not ground-truth labels.

## Tracking conventions

- One issue, branch (`issue-<number>-short-slug`), and PR per change.
- PRs state `Closes #<number>`, the change and reason, validation, and applicable
  evaluation results. The user merges; the agent never merges, pushes to main,
  or force-pushes.
- CI runs typecheck, lint, tests, and a tracked-private-files guard.
- Record changes to the plan in short numbered notes under `docs/decisions/`.
- Every issue includes checklist acceptance criteria.

Suggested labels: `type:setup`, `type:feature`, `type:eval`, `type:research`,
`type:docs`; `priority:p0`, `priority:p1`, `priority:stretch`; and `module:<n>`
for curriculum modules once mapped from the actual overview.

Create five milestones: `Module 5 deliverable`, `Module 7 deliverable`,
`Module 9 deliverable`, `Module 14 deliverable`, `Module 15 deliverable`.
Their detailed scope, issue assignments, and due dates await the curriculum.
The handoff specifically maps faithfulness judging to Module 12; other module
assignments below remain unset rather than guessed.

## A. Bootstrap repository and contribution safeguards

Labels: `type:setup`, `priority:p0`. Stage: project foundation.

Create this tracking issue first, then implement setup on its issue branch.
Resolve the empty-repository bootstrap explicitly: if a base commit is necessary
to open the first PR, agree on that exception before any initial main push.

- [ ] Confirm GitHub owner/name, visibility, and whether the instructor requires
  the shared course repository or a separate capstone repository.
- [ ] Record the license decision; do not select a license implicitly.
- [ ] Add a README covering purpose, scope, private-data policy, build order,
  configuration, and placeholders for runnable setup commands.
- [ ] Add `CLAUDE.md` with the handoff's project and contribution rules and an
  `AGENTS.md` entry point so other coding agents follow the same rules.
- [ ] Confirm the contents of `private/`; ignore that folder from the first
  commit, all secret `.env` files, and generated/cache files. Allow only a
  placeholder `.env.example` with no secrets.
- [ ] Never print, summarize, or commit private-folder or `.env` contents.
- [ ] Add issue and PR templates, approved labels, and the five milestones.
- [ ] Configure main protection if available for the chosen plan/visibility;
  otherwise document the PR-only convention.
- [ ] Add CI enforcement against tracking `private/` or secret environment files;
  add application checks as the skeleton introduces the toolchain.
- [ ] Keep course materials and exercise solutions out of a public repository.

## B. Ship the thin episode-335 walking skeleton

Labels: `type:feature`, `priority:p0`. Depends on A. Stages: all, minimally.

This is one end-to-end issue. Do not turn it into polished, disconnected stages.
Use TypeScript, Next.js, Zod, OpenAI, Pinecone, and optional LangSmith tracing;
offline local Whisper preprocessing requires instructor confirmation.

- [ ] Document clean-checkout prerequisites and one pipeline command for episode
  335 (GUID `de80c644-7a2d-4e68-93ae-6156f19b7c62`) from the Simplecast feed.
- [ ] Validate episode, transcript, ad-segment, chunk, router, and tool-argument
  contracts with Zod; retain raw word timestamps.
- [ ] Implement the full path: cached RSS → audio → offline transcription → raw
  ad candidates/fields → content spans → glossary → deterministic chunks →
  embeddings/sparse index → router → retrieval/reranking or ledger → answer.
- [ ] Start with regex candidates and code/URL extraction; use a cached LLM call
  only on positive windows if sponsor/offer extraction needs it. Distinguish
  sponsor ads from house promos. Ground ledger evidence in the actual audio.
- [ ] Keep stage interfaces small, with one implementation each: local object
  storage, local Whisper, Pinecone, OpenAI, JSON ledger, and no-op/LangSmith tracer.
- [ ] Cache and resume stages using episode GUID, input hash, and relevant
  model/prompt/config versions. Ads are extracted before glossary cleanup.
- [ ] Keep chunks out of ad intervals, preserve timestamps, and index ads
  separately. Use a minimal hybrid combination and deterministic reranking.
- [ ] Route sponsor questions to validated fixed ledger tools and content
  questions to retrieval; answer with episode, time, speaker context when known,
  and a creator audio/page link. Abstain when evidence is missing.
- [ ] One UI page answers “what is parts work?” with a supporting timestamp and
  “which sponsor and code did 335 use?” using the verified ledger.
- [ ] Keep heavy processing outside web requests; use environment configuration,
  stdout logging, a health endpoint, and portable app/worker containers with
  local compose instructions.
- [ ] Check current hosting limits before selecting one target. Serve the demo
  from precomputed, publication-appropriate data without depending on writable
  persistent web-app disk. No public audio, transcript, or labels directory.
- [ ] Resolve the handoff's public-demo ambiguity: it permits cited excerpts and
  a ledger query, but later says publish only aggregate findings and method.
  Agree on audience/access before publishing per-episode results.
- [ ] CI passes typecheck, lint, private-file guard, and a deterministic full-path
  smoke test using synthetic fixtures and provider doubles. Separately run the
  real episode/provider smoke eval and record its result without private text.
- [ ] A LangSmith trace demonstrates routing, tool/retrieval, and generation;
  omit private text, secrets, and full transcripts from trace payloads.
- [ ] A hosted deployment serves the same two questions; document necessary
  external credentials, private input acquisition, and deployment setup.

## C. Verify feed, audio variability, and timestamp playback

Labels: `type:research`, `priority:p1`. Depends on B. Stage: ingestion/citations.

- [ ] Politely fetch and cache the feed; download four episodes across years
  with delays and quoted redirect-following URLs.
- [ ] Download one episode twice at different times and compare bytes/hashes;
  do not infer dynamic ad insertion solely from a byte difference or equality.
- [ ] Record download time, enclosure URL, hash, duration, and transcript linkage
  privately so timestamps refer to a specific audio copy.
- [ ] Verify a creator audio-element seek or timestamp link, plus a page-link
  fallback. Describe observed offset risks without claiming untested causes.
- [ ] Record aggregate observations and a small decision note; no private audio
  or transcript publication.

## D. Build private labels and baseline sponsor evaluation

Labels: `type:eval`, `priority:p1`. Depends on B. Stage: ad extraction/evaluation.

- [ ] Hand-label episode 335 first, then 5–10 episodes with start/end, type,
  sponsor, and code; include house promos as sponsor-query negatives.
- [ ] Define the 50% overlap matching rule explicitly, including denominator,
  one-to-one matching, and how split/merged predictions are treated.
- [ ] Hold out whole episodes; do not split random windows across train/test.
- [ ] Report segment precision/recall, median boundary error, sponsor/code field
  accuracy with denominators, and cost per episode for the rules baseline.
- [ ] Inspect misses against audio and tighten boundaries with word timestamps.
- [ ] Keep labels private; publish only permitted aggregate metrics/method.

## E. Evaluate glossary and chunking with timestamped questions

Labels: `type:eval`, `priority:p1`. Depends on B. Stage: content preparation.

- [ ] Create 15–20 private episode-335 questions with supported answer times.
- [ ] Compare raw chunks, raw plus glossary, and raw plus cached LLM summaries
  using the same questions and a fixed retrieval configuration.
- [ ] Preserve raw text and timestamps; summaries are metadata, never replacement
  evidence. Apply glossary fixes after ad extraction without changing ad codes.
- [ ] Keep sentence-aware chunks a few hundred tokens with overlap only within
  content spans; prevent any chunk from crossing an ad.
- [ ] Report retrieval support rates and cost, and retain the simplest useful
  variant in a decision note.

## F. Measure hybrid retrieval, reranking, and ledger routing

Labels: `type:eval`, `priority:p1`. Depends on D and E. Stage: query path.

- [ ] Compare sparse, dense, hybrid, and reranked results on fixed questions,
  including exact names/codes and unsupported questions.
- [ ] Maintain separate content/ad indexes or namespaces and prevent sponsor
  material from contaminating content answers.
- [ ] Exercise `getAdsForEpisode(id)` and `findEpisodesBySponsor(name)` with
  Zod-validated arguments; exclude house promos from sponsor results.
- [ ] Measure retrieval hit rate at a defined k, routing accuracy, answer citation
  support, latency, and query cost. Inspect failures before adding complexity.

## G. Add faithfulness judging and useful traces

Labels: `type:eval`, `module:12`, `priority:p1`. Depends on E and F.
Stage: answer evaluation/observability.

- [ ] Judge whether each answer claim is supported by its cited evidence using
  an explicit structured rubric, including abstention and citation failures.
- [ ] Compare judge outcomes with hand-reviewed examples, then spot-check new
  batches before trusting automated scores.
- [ ] Keep ad detection metrics based on hand labels, not judge opinions.
- [ ] Record configuration, aggregate scores, latency/cost, and path metadata;
  ensure shared traces do not expose private source text or secrets.

## H. Compare learned ad detectors only where the course calls for them

Labels: `type:eval`, `priority:p1`. Depends on D. Stage: ad candidate detection.

- [ ] Confirm the relevant syllabus requirements and Python allowance before
  expanding beyond the baseline. Defer methods that do not serve a module.
- [ ] Compare rules, embeddings plus logistic regression, a small fine-tuned
  transformer, and an LLM extractor only as justified by course scope/budget.
- [ ] Use the same labels and held-out episodes; report quality, boundary error,
  field accuracy, cost, and the limits of the small dataset.
- [ ] Evaluate cheap candidates plus an LLM for positives/uncertain windows;
  cache responses by window hash and model/prompt configuration.
- [ ] Retain the simplest adequate method; no speculative training service.

## I. Scale the working path to 10–20 episodes and complete the capstone

Labels: `type:feature`, `priority:p1`. Depends on the required evaluations above.
Stages: ingestion robustness, deployment, final deliverable.

- [ ] Ingest the agreed single-show episode set with resumability and budget
  controls; demonstrate that rerunning unchanged inputs avoids paid work.
- [ ] Handle malformed input, missing word timestamps, name errors, and likely
  hallucinated outro text while retaining source provenance.
- [ ] Verify local/container and chosen-host behavior from documented setup;
  demonstrate health checks, stateless serving, and private artifact handling.
- [ ] Summarize aggregate evals, limitations, module coverage, and decisions in
  the final write-up without publishing private labels/transcripts.
- [ ] Reconcile the five graded deliverables with the instructor's actual rubric.

## Deferred unless explicitly justified

Other shows, YouTube/SponsorBlock, writings/full-paper ingestion, graph retrieval,
cross-appearance comparisons, text-to-SQL, additional hosts/AWS adapters, and
platform-specific listening-app links. They do not block the skeleton.

## Decisions still needed

1. Exact contents of `private/` (the original message was cut off).
2. Repository owner/name, visibility, shared-course versus separate repository,
   license, and empty-repository bootstrap procedure.
3. Instructor approval for offline Whisper/Python, public-demo content, and the
   actual module/deliverable mapping.
4. The list above needs user confirmation before GitHub issue creation.

GitHub CLI is installed, but its local authentication check reported an invalid
saved login during this planning pass. Restore access before remote setup; never
paste tokens into chat or planning documents.
