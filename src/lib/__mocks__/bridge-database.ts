import type {
  Playlist,
  ScanResult,
  Track,
  TrackGroup,
} from '../../generated/typings';
import type { DatabaseBridgeInterface } from '../bridge-database';

// Thank you Pixabay for the copyright-free tracks
const MOCK_TRACKS: Array<Track> = [
  {
    id: '0',
    title: 'Whiskey Blues',
    artists: ['Captain_Sleepy'],
    album: 'Another Album',
    duration: 300,
    album_artist: 'Captain_Sleepy',
    year: 2025,
    disk_no: 1,
    disk_of: 1,
    track_no: 1,
    track_of: 1,
    genres: ['rock', 'blues'],
    path: '/whiskey-blues.mp3',
    is_compilation: false,
  },
  {
    id: '1',
    title: 'Majestic Blues',
    artists: ['Desicomix07'],
    album: 'Pixabay',
    duration: 300,
    album_artist: 'Desicomix07',
    year: 2025,
    disk_no: 1,
    disk_of: 1,
    track_no: 1,
    track_of: 2,
    genres: ['blues'],
    path: '/majestic-blues.mp3',
    is_compilation: false,
  },
  {
    id: '2',
    title: 'Romantic Blues',
    artists: ['Jean-Paul-V'],
    album: 'Pixabay',
    duration: 300,
    album_artist: 'Jean-Paul-V',
    year: 2025,
    disk_no: 1,
    disk_of: 1,
    track_no: 2,
    track_of: 2,
    genres: ['blues'],
    path: '/romantic-blues.mp3',
    is_compilation: false,
  },
];

// Weirdly, when using a class property, accessing it is extremely slow. No idea why. May be a webkit issue.
let tracks: Array<Track> = [];

let playlists: Array<Playlist> = [];
let nextPlaylistId = 0;

class DatabaseBridge implements DatabaseBridgeInterface {
  async getAllTracks(): Promise<Array<Track>> {
    return tracks;
  }

  async getTracks(trackIDs: Array<string>): Promise<Array<Track>> {
    return tracks.filter((track) => trackIDs.includes(track.id));
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
    tracks = MOCK_TRACKS;
    playlists = [];
    nextPlaylistId = 0;

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

  async hasCompilations(): Promise<boolean> {
    return false;
  }

  async getCompilationAlbums(): Promise<Array<TrackGroup>> {
    return [];
  }

  async getAllPlaylists(): Promise<Array<Playlist>> {
    return playlists;
  }

  async getPlaylist(id: string): Promise<Playlist> {
    const playlist = playlists.find((p) => p.id === id);
    if (!playlist) throw 'Playlist not found';
    return playlist;
  }

  async createPlaylist(name: string, ids: Array<string>): Promise<Playlist> {
    const playlist: Playlist = {
      id: String(nextPlaylistId++),
      name,
      tracks: ids,
      import_path: null,
    };
    playlists.push(playlist);
    return playlist;
  }

  async renamePlaylist(id: string, name: string): Promise<Playlist> {
    const playlist = playlists.find((p) => p.id === id);
    if (!playlist) throw 'Playlist not found';
    playlist.name = name;
    return playlist;
  }

  async setPlaylistTracks(
    id: string,
    trackIDs: Array<string>,
  ): Promise<Playlist> {
    const playlist = playlists.find((p) => p.id === id);
    if (!playlist) throw 'Playlist not found';
    playlist.tracks = trackIDs;
    return playlist;
  }

  async exportPlaylist(_id: string): Promise<void> {
    return;
  }

  async deletePlaylist(id: string): Promise<void> {
    playlists = playlists.filter((p) => p.id !== id);
  }

  async reset(): Promise<string | null> {
    return null;
  }
}

export default new DatabaseBridge();
