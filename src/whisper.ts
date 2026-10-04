import { execFile } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';
import { promisify } from 'node:util';
import type { Transcriber } from './adapters/interfaces.js';
import type { Transcript, Word } from './schemas/index.js';

const run = promisify(execFile);

interface WhisperJson {
  segments: { words?: { word: string; start: number; end: number }[] }[];
}

export function parseWhisperJson(json: WhisperJson): Word[] {
  return json.segments.flatMap((s) =>
    (s.words ?? []).map((w) => ({
      word: w.word.trim(),
      start: w.start,
      end: Math.max(w.end, w.start),
    })),
  );
}

/** Runs the local openai-whisper CLI. Needs `whisper` and ffmpeg on PATH. */
export class WhisperCliTranscriber implements Transcriber {
  constructor(private model = 'small.en') {}

  async transcribe(
    audioPath: string,
    episodeId: string,
  ): Promise<Omit<Transcript, 'audioHash'>> {
    const outDir = await mkdtemp(join(tmpdir(), 'whisper-'));
    await run(
      'whisper',
      [
        audioPath,
        '--model',
        this.model,
        '--language',
        'en',
        '--output_format',
        'json',
        '--word_timestamps',
        'True',
        '--fp16',
        'False',
        '--output_dir',
        outDir,
      ],
      { maxBuffer: 64 * 1024 * 1024 },
    );
    const jsonPath = join(
      outDir,
      basename(audioPath, extname(audioPath)) + '.json',
    );
    const json = JSON.parse(await readFile(jsonPath, 'utf8')) as WhisperJson;
    return { episodeId, model: this.model, words: parseWhisperJson(json) };
  }
}
