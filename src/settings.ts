export interface Settings {
  playlists: Record<string, string[]>;
}

const settings: Settings = {
  // biome-ignore format: preserve custom layout and comments for playlist and channel IDs
  playlists: {
    PLAYLIST_1_ID: [
      'CHANNEL_1_1_ID',
      'CHANNEL_1_2_ID'
    ],
    PLAYLIST_2_ID: [
      'CHANNEL_2_1_ID'
    ],
    PLAYLIST_3_ID: [
      'CHANNEL_3_1_ID',
      'CHANNEL_3_2_ID',
      'CHANNEL_3_3_ID'
    ]
  }
};

export default settings;
