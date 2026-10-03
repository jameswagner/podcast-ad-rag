import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { AdSegment } from '../schemas/index.js';
import type { LedgerStore, ObjectStorage, Tracer } from './interfaces.js';

export class LocalObjectStorage implements ObjectStorage {
  private root: string;
  constructor(root: string) {
    this.root = resolve(root);
  }
  private path(key: string): string {
    const p = resolve(join(this.root, key));
    if (!p.startsWith(this.root + sep))
      throw new Error(`key escapes storage root: ${key}`);
    return p;
  }
  async get(key: string): Promise<Buffer | null> {
    try {
      return await readFile(this.path(key));
    } catch {
      return null;
    }
  }
  async put(key: string, data: Buffer | string): Promise<void> {
    const p = this.path(key);
    await mkdir(dirname(p), { recursive: true });
    await writeFile(p, data);
  }
  async exists(key: string): Promise<boolean> {
    try {
      await access(this.path(key));
      return true;
    } catch {
      return false;
    }
  }
}

export class NoopTracer implements Tracer {
  span<T>(_name: string, fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}

/** Ledger stored as one JSON object in ObjectStorage: { [episodeGuid]: AdSegment[] }. */
export class JsonLedgerStore implements LedgerStore {
  constructor(
    private storage: ObjectStorage,
    private key = 'ledger.json',
  ) {}
  private async load(): Promise<Record<string, AdSegment[]>> {
    const buf = await this.storage.get(this.key);
    if (!buf) return {};
    const raw = JSON.parse(buf.toString('utf8')) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(raw).map(([guid, ads]) => [
        guid,
        AdSegment.array().parse(ads),
      ]),
    );
  }
  async putAds(episodeGuid: string, ads: AdSegment[]): Promise<void> {
    const all = await this.load();
    all[episodeGuid] = AdSegment.array().parse(ads);
    await this.storage.put(this.key, JSON.stringify(all, null, 2));
  }
  async getAdsForEpisode(episodeGuid: string): Promise<AdSegment[]> {
    return (await this.load())[episodeGuid] ?? [];
  }
  async findEpisodesBySponsor(sponsor: string): Promise<string[]> {
    const needle = sponsor.toLowerCase();
    return Object.entries(await this.load())
      .filter(([, ads]) =>
        ads.some(
          (a) => a.type === 'sponsor' && a.sponsor?.toLowerCase() === needle,
        ),
      )
      .map(([guid]) => guid);
  }
}
