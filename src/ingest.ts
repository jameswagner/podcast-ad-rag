import { createHash } from 'node:crypto';
import type { ObjectStorage, Transcriber } from './adapters/interfaces.js';
import { parseFeed } from './feed.js';
import { Episode, Transcript, type Podcast } from './schemas/index.js';

const UA = 'podcast-ad-rag (learning project)';

export interface IngestDeps {
  storage: ObjectStorage;
  transcriber: Transcriber;
  /** Resolve an object key to a filesystem path (needed to hand audio to Whisper). */
  pathFor: (key: string) => string;
  model: string;
  fetchImpl?: typeof fetch;
  log?: (msg: string) => void;
}

export const sha256 = (data: Buffer): string =>
  createHash('sha256').update(data).digest('hex');

export async function loadEpisodes(
  podcast: Podcast,
  d: IngestDeps,
  refresh = false,
): Promise<Episode[]> {
  const key = `cache/${podcast.id}-feed.xml`;
  let xml = refresh ? null : await d.storage.get(key);
  if (!xml) {
    d.log?.(`fetching feed ${podcast.feedUrl}`);
    const res = await (d.fetchImpl ?? fetch)(podcast.feedUrl, {
      headers: { 'user-agent': UA },
    });
    if (!res.ok) throw new Error(`feed fetch failed: ${res.status}`);
    xml = Buffer.from(await res.arrayBuffer());
    await d.storage.put(key, xml);
  }
  return parseFeed(xml.toString('utf8'), podcast);
}

export async function ingestEpisode(
  podcast: Podcast,
  guid: string,
  d: IngestDeps,
) {
  const log = d.log ?? (() => {});
  const episodes = await loadEpisodes(podcast, d);
  const episode = episodes.find((e) => e.guid === guid);
  if (!episode) throw new Error(`guid ${guid} not in feed`);
  const episodeId = `${podcast.id}:${guid}`;
  await d.storage.put(
    `episodes/${podcast.id}/${guid}.json`,
    JSON.stringify(episode, null, 2),
  );

  const audioKey = `audio/${podcast.id}/${guid}.mp3`;
  let audio = await d.storage.get(audioKey);
  if (audio) {
    log('audio cached');
  } else {
    log(`downloading audio`);
    const res = await (d.fetchImpl ?? fetch)(episode.enclosureUrl, {
      headers: { 'user-agent': UA },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`audio fetch failed: ${res.status}`);
    audio = Buffer.from(await res.arrayBuffer());
    await d.storage.put(audioKey, audio);
  }
  const audioHash = sha256(audio);

  const transcriptKey = `transcripts/${podcast.id}/${guid}.json`;
  const cached = await d.storage.get(transcriptKey);
  if (cached) {
    const t = Transcript.parse(JSON.parse(cached.toString('utf8')));
    if (t.audioHash === audioHash && t.model === d.model) {
      log('transcript cached');
      return { episode, transcript: t };
    }
  }
  log(`transcribing with ${d.model} (this can take a while)`);
  const transcript = await d.transcriber.transcribe(
    d.pathFor(audioKey),
    episodeId,
  );
  const stamped = Transcript.parse({ ...transcript, audioHash });
  await d.storage.put(transcriptKey, JSON.stringify(stamped));
  log(`wrote transcript: ${stamped.words.length} words`);
  return { episode, transcript: stamped };
}
