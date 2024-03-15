import { SortOrder, SortBy, Track } from '../generated/typings';
import { Path } from '../types/museeks';

import { stripAccents } from './utils-id3';

// For perforances reasons, otherwise _.orderBy will perform weird check
// the is far more resource/time impactful
const getArtist = (t: Track): string =>
  stripAccents(t.artists.toString().toLowerCase());
const getGenre = (t: Track): string =>
  stripAccents(t.genres.toString().toLowerCase());
const getAlbum = (t: Track): string => stripAccents(t.album.toLowerCase());
const getTitle = (t: Track): string => stripAccents(t.title.toLowerCase());

type TrackKeys = Path<Track>;
type IterateeFunction = (track: Track) => string;
export type SortTuple = [
  Array<TrackKeys | IterateeFunction>,
  Array<'asc' | 'desc'>,
];

// Declarations
const sortOrders: Record<SortBy, Record<SortOrder, SortTuple>> = {
  Artist: {
    Asc: [
      // Default
      [getArtist, 'year', getAlbum, 'disk.no', 'track.no'],
      ['asc'],
    ],
    Dsc: [[getArtist, 'year', getAlbum, 'disk.no', 'track.no'], ['desc']],
  },
  Title: {
    Asc: [
      [getTitle, getArtist, 'year', getAlbum, 'disk.no', 'track.no'],
      ['asc'],
    ],
    Dsc: [
      [getTitle, getArtist, 'year', getAlbum, 'disk.no', 'track.no'],
      ['desc'],
    ],
  },
  Duration: {
    Asc: [
      ['duration', getArtist, 'year', getAlbum, 'disk.no', 'track.no'],
      ['asc'],
    ],
    Dsc: [
      ['duration', getArtist, 'year', getAlbum, 'disk.no', 'track.no'],
      ['desc'],
    ],
  },
  Album: {
    Asc: [[getAlbum, getArtist, 'year', 'disk.no', 'track.no'], ['asc']],
    Dsc: [[getAlbum, getArtist, 'year', 'disk.no', 'track.no'], ['desc']],
  },
  Genre: {
    Asc: [
      [getGenre, getArtist, 'year', getAlbum, 'disk.no', 'track.no'],
      ['asc'],
    ],
    Dsc: [
      [getGenre, getArtist, 'year', getAlbum, 'disk.no', 'track.no'],
      ['desc'],
    ],
  },
};

export default sortOrders;
