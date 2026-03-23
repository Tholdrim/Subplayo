const createPlaylistUpdater = (settings, youTubeClient, logger) => {
  function run() {
    const playlistIds = Object.keys(settings.playlists);
    const fetchedPlaylists = _fetchPlaylists(playlistIds);

    const channelIds = [...new Set(Object.values(settings.playlists).flat())];
    const fetchedChannels = _fetchChannels(channelIds);

    const scriptProperties = PropertiesService.getScriptProperties();
    const storedTimestamps = scriptProperties.getProperties();
    const updatedTimestamps = {};

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

  function _fetchPlaylists(playlistIds) {
    logger.logPlaylistsFetching();

    const { result: playlists, error } = _safeExecute(() => youTubeClient.getPlaylistsByIds(playlistIds));

    if (error) {
      logger.logPlaylistsFetchFailure(error.details.message);

      throw error;
    }

    return playlists;
  }

  function _fetchChannels(channelIds) {
    logger.logChannelsFetching();

    const { result: channels, error } = _safeExecute(() => youTubeClient.getChannelsByIds(channelIds));

    if (error) {
      logger.logChannelsFetchFailure(error.details.message);

      throw error;
    }

    return channels;
  }

  function _processPlaylist(playlistId, playlistTitle, fetchedChannels, storedTimestamps, updatedTimestamps) {
    logger.logPlaylistProcessing(playlistTitle);

    for (const channelId of settings.playlists[playlistId]) {
      const channel = fetchedChannels[channelId];

      if (!channel || !channel.uploadsPlaylistId) {
        logger.logChannelSkipping(channel?.title ?? channelId, channel ? ChannelSkipReason.LIST_UNAVAILABLE : ChannelSkipReason.NOT_FOUND);

        continue;
      }

      _checkChannel(playlistId, channelId, channel, storedTimestamps, updatedTimestamps);
    }
  }

  function _checkChannel(playlistId, channelId, channel, storedTimestamps, updatedTimestamps) {
    const { result: latestVideos, error } = _safeExecute(() => youTubeClient.getLatestVideosByPlaylistId(channel.uploadsPlaylistId));

    if (error || latestVideos.length === 0) {
      logger.logChannelSkipping(channel.title, ChannelSkipReason.NO_VIDEOS);

      return;
    }

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

  function _resolveTimestamp(channelId, latestVideos, storedTimestamps) {
    const parsed = Date.parse(storedTimestamps[channelId]);

    if (!isNaN(parsed)) {
      return parsed;
    }

    logger.logNewChannelDiscovery();

    return latestVideos.length > 1 ? Date.parse(latestVideos[1].publishedAt) : Number.NEGATIVE_INFINITY;
  }

  function _filterNewVideos(latestVideos, timestamp) {
    const index = latestVideos.findIndex(video => Date.parse(video.publishedAt) <= timestamp);

    return index === -1 ? latestVideos : latestVideos.slice(0, index);
  }

  function _addVideo(playlistId, video) {
    const { error } = _safeExecute(() => youTubeClient.addVideoToPlaylist(video.id, playlistId));

    if (error) {
      logger.logVideoAdditionFailure(video.title, error.details.message);

      return;
    }

    logger.logVideoAddition(video.title);
  }

  function _safeExecute(operation) {
    try {
      return { result: operation(), error: null };
    } catch(exception) {
      return { result: null, error: exception };
    }
  }

  return {
    run
  };
};
