import type { AdSegment, Transcript } from '../schemas/index.js';

export interface ObjectStorage {
  get(key: string): Promise<Buffer | null>;
  put(key: string, data: Buffer | string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export interface Transcriber {
  /** Hash of the audio is stamped by the caller, which owns the file. */
  transcribe(
    audioPath: string,
    episodeId: string,
  ): Promise<Omit<Transcript, 'audioHash'>>;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: Record<string, string | number>;
}

export interface VectorStore {
  upsert(namespace: string, records: VectorRecord[]): Promise<void>;
  query(
    namespace: string,
    vector: number[],
    topK: number,
  ): Promise<(VectorRecord & { score: number })[]>;
}

export interface LLM {
  embed(texts: string[]): Promise<number[][]>;
  complete(prompt: string): Promise<string>;
}

export interface LedgerStore {
  putAds(episodeId: string, ads: AdSegment[]): Promise<void>;
  getAdsForEpisode(episodeId: string): Promise<AdSegment[]>;
  findEpisodesBySponsor(sponsor: string): Promise<string[]>;
}

export interface Tracer {
  span<T>(name: string, fn: () => Promise<T>): Promise<T>;
}
