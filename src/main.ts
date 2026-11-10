import type { Settings } from './settings';

import { logger } from './logger';
import { createPlaylistUpdater } from './playlist-updater';
import { createYouTubeClient } from './youtube-client';

declare const settings: Settings;

export function addNewVideosToPlaylists(): void {
  const playlistUpdater = createPlaylistUpdater(settings, _getYouTubeClient(), logger);

  playlistUpdater.run();
}

export function listMyPlaylists(): void {
  const playlists = _getYouTubeClient().listUserPlaylists();

  for (const playlist of playlists) {
    logger.logPlaylistListItem(playlist.id, playlist.title);
  }
}

export function listMySubscriptions(): void {
  const subscriptions = _getYouTubeClient().listUserSubscriptions();

  for (const subscription of subscriptions) {
    logger.logChannelListItem(subscription.id, subscription.title);
  }
}

function _getYouTubeClient() {
  if (typeof YouTube === 'undefined') {
    throw new Error('Enable the YouTube Data API v3 service in Apps Script.');
  }

  return createYouTubeClient(YouTube);
}
