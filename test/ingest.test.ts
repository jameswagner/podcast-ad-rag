import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { LocalObjectStorage } from '../src/adapters/local.js';
import { ingestEpisode } from '../src/ingest.js';

const podcast = { id: 'test', title: 'T', feedUrl: 'https://example.com/feed' };
const feed = `<rss><channel><item><title>One</title><guid>g-1</guid>
<itunes:duration>10</itunes:duration><enclosure url="https://example.com/a.mp3"/></item></channel></rss>`;

describe('ingestEpisode', () => {
  it('downloads and transcribes once, then uses caches', async () => {
    const storage = new LocalObjectStorage(
      await mkdtemp(join(tmpdir(), 'ing-')),
    );
    const fetchImpl = vi.fn(
      async (url: string | URL | Request) =>
        new Response(String(url).endsWith('feed') ? feed : 'audio-bytes'),
    ) as unknown as typeof fetch;
    const transcribe = vi.fn(async (_p: string, episodeId: string) => ({
      episodeId,
      model: 'm',
      words: [{ word: 'hi', start: 0, end: 1 }],
    }));
    const deps = {
      storage,
      fetchImpl,
      transcriber: { transcribe },
      pathFor: (k: string) => storage.path(k),
      model: 'm',
    };

    const first = await ingestEpisode(podcast, 'g-1', deps);
    expect(first.transcript.episodeId).toBe('test:g-1');
    expect(first.transcript.audioHash).toHaveLength(64);
    await ingestEpisode(podcast, 'g-1', deps);

    expect(transcribe).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2); // feed + audio, once each
  });
});
