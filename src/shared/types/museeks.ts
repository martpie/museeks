/**
 * Player related stuff
 */
export enum PlayerStatus {
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop',
}

export enum Repeat {
  ALL = 'all',
  ONE = 'one',
  NONE = 'none',
}

export enum SortBy {
  ARTIST = 'artist',
  ALBUM = 'album',
  TITLE = 'title',
  DURATION = 'duration',
  GENRE = 'genre',
}

export enum SortOrder {
  ASC = 'asc',
  DSC = 'dsc',
}

/**
 * Untyped libs / helpers
 */
export type LinvoSchema<Schema> = {
  _id: string;
  find: any;
  findOne: any;
  insert: any;
  copy: any; // TODO better types?
  remove: any;
  save: any;
  serialize: any;
  update: any;
  ensureIndex: any;
  // bluebird-injected
  findAsync: any;
  findOneAsync: any;
  insertAsync: any;
  copyAsync: any;
  removeAsync: any;
  saveAsync: any;
  serializeAsync: any;
  updateAsync: any;
} & {
  [Property in keyof Schema]: Schema[Property];
};

/**
 * App models
 */
export interface Track {
  album: string;
  artist: string[];
  disk: {
    no: number;
    of: number;
  };
  duration: number;
  genre: string[];
  loweredMetas: {
    artist: string[];
    album: string;
    title: string;
    genre: string[];
  };
  path: string;
  playCount: number;
  title: string;
  track: {
    no: number;
    of: number;
  };
  year: number | null;
}

export interface Playlist {
  name: string;
  tracks: string[];
  importPath?: string; // associated m3u file
}

/**
 * Database schemes
 */
export type TrackModel = LinvoSchema<Track>;
export type PlaylistModel = LinvoSchema<Playlist>;

/**
 * Editable track fields (via right-click -> edit track)
 */
export type TrackEditableFields = Pick<
  TrackModel,
  'title' | 'artist' | 'album' | 'genre'
>;

/**
 * Various
 */
export interface Toast {
  id: string;
  content: string;
  type: ToastType;
}

export type ToastType = 'success' | 'danger' | 'warning';

export interface LibrarySort {
  by: SortBy;
  order: SortOrder;
}

/**
 * Config
 */

export interface ConfigBounds {
  width: number;
  height: number;
  x: number;
  y: number;
}

// TODO: how to automate this? Maybe losen types to "string"
type ThemeIds = 'dark' | 'light' | 'dark-legacy';

export interface Config {
  theme: ThemeIds | '__system';
  audioVolume: number;
  audioPlaybackRate: number;
  audioOutputDevice: string;
  audioMuted: boolean;
  audioShuffle: boolean;
  audioRepeat: Repeat;
  defaultView: string;
  librarySort: {
    by: SortBy;
    order: SortOrder;
  };
  // musicFolders: string[],
  sleepBlocker: boolean;
  autoUpdateChecker: boolean;
  displayNotifications: boolean;
  bounds: ConfigBounds;
}

/**
 * Themes
 */

export interface Theme {
  _id: ThemeIds;
  name: string;
  themeSource: Electron.NativeTheme['themeSource'];
  variables: Record<string, string>;
}
