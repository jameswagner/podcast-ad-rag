import { z } from 'zod';

export const Episode = z.object({
  guid: z.string().min(1),
  title: z.string(),
  description: z.string().default(''),
  pubDate: z.string(),
  durationSec: z.number().nonnegative(),
  enclosureUrl: z.string().url(),
});
export type Episode = z.infer<typeof Episode>;

export const Word = z
  .object({
    word: z.string(),
    start: z.number().nonnegative(),
    end: z.number().nonnegative(),
  })
  .refine((w) => w.end >= w.start, 'word end before start');
export type Word = z.infer<typeof Word>;

export const Transcript = z.object({
  episodeGuid: z.string().min(1),
  audioHash: z.string().min(1),
  model: z.string(),
  words: z.array(Word),
});
export type Transcript = z.infer<typeof Transcript>;

export const AdType = z.enum(['sponsor', 'house-promo', 'none']);
export type AdType = z.infer<typeof AdType>;

export const AdSegment = z
  .object({
    episodeGuid: z.string().min(1),
    start: z.number().nonnegative(),
    end: z.number().nonnegative(),
    type: AdType,
    sponsor: z.string().optional(),
    offer: z.string().optional(),
    code: z.string().optional(),
    url: z.string().optional(),
    evidence: z.string(),
  })
  .refine((a) => a.end > a.start, 'ad end must be after start');
export type AdSegment = z.infer<typeof AdSegment>;

export const Chunk = z
  .object({
    id: z.string().min(1),
    episodeGuid: z.string().min(1),
    start: z.number().nonnegative(),
    end: z.number().nonnegative(),
    text: z.string().min(1),
    spanType: z.enum(['content', 'ad']),
  })
  .refine((c) => c.end > c.start, 'chunk end must be after start');
export type Chunk = z.infer<typeof Chunk>;

export const RouterOutput = z.union([
  z.object({
    route: z.literal('ledger'),
    tool: z.literal('getAdsForEpisode'),
    args: z.object({ episodeGuid: z.string().min(1) }),
  }),
  z.object({
    route: z.literal('ledger'),
    tool: z.literal('findEpisodesBySponsor'),
    args: z.object({ sponsor: z.string().min(1) }),
  }),
  z.object({ route: z.literal('retrieval'), query: z.string().min(1) }),
]);
export type RouterOutput = z.infer<typeof RouterOutput>;
