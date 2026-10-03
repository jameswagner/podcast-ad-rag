import { describe, expect, it } from 'vitest';
import {
  AdSegment,
  Chunk,
  Episode,
  Podcast,
  RouterOutput,
  Transcript,
} from '../src/schemas/index.js';
import { ad, episode } from './fixtures/synthetic.js';

describe('schemas', () => {
  it('accepts valid episode and ad', () => {
    expect(Episode.parse(episode).guid).toBe('guid-1');
    expect(AdSegment.parse(ad).code).toBe('TEST50');
  });
  it('rejects ad with end before start', () => {
    expect(() => AdSegment.parse({ ...ad, end: 5 })).toThrow();
  });
  it('rejects word with end before start', () => {
    const t = {
      episodeId: 't:g',
      audioHash: 'h',
      model: 'm',
      words: [{ word: 'a', start: 2, end: 1 }],
    };
    expect(() => Transcript.parse(t)).toThrow();
  });
  it('rejects empty chunk text', () => {
    const c = {
      id: '1',
      episodeId: 't:g',
      start: 0,
      end: 1,
      text: '',
      spanType: 'content',
    };
    expect(() => Chunk.parse(c)).toThrow();
  });
  it('validates router output', () => {
    expect(
      RouterOutput.parse({ route: 'retrieval', query: 'what is x?' }).route,
    ).toBe('retrieval');
    expect(() =>
      RouterOutput.parse({ route: 'ledger', tool: 'dropTable', args: {} }),
    ).toThrow();
  });
});

describe('ids', () => {
  it('rejects an episodeId without a podcast prefix', () => {
    expect(() => AdSegment.parse({ ...ad, episodeId: 'guid-1' })).toThrow();
  });
  it('accepts a podcast', () => {
    expect(
      Podcast.parse({
        id: 'yanss',
        title: 'T',
        feedUrl: 'https://example.com/f',
      }).id,
    ).toBe('yanss');
  });
});
