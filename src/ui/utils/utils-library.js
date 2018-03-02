export const filterTracks = (tracks, search) => {
  return tracks.filter((track) => {
    return track.loweredMetas.artist.join(', ').includes(search)
      || track.loweredMetas.album.includes(search)
      || track.loweredMetas.genre.join(', ').includes(search)
      || track.loweredMetas.title.includes(search);
  });
};
