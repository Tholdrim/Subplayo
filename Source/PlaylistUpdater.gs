const playlistUpdater = (() => {
  function run() {
    const playlistIds = Object.keys(settings.playlists);
    const fetchedPlaylists = _fetchPlaylists(playlistIds);

    const channelIds = Object.values(settings.playlists).flat();
    const fetchedChannels = _fetchChannels(channelIds);

    for (const playlistId of playlistIds) {
      const playlistTitle = fetchedPlaylists[playlistId];

      if (!playlistTitle) {
        logger.logPlaylistSkipping(playlistId);

        continue;
      }

      _processPlaylist(playlistId, playlistTitle, fetchedChannels);
    }
  }

  function _addVideo(playlistId, video) {
    const { error } = _safeExecute(() => youTubeClient.addVideoToPlaylist(video.id, playlistId));

    if (error) {
      logger.logVideoAdditionFailure(video.title, error.details.message);

      return;
    }

    logger.logVideoAddition(video.title);
  }

  function _checkChannel(playlistId, channelId, channel) {
    const { result: latestVideos, error } = _safeExecute(() => youTubeClient.getLatestVideosByPlaylistId(channel.uploadsPlaylistId));

    if (error || latestVideos.length == 0) {
        logger.logChannelSkipping(channel.title, ChannelSkipReason.NO_VIDEOS);

        return;
    }

    logger.logChannelChecking(channel.title);

    const scriptProperties = PropertiesService.getScriptProperties();
    let lastAddedVideoId = scriptProperties.getProperty(channelId);

    if (!lastAddedVideoId) {
      logger.logNewChannelDiscovery();

      if (latestVideos.length > 1) {
        lastAddedVideoId = latestVideos[1].id;
      }
    }

    const index = latestVideos.findIndex(video => video.id === lastAddedVideoId);
    const newVideos = index === -1 ? latestVideos : latestVideos.slice(0, index);

    logger.logNewVideosFinding(newVideos.length);

    for (const video of newVideos.slice().reverse()) {
      _addVideo(playlistId, video);
    }

    if (newVideos.length > 0) {
      scriptProperties.setProperty(channelId, newVideos[0].id);
    }
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

  function _fetchPlaylists(playlistIds) {
    logger.logPlaylistsFetching();

    const { result: playlists, error } = _safeExecute(() => youTubeClient.getPlaylistsByIds(playlistIds));

    if (error) {
      logger.logPlaylistsFetchFailure(error.details.message);

      throw error;
    }

    return playlists;
  }

  function _processPlaylist(playlistId, playlistTitle, fetchedChannels) {
    logger.logPlaylistProcessing(playlistTitle);

    for (const channelId of settings.playlists[playlistId]) {
      const channel = fetchedChannels[channelId];

      if (!channel || !channel.uploadsPlaylistId) {
        logger.logChannelSkipping(channel?.title ?? channelId, channel ? ChannelSkipReason.LIST_UNAVAILABLE : ChannelSkipReason.NOT_FOUND);

        continue;
      }

      _checkChannel(playlistId, channelId, channel);
    }
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
  }
})();
