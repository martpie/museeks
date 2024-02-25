import { SortOrder, SortBy, TrackDoc } from '../generated/typings';
import { Path } from '../types/museeks';

// For perforances reasons, otherwise _.orderBy will perform weird check
// the is far more resource/time impactful
const parseArtist = (t: TrackDoc): string => {
  return t.doc.artists[0].toString();
};
const parseGenre = (t: TrackDoc): string => t.doc.genres[0].toString();

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
      [parseArtist, 'doc.year', 'doc.album', 'doc.disk.no', 'doc.track.no'],
      ['asc'],
    ],
    Dsc: [
      [parseArtist, 'doc.year', 'doc.album', 'doc.disk.no', 'doc.track.no'],
      ['desc'],
    ],
  },
  Title: {
    Asc: [
      [
        'doc.title',
        parseArtist,
        'doc.year',
        'doc.album',
        'doc.disk.no',
        'doc.track.no',
      ],
      ['asc'],
    ],
    Dsc: [
      [
        'doc.title',
        parseArtist,
        'doc.year',
        'doc.album',
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
        'doc.album',
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
        'doc.album',
        'doc.disk.no',
        'doc.track.no',
      ],
      ['desc'],
    ],
  },
  Album: {
    Asc: [
      ['doc.album', parseArtist, 'doc.year', 'doc.disk.no', 'doc.track.no'],
      ['asc'],
    ],
    Dsc: [
      ['doc.album', parseArtist, 'doc.year', 'doc.disk.no', 'doc.track.no'],
      ['desc'],
    ],
  },
  Genre: {
    Asc: [
      [
        parseGenre,
        parseArtist,
        'doc.year',
        'doc.album',
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
        'doc.album',
        'doc.disk.no',
        'doc.track.no',
      ],
      ['desc'],
    ],
  },
};

export default sortOrders;
