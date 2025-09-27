const youTubeClient = (() => {
  const MAX_BATCH = 50;

  function addVideoToPlaylist(videoId, playlistId) {
    const requestBody = {
      snippet: {
        playlistId: playlistId,
        resourceId: {
          kind: "youtube#video",
          videoId: videoId
        }
      }
    };

    YouTube.PlaylistItems.insert(requestBody, "snippet");
  }

  function getChannelsByIds(channelIds) {
    return _fetchBatchedData(channelIds, YouTube.Channels.list, "contentDetails,snippet", item => ({
        id: item.id,
        value: {
          title: item.snippet.title,
          uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads
        }
      })
    );
  }

  function getLatestVideosByPlaylistId(playlistId) {
    const response = YouTube.PlaylistItems.list("snippet", {
      playlistId: playlistId,
      maxResults: MAX_BATCH
    });

    return response.items.map(item => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title
    }));
  }

  function getPlaylistsByIds(playlistIds) {
    return _fetchBatchedData(playlistIds, YouTube.Playlists.list, "snippet", item => ({
        id: item.id,
        value: item.snippet.title
      })
    );
  }

  function listUserPlaylists() {
    const items = _fetchPaginatedData(YouTube.Playlists.list, "snippet", { mine: true });

    return items.map(item => ({
      id: item.id,
      title: item.snippet.title
    }));
  }

  function listUserSubscriptions() {
    const items = _fetchPaginatedData(YouTube.Subscriptions.list, "snippet", { mine: true });

    return items.map(item => ({
      channelId: item.snippet.resourceId.channelId,
      channelTitle: item.snippet.title
    }));
  }

  function _fetchBatchedData(ids, apiOperation, apiPart, transformOperation) {
    const result = {};

    for (let i = 0; i < ids.length; i += MAX_BATCH) {
      const response = apiOperation(apiPart, {
        id: ids.slice(i, i + MAX_BATCH).join(","),
        maxResults: MAX_BATCH
      });

      response.items.forEach(item => {
        const { id, value } = transformOperation(item);
        result[id] = value;
      });
    }

    return result;
  }

  function _fetchPaginatedData(apiOperation, apiPart, apiParameters) {
    let result = [];
    let nextPageToken = null;

    do {
      const response = apiOperation(apiPart, {
        ...apiParameters,
        maxResults: MAX_BATCH,
        pageToken: nextPageToken
      });

      result = result.concat(response.items);
      nextPageToken = response.nextPageToken;
    } while (nextPageToken);

    return result;
  }

  return {
    addVideoToPlaylist,
    getChannelsByIds,
    getLatestVideosByPlaylistId,
    getPlaylistsByIds,
    listUserPlaylists,
    listUserSubscriptions
  };
})();
