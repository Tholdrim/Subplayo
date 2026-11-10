export enum ChannelSkipReason {
  NOT_FOUND = 'Channel not found on server',
  LIST_UNAVAILABLE = 'Could not retrieve video list',
  NO_VIDEOS = 'Channel has no videos'
}

export enum PlaylistSkipReason {
  NOT_FOUND = 'Playlist not found on server'
}

const PLAYLIST_ID_DISPLAY_WIDTH = 34;

export const logger = {
  logPlaylistsFetching(): void {
    console.info('→ Fetching playlists from YouTube');
  },

  logPlaylistsFetchFailure(reason: string): void {
    console.error('  → Failed to fetch playlists');
    console.error(`    → Reason: ${reason}`);
  },

  logChannelsFetching(): void {
    console.info('→ Fetching channels from YouTube');
  },

  logChannelsFetchFailure(reason: string): void {
    console.error('  → Failed to fetch channels');
    console.error(`    → Reason: ${reason}`);
  },

  logPlaylistProcessing(playlistTitle: string): void {
    console.info(`→ Processing playlist: ${playlistTitle}`);
  },

  logPlaylistSkipping(playlistId: string, reason: PlaylistSkipReason | string): void {
    console.warn(`→ Skipping playlist: ${playlistId}`);
    console.warn(`  → Reason: ${reason}`);
  },

  logChannelChecking(channelTitle: string): void {
    console.info(`  → Checking channel: ${channelTitle}`);
  },

  logChannelSkipping(channelIdentifier: string, reason: ChannelSkipReason | string): void {
    console.warn(`  → Skipping channel: ${channelIdentifier}`);
    console.warn(`    → Reason: ${reason}`);
  },

  logNewChannelDiscovery(): void {
    console.info('    → New channel detected – only the most recent video will be added');
  },

  logNewVideosFinding(newVideoCount: number): void {
    console.info(newVideoCount > 0 ? `    → Found ${newVideoCount} new video(s)` : '    → No new videos found');
  },

  logVideoAddition(videoTitle: string): void {
    console.info(`      → Successfully added video: ${videoTitle}`);
  },

  logVideoAdditionFailure(videoTitle: string, reason: string): void {
    console.warn(`      → Failed to add video: ${videoTitle}`);
    console.warn(`        → Reason: ${reason}`);
  },

  logChannelListItem(channelId: string, channelTitle: string): void {
    console.info(`ID: ${channelId} | Title: ${channelTitle}`);
  },

  logPlaylistListItem(playlistId: string, playlistTitle: string): void {
    console.info(`ID: ${playlistId.padEnd(PLAYLIST_ID_DISPLAY_WIDTH)} | Title: ${playlistTitle}`);
  }
};

export type Logger = typeof logger;
