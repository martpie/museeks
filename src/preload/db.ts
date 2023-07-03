import path from 'path';

import { app } from '@electron/remote';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

import {
  Playlist,
  PlaylistModel,
  Track,
  TrackModel,
} from '../shared/types/museeks';

/**
 * This will ultimately move to the main process. Here for legacy purpose until
 * we find a more suitable database as linvodb is not supported anymore.
 */
const pathUserData = app.getPath('userData');

PouchDB.plugin(PouchDBFind);

const Tracks = new PouchDB<Track>(path.join(pathUserData, 'TracksDB'), {
  adapter: 'leveldb',
  auto_compaction: true,
});

Tracks.createIndex({
  index: {
    fields: ['path'],
  },
});

const Playlists = new PouchDB<Playlist>(
  path.join(pathUserData, 'PlaylistsDB'),
  {
    adapter: 'leveldb',
    auto_compaction: true,
  },
);

Playlists.createIndex({
  index: {
    fields: ['importPath'],
  },
});

/** ----------------------------------------------------------------------------
 * Shared helpers
 * -------------------------------------------------------------------------- */

async function reset(): Promise<void> {
  // We cannot use destroy() as it literally destroys it, when we just want to
  // empty it
  const [allTracks, allPlaylists] = await Promise.all([
    tracks.getAll(),
    playlists.getAll(),
  ]);

  const deletedTracks = allTracks.map((track) => ({
    ...track,
    _deleted: true,
  }));

  const deletedPlaylists = allPlaylists.map((playlist) => ({
    ...playlist,
    _deleted: true,
  }));

  await Promise.all([
    Tracks.bulkDocs(deletedTracks),
    Playlists.bulkDocs(deletedPlaylists),
  ]);
}

/** ----------------------------------------------------------------------------
 * Tracks
 * -------------------------------------------------------------------------- */

const tracks = {
  async getAll(): Promise<TrackModel[]> {
    // Use custom IDs instead?
    const [firstResponse, secondResponse] = await Promise.all([
      Tracks.allDocs({ include_docs: true, endkey: '_design' }),
      Tracks.allDocs({ include_docs: true, startkey: '_design\uffff' }),
    ]);

    const tracks = [...firstResponse.rows, ...secondResponse.rows]
      .map((record) => record.doc)
      .filter(Boolean);

    return tracks;
  },

  async insertMultiple(tracks: Track[]) {
    return Tracks.bulkDocs(tracks);
  },

  async update(track: TrackModel) {
    return Tracks.put(track);
  },

  async incrementPlayCount(track: TrackModel) {
    const doc = await Tracks.get(track._id);
    await Tracks.put({
      ...doc,
      playCount: doc.playCount + 1,
    });
  },

  async remove(trackIDs: string[]): Promise<void> {
    const response = await Tracks.find({
      selector: { _id: { $in: trackIDs } },
    });
    const tracks = response.docs;
    const deletedTracks = tracks.map((track) => ({
      ...track,
      _deleted: true,
    }));

    await Tracks.bulkDocs(deletedTracks);
  },

  async findByID(trackIDs: string[]): Promise<TrackModel[]> {
    const response = await Tracks.find({
      selector: { _id: { $in: trackIDs } },
    });
    return response.docs;
  },

  async findOnlyByID(trackID: string): Promise<TrackModel> {
    return Tracks.get(trackID);
  },

  async findByPath(paths: string[]): Promise<TrackModel[]> {
    const response = await Tracks.find({ selector: { path: { $in: paths } } });
    return response.docs;
  },

  async findOnlyByPath(path: string): Promise<TrackModel> {
    const response = await Tracks.find({ selector: { path } });
    const [track] = response.docs;
    return track;
  },
};

/** ----------------------------------------------------------------------------
 * Playlists helpers
 * -------------------------------------------------------------------------- */

const playlists = {
  async getAll(): Promise<PlaylistModel[]> {
    // Use custom IDs instead?
    const [firstResponse, secondResponse] = await Promise.all([
      Playlists.allDocs({ include_docs: true, endkey: '_design' }),
      Playlists.allDocs({ include_docs: true, startkey: '_design\uffff' }),
    ]);

    const playlists = [...firstResponse.rows, ...secondResponse.rows]
      .map((record) => record.doc)
      .filter(Boolean);

    return playlists;
  },

  async insert(playlist: Playlist) {
    return Playlists.post(playlist);
  },

  async rename(playlistID: string, name: string) {
    const playlist = await Playlists.get(playlistID);
    Playlists.put({
      ...playlist,
      name,
    });
  },

  async remove(playlistID: string) {
    const playlist = await Playlists.get(playlistID);

    await Playlists.put({
      ...playlist,
      _deleted: true,
    });
  },

  async findByID(playlistIDs: string[]): Promise<PlaylistModel[]> {
    const response = await Playlists.find({
      selector: { _id: { $in: playlistIDs } },
    });
    return response.docs;
  },

  async findOnlyByID(playlistID: string): Promise<PlaylistModel> {
    return Playlists.get(playlistID);
  },

  async setTracks(playlistID: string, tracksIDs: string[]) {
    const playlist = await Playlists.get(playlistID);

    await Playlists.put({
      ...playlist,
      tracks: tracksIDs,
    });
  },
};

/** ----------------------------------------------------------------------------
 * Export all the way!
 * -------------------------------------------------------------------------- */

const db = {
  reset,
  tracks,
  playlists,
};

export default db;
