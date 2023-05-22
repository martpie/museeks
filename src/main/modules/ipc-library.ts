import fs from 'fs';
import path from 'path';

import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { globby } from 'globby';
import * as mmd from 'music-metadata';
import queue from 'queue';
import { pickBy } from 'lodash-es';

import * as m3u from '../lib/utils-m3u';
import channels from '../../shared/lib/ipc-channels';
import { Track } from '../../shared/types/museeks';
import logger from '../../shared/lib/logger';
import { getLoweredMeta } from '../../shared/lib/utils-id3';

import ModuleWindow from './module-window';

interface ScanFile {
  path: string;
  stat: fs.Stats;
}

/*
|--------------------------------------------------------------------------
| supported Formats
|--------------------------------------------------------------------------
*/

const SUPPORTED_TRACKS_EXTENSIONS = [
  // MP3 / MP4
  '.mp3',
  '.mp4',
  '.aac',
  '.m4a',
  '.3gp',
  '.wav',
  // Opus
  '.ogg',
  '.ogv',
  '.ogm',
  '.opus',
  // Flac
  '.flac',
  // web media
  '.webm',
];

const SUPPORTED_PLAYLISTS_EXTENSIONS = ['.m3u'];

/**
 * Module in charge of renderer <> main processes communication regarding
 * library management, covers, playlists etc.
 */
class IPCLibraryModule extends ModuleWindow {
  public import: {
    processed: number;
    total: number;
  };

  constructor(window: BrowserWindow) {
    super(window);

    this.import = {
      processed: 0,
      total: 0,
    };
  }

  async load(): Promise<void> {
    ipcMain.handle(channels.LIBRARY_IMPORT_TRACKS, this.importTracks.bind(this));
    ipcMain.handle(channels.LIBRARY_SCAN_TRACKS, this.scanTracks.bind(this));
    ipcMain.handle(channels.PLAYLISTS_RESOLVE_M3U, this.resolveM3u.bind(this));
  }

  // ---------------------------------------------------------------------------
  // IPC Events
  // ---------------------------------------------------------------------------

  /**
   * Scan the file system and return all music files and playlists that may be
   * safely imported to Museeks.
   */
  private async scanTracks(_e: IpcMainInvokeEvent, pathsToScan: string[]): Promise<[string[], string[]]> {
    // 1. Get the stats for all the files/paths
    const statsPromises: Promise<ScanFile>[] = pathsToScan.map(async (folderPath) => ({
      path: folderPath,
      stat: await fs.promises.stat(folderPath),
    }));

    const paths = await Promise.all(statsPromises);

    // 2. Split directories and files
    const files: string[] = [];
    const folders: string[] = [];

    paths.forEach((elem) => {
      if (elem.stat.isFile()) files.push(elem.path);
      if (elem.stat.isDirectory() || elem.stat.isSymbolicLink()) folders.push(elem.path);
    });

    // 3. Scan all the directories with globby
    const globbies = folders.map((folder) => {
      // Normalize slashes and escape regex special characters
      const pattern = `${folder.replace(/\\/g, '/').replace(/([$^*+?()\[\]])/g, '\\$1')}/**/*.*`;

      return globby(pattern, { followSymbolicLinks: true });
    });

    const subDirectoriesFiles = await Promise.all(globbies);
    // Scan folders and add files to library

    // 4. Merge all path arrays together and filter them with the extensions we support
    const allFiles = subDirectoriesFiles.reduce((acc, array) => acc.concat(array), [] as string[]).concat(files); // Add the initial files

    const supportedTrackFiles = allFiles.filter((filePath) => {
      const extension = path.extname(filePath).toLowerCase();
      return SUPPORTED_TRACKS_EXTENSIONS.includes(extension);
    });

    const supportedPlaylistsFiles = allFiles.filter((filePath) => {
      const extension = path.extname(filePath).toLowerCase();
      return SUPPORTED_PLAYLISTS_EXTENSIONS.includes(extension);
    });

    return [supportedTrackFiles, supportedPlaylistsFiles];
  }

