# podcast-ad-rag

Parsity AI Engineering capstone. RAG over You Are Not So Smart episodes with attribution-first answers (episode, timestamp, speaker context) and an ad/sponsor ledger extracted from the audio.

## Status
Setup. No runnable code yet.

## Scope
One show, 10-20 episodes. Walking skeleton on episode 335 first, then deepen one stage at a time.

## Pipeline
RSS -> audio -> Whisper (word timestamps) -> ad extraction -> content spans -> chunking -> embeddings + sparse index -> router -> hybrid retrieve + rerank -> cited answer

## Private data policy
Audio, full transcripts, and per-episode labels stay in the git-ignored `private/` folder. Public output is limited to short excerpts with links to the creator's audio, and aggregate findings.

## Setup
TODO: prerequisites and pipeline command (added with the walking-skeleton issue). Copy `.env.example` to `.env`.

## License
Apache-2.0. See [LICENSE](LICENSE).
