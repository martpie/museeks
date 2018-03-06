// For perforances reasons, otherwise _.orderBy will perform weird check
// the is far more resource/time impactful
const parseArtist = (t) => t.loweredMetas.artist.toString();
const parseGenre = (t) => t.loweredMetas.genre.toString();

// Declarations
export const ARTIST = {
  ASC: [ // Default
    [
      parseArtist,
      'year',
      'loweredMetas.album',
      'disk.no',
      'track.no',
    ],
    null,
  ],
  DSC: [
    [
      parseArtist,
      'year',
      'loweredMetas.album',
      'disk.no',
      'track.no',
    ],
    ['desc'],
  ],
};

export const TITLE = {
  ASC: [
    [
      'loweredMetas.title',
      parseArtist,
      'year',
      'loweredMetas.album',
      'disk.no',
      'track.no',
    ],
    null,
  ],
  DSC: [
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
};

export const DURATION = {
  ASC: [
    [
      'duration',
      parseArtist,
      'year',
      'loweredMetas.album',
      'disk.no',
      'track.no',
    ],
    null,
  ],
  DSC: [
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
};

export const ALBUM = {
  ASC: [
    [
      'loweredMetas.album',
      parseArtist,
      'year',
      'disk.no',
      'track.no',
    ],
    null,
  ],
  DSC: [
    [
      'loweredMetas.album',
      parseArtist,
      'year',
      'disk.no',
      'track.no',
    ],
    ['desc'],
  ],
};

export const GENRE = {
  ASC: [
    [
      parseGenre,
      parseArtist,
      'year',
      'loweredMetas.album',
      'disk.no',
      'track.no',
    ],
    null,
  ],
  DSC: [
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
};
