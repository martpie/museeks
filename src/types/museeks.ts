import type { Track } from '../generated/typings';

/**
 * Player related stuff
 */
export enum PlayerStatus {
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop',
}

/**
 * Various
 */
export interface Toast {
  _id: string;
  content: string;
  type: ToastType;
}

export type ToastType = 'success' | 'danger' | 'warning';

/**
 * Themes
 */
export interface Theme {
  _id: string;
  name: string;
  themeSource: 'light' | 'dark';
  variables: Record<string, string>;
}

/**
 * APIs Helpers
 */
export type API<
  // biome-ignore lint/suspicious/noExplicitAny: loose type enforcement by design
  T extends { api: Record<string, (...args: any[]) => Promise<any> | any> },
> = T;

/**
 * Misc Helpers
 */
type StringableKey<T> = T extends readonly unknown[]
  ? number extends T['length']
    ? number
    : `${number}`
  : string | number;

export type Path<T> = T extends object
  ? {
      [P in keyof T & StringableKey<T>]: `${P}` | `${P}.${Path<T[P]>}`;
    }[keyof T & StringableKey<T>]
  : never;

/**
 * Fields allowed to be mutated when editing a track
 */
export type TrackMutation = Pick<
  Track,
  | 'title'
  | 'artists'
  | 'album'
  | 'album_artist'
  | 'genres'
  | 'year'
  | 'track_no'
  | 'track_of'
  | 'disk_no'
  | 'disk_of'
>;

/**
 * The origin of a player queue. Used to navigate to some pages faster + be able
 * to jump to playing track.
 */
export type QueueOrigin =
  | { type: 'library' }
  | { type: 'playlist'; playlistID: string }
  | { type: 'artist'; artistID: string };

/**
 * A common interface used by TracksList to be able to control custom children
 * layouts
 */
export type TracksListVirtualizer = {
  scrollElement: HTMLDivElement | null;
  scrollToIndex: (index: number, options?: ScrollIntoViewOptions) => void;
};

/**
 * Information about a list of tracks (count + duration)
 */
export type TrackListStatusInfo = {
  count: number;
  duration: number;
};
