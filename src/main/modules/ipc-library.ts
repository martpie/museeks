import fs from 'fs';
import path from 'path';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import globby from 'globby';
import * as m3u from '../lib/utils-m3u';

import channels from '../../shared/lib/ipc-channels';
import { SUPPORTED_PLAYLISTS_EXTENSIONS, SUPPORTED_TRACKS_EXTENSIONS } from '../../shared/constants';

import ModuleWindow from './module-window';

interface ScanFile {
  path: string;
  stat: fs.Stats;
}

/**
 * Module in charge of renderer <> main processes communication regarding
 * library management, covers, playlists etc.
 */
class IPCLibraryModule extends ModuleWindow {
  async load(): Promise<void> {
    ipcMain.handle(channels.LIBRARY_SCAN_TRACKS, this.scanTracks);
    ipcMain.handle(channels.PLAYLISTS_RESOLVE_M3U, this.resolveM3u);
  }

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
}

export default IPCLibraryModule;
