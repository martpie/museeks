/**
 * Re-export of types generates by ts-rs
 */
export type { Config } from './Config';
export type { DefaultView } from './DefaultView';
export type { Doc } from './Doc';
export type { NumberOf } from './NumberOf';
export type { Playlist } from './Playlist';
export type { Repeat } from './Repeat';
export type { SortBy } from './SortBy';
export type { SortOrder } from './SortOrder';
export type { Track } from './Track';

/**
 * Custom-aggregated types
 */
import type { Doc } from './Doc';
import type { Track } from './Track';
import type { Playlist } from './Playlist';

export type TrackDoc = Doc<Track>;
export type PlaylistDoc = Doc<Playlist>;
