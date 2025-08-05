import type {
  Playlist,
  ScanResult,
  Track,
  TrackGroup,
} from '../../generated/typings';

// TODO: use Interface for the class

// biome-ignore lint/complexity/noStaticOnlyClass: it's a mock, it's ok
class DatabaseBridge {
  static async getAllTracks(): Promise<Array<Track>> {
    return [];
  }

  static async getTracks(_trackIDs: Array<string>): Promise<Array<Track>> {
    return [];
  }

  static async updateTrack(_track: Track): Promise<Track> {
    return {} as Track;
  }

  static async removeTracks(_trackIDs: Array<string>): Promise<Array<Track>> {
    return [];
  }

  static async importTracks(
    _importPaths: Array<string>,
    _refresh = false,
  ): Promise<ScanResult> {
    return {
      playlist_count: 0,
      track_count: 0,
      playlist_failures: 0,
      track_failures: 0,
    };
  }

  static async getAllArtists(): Promise<Array<string>> {
    return [];
  }

  static async getArtistTracks(_artist: string): Promise<Array<TrackGroup>> {
    return [];
  }

  static async getAllPlaylists(): Promise<Array<Playlist>> {
    return [];
  }

  static async getPlaylist(_id: string): Promise<Playlist> {
    return {
      id: '0',
      name: 'test playlist',
      tracks: [],
      import_path: null,
    };
  }

  static async createPlaylist(
    _name: string,
    _ids: Array<string>,
  ): Promise<Playlist> {
    return DatabaseBridge.getPlaylist('0');
  }

  static async renamePlaylist(_id: string, _name: string): Promise<Playlist> {
    return DatabaseBridge.getPlaylist('0');
  }

  static async setPlaylistTracks(
    _id: string,
    _tracks: Array<string>,
  ): Promise<Playlist> {
    return DatabaseBridge.getPlaylist('0');
  }

  static async exportPlaylist(_id: string): Promise<void> {
    return;
  }

  static async deletePlaylist(_id: string): Promise<void> {
    return;
  }

  static async reset(): Promise<string | null> {
    return null;
  }
}

export default DatabaseBridge;
