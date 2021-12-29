import { readFileSync, writeFileSync } from 'fs-extra';
import * as NodeID3 from 'node-id3';
import { Track } from '../../shared/types/museeks';

const persistTags = (track: Track): void => {
  const fileBuffer = readFileSync(track.path);

  const tags = {
    title: track.title,
    artist: track.artist[0],
    album: track.album,
    year: track.year?.toString(),
    genre: track.genre[0],
  };

  const updatedBuffer = NodeID3.update(tags, fileBuffer);
  writeFileSync(track.path, updatedBuffer);
};

export default persistTags;
