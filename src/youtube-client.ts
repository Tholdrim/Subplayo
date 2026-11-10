export interface Channel {
  title: string;
  uploadsPlaylistId: string | undefined;
}

export interface Video {
  id: string;
  title: string;
  publishedAt: string;
}

export interface UserPlaylist {
  id: string;
  title: string;
}

export interface UserSubscription {
  id: string;
  title: string;
}

interface ListResponse<T> {
  items?: T[];
  nextPageToken?: string;
}

type ListOperation<T> = (part: string, parameters: object) => ListResponse<T>;

const MAX_BATCH = 50;

export function createYouTubeClient(service: GoogleAppsScript.YouTube) {
  return {
    addVideoToPlaylist(videoId: string, playlistId: string): void {
      const requestBody: GoogleAppsScript.YouTube.Schema.PlaylistItem = {
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId
          }
        }
      };

      service.PlaylistItems.insert(requestBody, 'snippet');
    },

    getChannelsByIds(channelIds: string[]): Partial<Record<string, Channel>> {
      return _fetchBatchedData(channelIds, service.Channels.list, 'contentDetails,snippet', item => ({
        id: _requireString(item.id, 'channel.id'),
        value: {
          title: _requireString(item.snippet?.title, 'channel.snippet.title'),
          uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads
        }
      }));
    },

    getLatestVideosByPlaylistId(playlistId: string): Video[] {
      const response = service.PlaylistItems.list('contentDetails,snippet', {
        playlistId,
        maxResults: MAX_BATCH
      });

      return (response.items ?? []).map(item => ({
        id: _requireString(item.snippet?.resourceId?.videoId, 'playlistItem.snippet.resourceId.videoId'),
        title: _requireString(item.snippet?.title, 'playlistItem.snippet.title'),
        publishedAt: _requireString(item.contentDetails?.videoPublishedAt, 'playlistItem.contentDetails.videoPublishedAt')
      }));
    },

    getPlaylistsByIds(playlistIds: string[]): Partial<Record<string, string>> {
      return _fetchBatchedData(playlistIds, service.Playlists.list, 'snippet', item => ({
        id: _requireString(item.id, 'playlist.id'),
        value: _requireString(item.snippet?.title, 'playlist.snippet.title')
      }));
    },

    listUserPlaylists(): UserPlaylist[] {
      const items = _fetchPaginatedData(service.Playlists.list, 'snippet', {
        mine: true
      });

      return items
        .filter(item => !_requireString(item.id, 'playlist.id').startsWith('FL'))
        .map(item => ({
          id: _requireString(item.id, 'playlist.id'),
          title: _requireString(item.snippet?.title, 'playlist.snippet.title')
        }));
    },

    listUserSubscriptions(): UserSubscription[] {
      const items = _fetchPaginatedData(service.Subscriptions.list, 'snippet', {
        mine: true
      });

      return items.map(item => ({
        id: _requireString(item.snippet?.resourceId?.channelId, 'subscription.snippet.resourceId.channelId'),
        title: _requireString(item.snippet?.title, 'subscription.snippet.title')
      }));
    }
  };
}

export type YouTubeClient = ReturnType<typeof createYouTubeClient>;

function _fetchBatchedData<T, V>(
  ids: string[],
  apiOperation: ListOperation<T>,
  apiPart: string,
  transformOperation: (item: T) => { id: string; value: V }
): Partial<Record<string, V>> {
  const result: Partial<Record<string, V>> = {};

  for (let i = 0; i < ids.length; i += MAX_BATCH) {
    const response = apiOperation(apiPart, {
      id: ids.slice(i, i + MAX_BATCH).join(','),
      maxResults: MAX_BATCH
    });

    (response.items ?? []).forEach(item => {
      const { id, value } = transformOperation(item);
      result[id] = value;
    });
  }

  return result;
}

function _fetchPaginatedData<T>(apiOperation: ListOperation<T>, apiPart: string, apiParameters: object): T[] {
  let result: T[] = [];
  let nextPageToken: string | undefined;

  do {
    const response = apiOperation(apiPart, {
      ...apiParameters,
      maxResults: MAX_BATCH,
      pageToken: nextPageToken
    });

    result = result.concat(response.items ?? []);
    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return result;
}

function _requireString(value: string | undefined, field: string): string {
  if (value === undefined) {
    throw new Error(`YouTube response is missing ${field}.`);
  }

  return value;
}
