import { Track, SortOrder, SortBy, Path } from '../../shared/types/museeks';

// For perforances reasons, otherwise _.orderBy will perform weird check
// the is far more resource/time impactful
const parseArtist = (t: Track): string => t.loweredMetas.artist[0].toString();
const parseGenre = (t: Track): string => t.loweredMetas.genre.toString();

type TrackKeys = Path<Track>;
type IterateeFunction = (track: Track) => string;
export type SortTuple = [
  Array<TrackKeys | IterateeFunction>,
  Array<'asc' | 'desc'>,
];

// Declarations
const sortOrders: Record<SortBy, Record<SortOrder, SortTuple>> = {
  [SortBy.ARTIST]: {
    [SortOrder.ASC]: [
      // Default
      [parseArtist, 'year', 'loweredMetas.album', 'disk.no', 'track.no'],
      ['asc'],
    ],
    [SortOrder.DSC]: [
      [parseArtist, 'year', 'loweredMetas.album', 'disk.no', 'track.no'],
      ['desc'],
    ],
  },
  [SortBy.TITLE]: {
    [SortOrder.ASC]: [
      [
        'loweredMetas.title',
        parseArtist,
        'year',
        'loweredMetas.album',
        'disk.no',
        'track.no',
      ],
      ['asc'],
    ],
    [SortOrder.DSC]: [
      [
        'loweredMetas.title',
        parseArtist,
        'year',
        'loweredMetas.album',
        'disk.no',
        'track.no',
      ],
      ['desc'],
    ],
  },
  [SortBy.DURATION]: {
    [SortOrder.ASC]: [
      [
        'duration',
        parseArtist,
        'year',
        'loweredMetas.album',
        'disk.no',
        'track.no',
      ],
      ['asc'],
    ],
    [SortOrder.DSC]: [
      [
        'duration',
        parseArtist,
        'year',
        'loweredMetas.album',
        'disk.no',
        'track.no',
      ],
      ['desc'],
    ],
  },
  [SortBy.ALBUM]: {
    [SortOrder.ASC]: [
      ['loweredMetas.album', parseArtist, 'year', 'disk.no', 'track.no'],
      ['asc'],
    ],
    [SortOrder.DSC]: [
      ['loweredMetas.album', parseArtist, 'year', 'disk.no', 'track.no'],
      ['desc'],
    ],
  },
  [SortBy.GENRE]: {
    [SortOrder.ASC]: [
      [
        parseGenre,
        parseArtist,
        'year',
        'loweredMetas.album',
        'disk.no',
        'track.no',
      ],
      ['asc'],
    ],
    [SortOrder.DSC]: [
      [
        parseGenre,
        parseArtist,
        'year',
        'loweredMetas.album',
        'disk.no',
        'track.no',
      ],
      ['desc'],
    ],
  },
};

export default sortOrders;
