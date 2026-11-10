import type { Logger } from './logger';
import type { Settings } from './settings';
import type { Channel, Video, YouTubeClient } from './youtube-client';

import { ChannelSkipReason, PlaylistSkipReason } from './logger';

type Timestamps = Record<string, string>;
type Channels = Partial<Record<string, Channel>>;
type OperationResult<T> = { success: true; result: T } | { success: false; error: unknown };

export function createPlaylistUpdater(settings: Settings, youTubeClient: YouTubeClient, logger: Logger) {
  function _fetchPlaylists(playlistIds: string[]): Partial<Record<string, string>> {
    logger.logPlaylistsFetching();

    const operationResult = _safeExecute(() => youTubeClient.getPlaylistsByIds(playlistIds));

    if (!operationResult.success) {
      logger.logPlaylistsFetchFailure(_getErrorMessage(operationResult.error));

      throw operationResult.error;
    }

    return operationResult.result;
  }

  function _fetchChannels(channelIds: string[]): Channels {
    logger.logChannelsFetching();

    const operationResult = _safeExecute(() => youTubeClient.getChannelsByIds(channelIds));

    if (!operationResult.success) {
      logger.logChannelsFetchFailure(_getErrorMessage(operationResult.error));

      throw operationResult.error;
    }

    return operationResult.result;
  }

  function _processPlaylist(
    playlistId: string,
    playlistTitle: string,
    fetchedChannels: Channels,
    storedTimestamps: Timestamps,
    updatedTimestamps: Timestamps
  ): void {
    logger.logPlaylistProcessing(playlistTitle);

    for (const channelId of settings.playlists[playlistId]) {
      const channel = fetchedChannels[channelId];

      if (!channel?.uploadsPlaylistId) {
        logger.logChannelSkipping(channel?.title ?? channelId, channel ? ChannelSkipReason.LIST_UNAVAILABLE : ChannelSkipReason.NOT_FOUND);

        continue;
      }

      _checkChannel(playlistId, channelId, channel, channel.uploadsPlaylistId, storedTimestamps, updatedTimestamps);
    }
  }

  function _checkChannel(
    playlistId: string,
    channelId: string,
    channel: Channel,
    uploadsPlaylistId: string,
    storedTimestamps: Timestamps,
    updatedTimestamps: Timestamps
  ): void {
    const operationResult = _safeExecute(() => youTubeClient.getLatestVideosByPlaylistId(uploadsPlaylistId));

    if (!operationResult.success || operationResult.result.length === 0) {
      logger.logChannelSkipping(
        channel.title,
        operationResult.success ? ChannelSkipReason.NO_VIDEOS : _getErrorMessage(operationResult.error)
      );

      return;
    }

    const latestVideos = operationResult.result;

    logger.logChannelChecking(channel.title);

    const timestamp = _resolveTimestamp(channelId, latestVideos, storedTimestamps);
    const newVideos = _filterNewVideos(latestVideos, timestamp);

    logger.logNewVideosFinding(newVideos.length);

    for (const video of [...newVideos].reverse()) {
      _addVideo(playlistId, video);
    }

    if (newVideos.length > 0) {
      updatedTimestamps[channelId] = newVideos[0].publishedAt;
    }
  }

  function _resolveTimestamp(channelId: string, latestVideos: Video[], storedTimestamps: Timestamps): number {
    const storedTimestamp = storedTimestamps[channelId];
    const parsed = storedTimestamp === undefined ? Number.NaN : Date.parse(storedTimestamp);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }

    logger.logNewChannelDiscovery();

    return latestVideos.length > 1 ? Date.parse(latestVideos[1].publishedAt) : Number.NEGATIVE_INFINITY;
  }

  function _addVideo(playlistId: string, video: Video): void {
    const operationResult = _safeExecute(() => youTubeClient.addVideoToPlaylist(video.id, playlistId));

    if (!operationResult.success) {
      logger.logVideoAdditionFailure(video.title, _getErrorMessage(operationResult.error));

      return;
    }

    logger.logVideoAddition(video.title);
  }

  return {
    run(): void {
      const playlistIds = Object.keys(settings.playlists);
      const fetchedPlaylists = _fetchPlaylists(playlistIds);

      const channelIds = [...new Set(Object.values(settings.playlists).flat())];
      const fetchedChannels = _fetchChannels(channelIds);

      const scriptProperties = PropertiesService.getScriptProperties();
      const storedTimestamps = scriptProperties.getProperties();
      const updatedTimestamps: Timestamps = {};

      for (const playlistId of playlistIds) {
        const playlistTitle = fetchedPlaylists[playlistId];

        if (!playlistTitle) {
          logger.logPlaylistSkipping(playlistId, PlaylistSkipReason.NOT_FOUND);

          continue;
        }

        _processPlaylist(playlistId, playlistTitle, fetchedChannels, storedTimestamps, updatedTimestamps);
      }

      if (Object.keys(updatedTimestamps).length > 0) {
        scriptProperties.setProperties(updatedTimestamps);
      }
    }
  };
}

function _filterNewVideos(latestVideos: Video[], timestamp: number): Video[] {
  const index = latestVideos.findIndex(video => Date.parse(video.publishedAt) <= timestamp);

  return index === -1 ? latestVideos : latestVideos.slice(0, index);
}

function _getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'details' in error) {
    const details = error.details;

    if (typeof details === 'object' && details !== null && 'message' in details && typeof details.message === 'string') {
      return details.message;
    }
  }

  return error instanceof Error ? error.message : String(error);
}

function _safeExecute<T>(operation: () => T): OperationResult<T> {
  try {
    return { success: true, result: operation() };
  } catch (error: unknown) {
    return { success: false, error };
  }
}
