import { parseArgs } from 'node:util';
import { LocalObjectStorage } from '../adapters/local.js';
import { ingestEpisode } from '../ingest.js';
import { podcasts } from '../podcasts.js';
import { WhisperCliTranscriber } from '../whisper.js';

const { values } = parseArgs({
  options: {
    podcast: { type: 'string', default: 'yanss' },
    guid: { type: 'string' },
    model: { type: 'string', default: 'small.en' },
  },
});

const podcast = podcasts[values.podcast!];
if (!podcast) throw new Error(`unknown podcast ${values.podcast}`);
if (!values.guid) throw new Error('--guid is required');

const storage = new LocalObjectStorage(process.env.PRIVATE_DIR ?? './private');
const { transcript } = await ingestEpisode(podcast, values.guid, {
  storage,
  pathFor: (k) => storage.path(k),
  model: values.model!,
  transcriber: new WhisperCliTranscriber(values.model),
  log: (m) => console.log(`[ingest] ${m}`),
});
console.log(
  `[ingest] done: ${transcript.episodeId}, ${transcript.words.length} words`,
);
