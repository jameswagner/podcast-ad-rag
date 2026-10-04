// Synthetic data only. Not real episode text.
export const episode = {
  podcastId: 'test',
  guid: 'guid-1',
  title: 'Synthetic Episode',
  description: 'A made-up episode.',
  pubDate: '2024-01-01T00:00:00Z',
  durationSec: 600,
  enclosureUrl: 'https://example.com/audio.mp3',
};

export const ad = {
  episodeId: 'test:guid-1',
  start: 10,
  end: 40,
  type: 'sponsor' as const,
  sponsor: 'ExampleCo',
  code: 'TEST50',
  evidence: 'use the code TEST50',
};
