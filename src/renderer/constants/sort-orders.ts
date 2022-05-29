import { Track, SortOrder, SortBy } from '../../shared/types/museeks';
import { LibrarySort } from "../store/reducers/library";

// For perforances reasons, otherwise _.orderBy will perform weird check
// the is far more resource/time impactful
const parseArtist = (t: Track): string => t.loweredMetas.artist[0].toString();
const parseGenre = (t: Track): string => t.loweredMetas.genre.toString();

const sortByMapping = {
  [SortBy.ARTIST]: parseArtist,
  [SortBy.TITLE]: 'loweredMetas.title',
  [SortBy.DURATION]: 'duration',
  [SortBy.ALBUM]: 'loweredMetas.album',
  [SortBy.GENRE]: parseGenre,
  [SortBy.YEAR]: 'year',
};

const sortOrderMapping = {
  [SortOrder.ASC]: 'asc',
  [SortOrder.DSC]: 'desc',
}

export function createSortOrder(config: LibrarySort[]) {
  const by = [...config.map(s => sortByMapping[s.by]), 'disk.no', 'track.no'];
  const order = [...config.map(s => sortOrderMapping[s.order]), 'asc', 'asc'];

  return [by, order];
}
