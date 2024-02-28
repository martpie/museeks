import { Track } from '../generated/typings';

/**
 * Player related stuff
 */
export enum PlayerStatus {
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop',
}

/**
 * Editable track fields (via right-click -> edit track)
 */
export type TrackEditableFields = Pick<
  Track,
  'title' | 'artists' | 'album' | 'genres'
>;

export type TrackSearchableFields = Pick<
  Track,
  'title' | 'artists' | 'album' | 'genres'
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
 * Helpers
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