  private async resolveM3u(_e: IpcMainInvokeEvent, path: string): Promise<string[]> {
    return m3u.parse(path);
  }

  /**
   * Now: returns the id3 tags of all the given tracks path
   * Tomorrow: do DB insertion here
   */
  async importTracks(_e: IpcMainInvokeEvent, tracksPath: string[]): Promise<Track[]> {
    return new Promise((resolve, reject) => {
      if (tracksPath.length === 0) return;

      try {
        // Instantiate queue
        const scannedFiles: Track[] = [];

        // eslint-disable-next-line
        // https://github.com/jessetane/queue/pull/15#issuecomment-414091539
        const scanQueue = new queue();
        scanQueue.concurrency = 32;
        scanQueue.autostart = true;

        scanQueue.addEventListener('end', () => {
          this.import.processed = 0;
          this.import.total = 0;

          resolve(scannedFiles);
        });
        // End queue instantiation

        this.import.total += tracksPath.length;

        // Add all the items to the queue
        tracksPath.forEach((filePath) => {
          scanQueue.push(async (callback) => {
            try {
              // Normalize (back)slashes on Windows
              filePath = path.resolve(filePath);

              // Check if there is an existing record in the DB
              // const existingDoc = await db.tracks.findOnlyByPath(filePath);

              // If there is existing document
              // if (!existingDoc) {
              // Get metadata
              const track = await this.getMetadata(filePath);
              // const insertedDoc = await db.tracks.insert(track);
              scannedFiles.push(track);
              // }

              this.import.processed++;
            } catch (err) {
              logger.warn(err);
            }

            if (callback) callback();
          });
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private getDefaultMetadata(): Track {
    return {
      album: 'Unknown',
      artist: ['Unknown artist'],
      disk: {
        no: 0,
        of: 0,
      },
      duration: 0,
      genre: [],
      loweredMetas: {
        artist: ['unknown artist'],
        album: 'unknown',
        title: '',
        genre: [],
      },
      path: '',
      playCount: 0,
      title: '',
      track: {
        no: 0,
        of: 0,
      },
      year: null,
    };
  }

  private parseMusicMetadata(data: mmd.IAudioMetadata, trackPath: string): Partial<Track> {
    const { common, format } = data;

    const metadata = {
      album: common.album,
      artist: common.artists || (common.artist && [common.artist]) || (common.albumartist && [common.albumartist]),
      disk: common.disk,
      duration: format.duration,
      genre: common.genre,
      title: common.title || path.parse(trackPath).base,
      track: common.track,
      year: common.year,
    };

    return pickBy(metadata);
  }

  /**
   * Get a file ID3 metadata
   */
  private async getMetadata(trackPath: string): Promise<Track> {
    const defaultMetadata = this.getDefaultMetadata();

    const basicMetadata: Track = {
      ...defaultMetadata,
      path: trackPath,
    };

    try {
      const data = await mmd.parseFile(trackPath, {
        skipCovers: true,
        duration: true,
      });

      // Let's try to define something with what we got so far...
      const parsedData = this.parseMusicMetadata(data, trackPath);

      const metadata: Track = {
        ...defaultMetadata,
        ...parsedData,
        path: trackPath,
      };

      metadata.loweredMetas = getLoweredMeta(metadata);

      // Let's try another wat to retrieve a track duration
      // if (metadata.duration < 0.5) {
      //   try {
      //     metadata.duration = await getAudioDuration(trackPath);
      //   } catch (err) {
      //     logger.warn(`An error occured while getting ${trackPath} duration: ${err}`);
      //   }
      // }

      return metadata;
    } catch (err) {
      logger.warn(`An error occured while reading ${trackPath} id3 tags: ${err}`);
    }

    return basicMetadata;
  }
}

export default IPCLibraryModule;
