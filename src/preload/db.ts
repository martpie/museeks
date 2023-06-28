import { app } from '@electron/remote';
import linvodb from 'linvodb3';
import leveljs from 'level-js';
import Bluebird from 'bluebird';

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

linvodb.defaults.store = { db: leveljs };
linvodb.dbPath = pathUserData;

const Tracks: TrackModel = new linvodb('track');
Tracks.ensureIndex({ fieldName: 'path', unique: true });

const Playlists: PlaylistModel = new linvodb('playlist');
Playlists.ensureIndex({ fieldName: 'importPath', unique: true, sparse: true });

Bluebird.promisifyAll(Object.getPrototypeOf(Tracks.find()));
Bluebird.promisifyAll(Object.getPrototypeOf(Tracks.findOne()));
Bluebird.promisifyAll(Tracks);
Bluebird.promisifyAll(Playlists);

/** ----------------------------------------------------------------------------
 * Shared helpers
 * -------------------------------------------------------------------------- */

async function reset(): Promise<void> {
  await Tracks.removeAsync({}, { multi: true });
  await Playlists.removeAsync({}, { multi: true });
  return;
}

/** ----------------------------------------------------------------------------
 * Tracks
 * -------------------------------------------------------------------------- */

const tracks = {
  async getAll(): Promise<TrackModel[]> {
    return Tracks.find().execAsync();
  },

  async insert(track: Track): Promise<TrackModel> {
    return Tracks.insertAsync(track);
  },

  async insertMultiple(tracks: Track[]): Promise<TrackModel[]> {
    return Tracks.insertAsync(tracks);
  },

  async update(trackID: string, track: Track): Promise<TrackModel> {
    return Tracks.updateAsync({ _id: trackID }, track);
  },

  async updateWithRawQuery(trackID: string, query: any): Promise<TrackModel> {
    return Tracks.updateAsync({ _id: trackID }, query);
  },

  async remove(trackIDs: string[]): Promise<void> {
    return Tracks.removeAsync({ _id: { $in: trackIDs } }, { multi: true });
  },

  async findByID(trackIDs: string[]): Promise<TrackModel[]> {
    return Tracks.findAsync({ _id: { $in: trackIDs } });
  },

  async findOnlyByID(trackID: string): Promise<TrackModel> {
    return Tracks.findOneAsync({ _id: trackID });
  },

  async findByPath(paths: string[]): Promise<TrackModel[]> {
    return Tracks.findOne({ _id: { $in: paths } });
  },

  async findOnlyByPath(path: string): Promise<TrackModel> {
    return Tracks.findOneAsync({ path });
  },
};

/** ----------------------------------------------------------------------------
 * Playlists helpers
 * -------------------------------------------------------------------------- */

const playlists = {
  async getAll(): Promise<PlaylistModel[]> {
    return Playlists.find({}).sort({ name: 1 }).execAsync();
  },

  async insert(track: Playlist): Promise<PlaylistModel> {
    return Playlists.insertAsync(track);
  },

  async update(playlistID: string, track: Track): Promise<PlaylistModel> {
    return Playlists.updateAsync({ _id: playlistID }, track);
  },

  async updateWithRawQuery(
    playlistID: string,
    query: any,
  ): Promise<PlaylistModel> {
    return Playlists.updateAsync({ _id: playlistID }, query);
  },

  async remove(playlistIDs: string[]): Promise<void> {
    return Playlists.removeAsync(
      { _id: { $in: playlistIDs } },
      { multi: true },
    );
  },

  async findByID(playlistIDs: string[]): Promise<PlaylistModel[]> {
    return Playlists.findAsync({ _id: { $in: playlistIDs } });
  },

  async findOnlyByID(playlistID: string): Promise<PlaylistModel> {
    return Playlists.findOneAsync({ _id: playlistID });
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
