const ChannelSkipReason = Object.freeze({
  NOT_FOUND: "Channel not found on server",
  LIST_UNAVAILABLE: "Could not retrieve video list",
  NO_VIDEOS: "Channel has no videos"
});

const PlaylistSkipReason = Object.freeze({
  NOT_FOUND: "Playlist not found on server"
});

const logger = (() => {
  const PLAYLIST_ID_DISPLAY_WIDTH = 34;

  function logPlaylistsFetching() {
    console.info("→ Fetching playlists from YouTube");
  }

  function logPlaylistsFetchFailure(reason) {
    console.error("  → Failed to fetch playlists");
    console.error(`    → Reason: ${reason}`);
  }

  function logChannelsFetching() {
    console.info("→ Fetching channels from YouTube");
  }

  function logChannelsFetchFailure(reason) {
    console.error("  → Failed to fetch channels");
    console.error(`    → Reason: ${reason}`);
  }

  function logPlaylistProcessing(playlistTitle) {
    console.info(`→ Processing playlist: ${playlistTitle}`);
  }

  function logPlaylistSkipping(playlistId, reason) {
    console.warn(`→ Skipping playlist: ${playlistId}`);
    console.warn(`  → Reason: ${reason}`);
  }

  function logChannelChecking(channelTitle) {
    console.info(`  → Checking channel: ${channelTitle}`);
  }

  function logChannelSkipping(channelIdentifier, reason) {
    console.warn(`  → Skipping channel: ${channelIdentifier}`);
    console.warn(`    → Reason: ${reason}`);
  }

  function logNewChannelDiscovery() {
    console.info("    → New channel detected – only the most recent video will be added");
  }

  function logNewVideosFinding(newVideoCount) {
    console.info(newVideoCount > 0
      ? `    → Found ${newVideoCount} new video(s)`
      : `    → No new videos found`
    );
  }

  function logVideoAddition(videoTitle) {
    console.info(`      → Successfully added video: ${videoTitle}`);
  }

  function logVideoAdditionFailure(videoTitle, reason) {
    console.warn(`      → Failed to add video: ${videoTitle}`);
    console.warn(`        → Reason: ${reason}`);
  }

  function logChannelListItem(channelId, channelTitle) {
    console.info(`ID: ${channelId} | Title: ${channelTitle}`);
  }

  function logPlaylistListItem(playlistId, playlistTitle) {
    console.info(`ID: ${playlistId.padEnd(PLAYLIST_ID_DISPLAY_WIDTH)} | Title: ${playlistTitle}`);
  }

  return {
    logPlaylistsFetching,
    logPlaylistsFetchFailure,
    logChannelsFetching,
    logChannelsFetchFailure,
    logPlaylistProcessing,
    logPlaylistSkipping,
    logChannelChecking,
    logChannelSkipping,
    logNewChannelDiscovery,
    logNewVideosFinding,
    logVideoAddition,
    logVideoAdditionFailure,
    logChannelListItem,
    logPlaylistListItem
  };
})();
