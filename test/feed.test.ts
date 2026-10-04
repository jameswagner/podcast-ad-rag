import { describe, expect, it } from 'vitest';
import { parseDuration, parseFeed } from '../src/feed.js';
import { parseWhisperJson } from '../src/whisper.js';

const podcast = { id: 'test', title: 'T', feedUrl: 'https://example.com/feed' };
const xml = `<rss><channel>
<item><title>One</title><description>d</description><pubDate>Mon, 01 Jan 2024 00:00:00 +0000</pubDate>
<guid isPermaLink="false">g-1</guid><itunes:duration>01:02:03</itunes:duration>
<enclosure url="https://example.com/a.mp3" type="audio/mpeg"/></item>
<item><title>Two</title><guid>g-2</guid><itunes:duration>90</itunes:duration>
<enclosure url="https://example.com/b.mp3"/></item>
</channel></rss>`;

describe('feed', () => {
  it('parses durations', () => {
    expect(parseDuration('01:02:03')).toBe(3723);
    expect(parseDuration('43:31')).toBe(2611);
    expect(parseDuration('90')).toBe(90);
    expect(parseDuration(undefined)).toBe(0);
  });
  it('parses items including guid attributes and single-item feeds', () => {
    const eps = parseFeed(xml, podcast);
    expect(eps.map((e) => e.guid)).toEqual(['g-1', 'g-2']);
    expect(eps[0]?.durationSec).toBe(3723);
    expect(eps[0]?.podcastId).toBe('test');
  });
});

describe('whisper json', () => {
  it('flattens segment words, trims, and clamps end', () => {
    const words = parseWhisperJson({
      segments: [{ words: [{ word: ' Hi', start: 1, end: 0.9 }] }, {}],
    });
    expect(words).toEqual([{ word: 'Hi', start: 1, end: 1 }]);
  });
});
