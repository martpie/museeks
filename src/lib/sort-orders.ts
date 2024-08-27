import type { SortBy, Track } from '../generated/typings';
import type { Path } from '../types/museeks';

import { stripAccents } from './utils-library';

// For perforances reasons, otherwise _.orderBy will perform weird checks
// that are far more resource/time impactful
const ARTIST = (t: Track): string =>
  stripAccents(t.artists.toString().toLowerCase());
const GENRE = (t: Track): string =>
  stripAccents(t.genres.toString().toLowerCase());
const ALBUM = (t: Track): string => stripAccents(t.album.toLowerCase());
const TITLE = (t: Track): string => stripAccents(t.title.toLowerCase());

type TrackKeys = Path<Track>;
type IterateeFunction = (track: Track) => string;

export type SortConfig = Array<TrackKeys | IterateeFunction>;

// Declarations
const sortOrders: Record<SortBy, SortConfig> = {
  Artist: [ARTIST, 'year', ALBUM, 'disk.no', 'track.no'],
  Title: [TITLE, ARTIST, 'year', ALBUM, 'disk.no', 'track.no'],
  Duration: ['duration', ARTIST, 'year', ALBUM, 'disk.no', 'track.no'],
  Album: [ALBUM, ARTIST, 'year', 'disk.no', 'track.no'],
  Genre: [GENRE, ARTIST, 'year', ALBUM, 'disk.no', 'track.no'],
};

export default sortOrders;
