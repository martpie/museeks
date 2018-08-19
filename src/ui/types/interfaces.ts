/**
 * Player related stuff
 */
export enum PlayerStatus {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  STOP = 'STOP'
}

export enum Repeat {
  ALL = 'ALL',
  ONE = 'ONE',
  NONE = 'NONE'
}

export enum SortBy {
  ARTIST = 'ARTIST',
  ALBUM = 'ALBUM',
  TITLE = 'TITLE',
  DURATION = 'DURATION',
  GENRE = 'GENRE'
}

export enum SortOrder {
  ASC = 'ASC',
  DSC = 'DSC'
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
  copy: Function; // TODO better types?
  remove: Function;
  save: Function;
  serialize: Function;
  update: Function;
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
  useNativeFrame: boolean;
  minimizeToTray: boolean;
  displayNotifications: boolean;
  devMode: boolean;
  bounds: {
    width: number,
    height: number,
    x: number,
    y: number
  };
}
