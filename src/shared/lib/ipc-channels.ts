const channels = {
  APP_READY: 'APP_READY',
  APP_CLOSE: 'APP_CLOSE',
  APP_RESTART: 'APP_RESTART',

  CONFIG_GET_ALL: 'CONFIG_GET_ALL',
  CONFIG_GET: 'CONFIG_GET',
  CONFIG_SET: 'CONFIG_SET',

  PLAYBACK_PLAY: 'PLAYBACK_PLAY',
  PLAYBACK_PAUSE: 'PLAYBACK_PAUSE',
  PLAYBACK_STOP: 'PLAYBACK_STOP',
  PLAYBACK_PLAYPAUSE: 'PLAYBACK_PLAYPAUSE',
  PLAYBACK_PREVIOUS: 'PLAYBACK_PREVIOUS',
  PLAYBACK_NEXT: 'PLAYBACK_NEXT',
  PLAYBACK_TRACK_CHANGE: 'PLAYBACK_TRACK_CHANGE',

  SETTINGS_TOGGLE_SLEEP_BLOCKER: 'SETTINGS_TOGGLE_SLEEP_BLOCKER',

  THEME_GET_ID: 'THEME_GET_ID',
  THEME_SET_ID: 'THEME_SET_ID',
  THEME_APPLY: 'THEME_APPLY',
  THEME_GET: 'THEME_GET',

  DIALOG_MESSAGE_BOX: 'DIALOG_MESSAGE_BOX',
  DIALOG_OPEN: 'DIALOG_OPEN',

  MENU_GO_TO_LIBRARY: 'MENU_GO_TO_LIBRARY',
  MENU_GO_TO_PLAYLISTS: 'MENU_GO_TO_PLAYLISTS',
  MENU_JUMP_TO_PLAYING_TRACK: 'MENU_JUMP_TO_PLAYING_TRACK',

  COVER_GET: 'COVER_GET',

  LIBRARY_IMPORT_TRACKS: 'LIBRARY_IMPORT_TRACKS',
  LIBRARY_SCAN_TRACKS: 'LIBRARY_SCAN_TRACKS',

  PLAYLISTS_RESOLVE_M3U: 'PLAYLISTS_RESOLVE_M3U',
  PLAYLIST_EXPORT: 'PLAYLIST_EXPORT',
};

export default channels;
