import type { LoaderFunctionArgs } from 'react-router';

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
 * Loader Types, to manually type useLoaderData()
 */
export type LoaderData<T> = T extends (
  args: LoaderFunctionArgs,
) => Promise<infer U>
  ? Exclude<U, Response>
  : never;

/**
 * Fields allowed to be mutated when editing a track
 */
export type TrackMutation = Pick<
  Track,
  | 'title'
  | 'artists'
  | 'album'
  | 'genres'
  | 'year'
  | 'track_no'
  | 'track_of'
  | 'disk_no'
  | 'disk_of'
>;
