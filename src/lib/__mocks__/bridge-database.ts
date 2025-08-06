import type {
  Playlist,
  ScanResult,
  Track,
  TrackGroup,
} from '../../generated/typings';
import type { DatabaseBridgeInterface } from '../bridge-database';

const MOCK_TRACKS: Array<Track> = [
  {
    id: '0',
    title: 'Test Track',
    artists: ['Test Artist'],
    album: 'Test Album',
    duration: 300,
    album_artist: 'Test Album Artist',
    year: 2023,
    disk_no: 1,
    disk_of: 1,
    track_no: 1,
    track_of: 1,
    genres: ['blues'],
    path: '/test-assets/majestic-blues.mp3',
  },
];

class DatabaseBridge implements DatabaseBridgeInterface {
  tracks: Array<Track> = [];

  async getAllTracks(): Promise<Array<Track>> {
    // return this.tracks;
    return [];
  }

  async getTracks(trackIDs: Array<string>): Promise<Array<Track>> {
    return this.tracks.filter((track) => trackIDs.includes(track.id));
  }

  async updateTrack(_track: Track): Promise<Track> {
    return {} as Track;
  }

  async removeTracks(_trackIDs: Array<string>): Promise<Array<Track>> {
    return [];
  }

  async importTracks(
    _importPaths: Array<string>,
    _refresh = false,
  ): Promise<ScanResult> {
    this.tracks = MOCK_TRACKS;

    return {
      playlist_count: 0,
      track_count: 0,
      playlist_failures: 0,
      track_failures: 0,
    };
  }

  async getAllArtists(): Promise<Array<string>> {
    return [];
  }

  async getArtistTracks(_artist: string): Promise<Array<TrackGroup>> {
    return [];
  }

  async getAllPlaylists(): Promise<Array<Playlist>> {
    return [];
  }

  async getPlaylist(_id: string): Promise<Playlist> {
    return {
      id: '0',
      name: 'test playlist',
      tracks: [],
      import_path: null,
    };
  }

  async createPlaylist(_name: string, _ids: Array<string>): Promise<Playlist> {
    return this.getPlaylist('0');
  }

  async renamePlaylist(_id: string, _name: string): Promise<Playlist> {
    return this.getPlaylist('0');
  }

  async setPlaylistTracks(
    _id: string,
    _tracks: Array<string>,
  ): Promise<Playlist> {
    return this.getPlaylist('0');
  }

  async exportPlaylist(_id: string): Promise<void> {
    return;
  }

  async deletePlaylist(_id: string): Promise<void> {
    return;
  }

  async reset(): Promise<string | null> {
    return null;
  }
}

export default new DatabaseBridge();
