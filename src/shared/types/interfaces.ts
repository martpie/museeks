/**
 * Player related stuff
 */
export enum PlayerStatus {
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop'
}

export enum Repeat {
  ALL = 'all',
  ONE = 'one',
  NONE = 'none'
}

export enum SortBy {
  ARTIST = 'artist',
  ALBUM = 'album',
  TITLE = 'title',
  DURATION = 'duration',
  GENRE = 'genre'
}

export enum SortOrder {
  ASC = 'asc',
  DSC = 'dsc'
}

/**
 * Redux
 */
export interface Action { // TODO action specific types
  type: string;
  payload?: any;
}

/**
 * Untyped libs / helpers
 */
export type LinvoSchema<Schema> = {
  _id: string;
  find: Function;
  findOne: Function;
  insert: Function;
  copy: Function; // TODO better types?
  remove: Function;
  save: Function;
  serialize: Function;
  update: Function;
  ensureIndex: Function;
  // bluebird-injected
  findAsync: Function;
  findOneAsync: Function;
  insertAsync: Function;
  copyAsync: Function;
  removeAsync: Function;
  saveAsync: Function;
  serializeAsync: Function;
  updateAsync: Function;
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
    no: number,
    of: number
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
    no: number,
    of: number
  };
  year: number | null;
}

export interface Playlist {
  name: string;
  tracks: string[];
}

/**
 * Database schemes
 */
export type TrackModel = LinvoSchema<Track>;
export type PlaylistModel = LinvoSchema<Playlist>;

/**
 * Various
 */
export interface Toast {
  _id: number;
  content: string;
  type: ToastType;
}

export type ToastType = 'success' | 'danger' | 'warning';

/**
 * Config
 */

export interface ConfigBounds {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface Config {
  theme: 'light' | 'dark';
  audioVolume: number;
  audioPlaybackRate: number;
  audioMuted: boolean;
  audioShuffle: boolean;
  audioRepeat: Repeat;
  librarySort: {
    by: SortBy;
    order: SortOrder;
  };
  // musicFolders: string[],
  sleepBlocker: boolean;
  autoUpdateChecker: boolean;
  minimizeToTray: boolean;
  displayNotifications: boolean;
  bounds: ConfigBounds;
}

/**
 * Themes
 */

export interface Theme {
  name: string;
  variables: Record<string, string>;
}
