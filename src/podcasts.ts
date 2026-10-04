import type { Podcast } from './schemas/index.js';

export const podcasts: Record<string, Podcast> = {
  yanss: {
    id: 'yanss',
    title: 'You Are Not So Smart',
    feedUrl: 'https://feeds.simplecast.com/N5eKDxJI',
  },
};
