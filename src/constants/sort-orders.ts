import { SortOrder, SortBy, TrackDoc } from '../generated/typings';
import { Path } from '../types/museeks';

// For perforances reasons, otherwise _.orderBy will perform weird check
// the is far more resource/time impactful
const parseArtist = (t: TrackDoc): string =>
  t.doc.artists[0].toString().toLowerCase();
const parseGenre = (t: TrackDoc): string =>
  t.doc.genres[0].toString().toLowerCase();
const parseAlbum = (t: TrackDoc): string => t.doc.album.toLowerCase();
const parseTitle = (t: TrackDoc): string => t.doc.title.toLowerCase();

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
      [parseArtist, 'doc.year', parseAlbum, 'doc.disk.no', 'doc.track.no'],
      ['asc'],
    ],
    Dsc: [
      [parseArtist, 'doc.year', parseAlbum, 'doc.disk.no', 'doc.track.no'],
      ['desc'],
    ],
  },
  Title: {
    Asc: [
      [
        parseTitle,
        parseArtist,
        'doc.year',
        parseAlbum,
        'doc.disk.no',
        'doc.track.no',
      ],
      ['asc'],
    ],
    Dsc: [
      [
        parseTitle,
        parseArtist,
        'doc.year',
        parseAlbum,
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
        parseArtist,
        'doc.year',
        parseAlbum,
        'doc.disk.no',
        'doc.track.no',
      ],
      ['asc'],
    ],
    Dsc: [
      [
        'doc.duration',
        parseArtist,
        'doc.year',
        parseAlbum,
        'doc.disk.no',
        'doc.track.no',
      ],
      ['desc'],
    ],
  },
  Album: {
    Asc: [
      [parseAlbum, parseArtist, 'doc.year', 'doc.disk.no', 'doc.track.no'],
      ['asc'],
    ],
    Dsc: [
      [parseAlbum, parseArtist, 'doc.year', 'doc.disk.no', 'doc.track.no'],
      ['desc'],
    ],
  },
  Genre: {
    Asc: [
      [
        parseGenre,
        parseArtist,
        'doc.year',
        parseAlbum,
        'doc.disk.no',
        'doc.track.no',
      ],
      ['asc'],
    ],
    Dsc: [
      [
        parseGenre,
        parseArtist,
        'doc.year',
        parseAlbum,
        'doc.disk.no',
        'doc.track.no',
      ],
      ['desc'],
    ],
  },
};

export default sortOrders;
