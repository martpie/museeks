import { SortOrder, SortBy, TrackDoc } from '../generated/typings';
import { Path } from '../types/museeks';

import { stripAccents } from './utils-id3';

// For perforances reasons, otherwise _.orderBy will perform weird check
// the is far more resource/time impactful
const getArtist = (t: TrackDoc): string =>
  stripAccents(t.doc.artists.toString().toLowerCase());
const getGenre = (t: TrackDoc): string =>
  stripAccents(t.doc.genres.toString().toLowerCase());
const getAlbum = (t: TrackDoc): string =>
  stripAccents(t.doc.album.toLowerCase());
const getTitle = (t: TrackDoc): string =>
  stripAccents(t.doc.title.toLowerCase());

type TrackKeys = Path<TrackDoc>;
type IterateeFunction = (track: TrackDoc) => string;
export type SortTuple = [
  Array<TrackKeys | IterateeFunction>,
  Array<'asc' | 'desc'>,
];

// Declarations
const sortOrders: Record<SortBy, Record<SortOrder, SortTuple>> = {
  Artist: {
    Asc: [
      // Default
      [getArtist, 'doc.year', getAlbum, 'doc.disk.no', 'doc.track.no'],
      ['asc'],
    ],
    Dsc: [
      [getArtist, 'doc.year', getAlbum, 'doc.disk.no', 'doc.track.no'],
      ['desc'],
    ],
  },
  Title: {
    Asc: [
      [
        getTitle,
        getArtist,
        'doc.year',
        getAlbum,
        'doc.disk.no',
        'doc.track.no',
      ],
      ['asc'],
    ],
    Dsc: [
      [
        getTitle,
        getArtist,
        'doc.year',
        getAlbum,
        'doc.disk.no',
        'doc.track.no',
      ],
      ['desc'],
    ],
  },
  Duration: {
    Asc: [
      [
        'doc.duration',
        getArtist,
        'doc.year',
        getAlbum,
        'doc.disk.no',
        'doc.track.no',
      ],
      ['asc'],
    ],
    Dsc: [
      [
        'doc.duration',
        getArtist,
        'doc.year',
        getAlbum,
        'doc.disk.no',
        'doc.track.no',
      ],
      ['desc'],
    ],
  },
  Album: {
    Asc: [
      [getAlbum, getArtist, 'doc.year', 'doc.disk.no', 'doc.track.no'],
      ['asc'],
    ],
    Dsc: [
      [getAlbum, getArtist, 'doc.year', 'doc.disk.no', 'doc.track.no'],
      ['desc'],
    ],
  },
  Genre: {
    Asc: [
      [
        getGenre,
        getArtist,
        'doc.year',
        getAlbum,
        'doc.disk.no',
        'doc.track.no',
      ],
      ['asc'],
    ],
    Dsc: [
      [
        getGenre,
        getArtist,
        'doc.year',
        getAlbum,
        'doc.disk.no',
        'doc.track.no',
      ],
      ['desc'],
    ],
  },
};

export default sortOrders;
