import { XMLParser } from 'fast-xml-parser';
import { Episode, type Podcast } from './schemas/index.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

/** itunes:duration is either plain seconds or [HH:]MM:SS. */
export function parseDuration(raw: string | number | undefined): number {
  if (raw === undefined || raw === '') return 0;
  const parts = String(raw).split(':').map(Number);
  if (parts.some(Number.isNaN)) return 0;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

function text(v: unknown): string {
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (v && typeof v === 'object' && '#text' in v)
    return String((v as { '#text': unknown })['#text']);
  return '';
}

export function parseFeed(xml: string, podcast: Podcast): Episode[] {
  const doc = parser.parse(xml) as { rss?: { channel?: { item?: unknown } } };
  const items = doc.rss?.channel?.item;
  if (!items) throw new Error('feed has no items');
  return (Array.isArray(items) ? items : [items]).map(
    (item: Record<string, unknown>) =>
      Episode.parse({
        podcastId: podcast.id,
        guid: text(item.guid),
        title: text(item.title),
        description: text(item.description),
        pubDate: text(item.pubDate),
        durationSec: parseDuration(text(item['itunes:duration'])),
        enclosureUrl: (item.enclosure as Record<string, string> | undefined)?.[
          '@_url'
        ],
      }),
  );
}
