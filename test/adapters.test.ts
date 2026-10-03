import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  JsonLedgerStore,
  LocalObjectStorage,
  NoopTracer,
} from '../src/adapters/local.js';
import { ad } from './fixtures/synthetic.js';

describe('local adapters', () => {
  it('round-trips objects and blocks path escape', async () => {
    const s = new LocalObjectStorage(await mkdtemp(join(tmpdir(), 'st-')));
    expect(await s.exists('a/b.txt')).toBe(false);
    await s.put('a/b.txt', 'hi');
    expect((await s.get('a/b.txt'))?.toString()).toBe('hi');
    await expect(s.put('../evil', 'x')).rejects.toThrow();
  });
  it('ledger stores and finds ads, excluding house promos', async () => {
    const s = new LocalObjectStorage(await mkdtemp(join(tmpdir(), 'st-')));
    const ledger = new JsonLedgerStore(s);
    await ledger.putAds('g1', [ad]);
    await ledger.putAds('g2', [
      { ...ad, episodeGuid: 'g2', type: 'house-promo' },
    ]);
    expect(await ledger.getAdsForEpisode('g1')).toHaveLength(1);
    expect(await ledger.findEpisodesBySponsor('exampleco')).toEqual(['g1']);
  });
  it('noop tracer passes results through', async () => {
    expect(await new NoopTracer().span('x', async () => 42)).toBe(42);
  });
});
