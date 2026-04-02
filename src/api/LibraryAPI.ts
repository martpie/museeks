import { t } from '@lingui/core/macro';

import ConfigBridge from '../lib/bridge-config';
import DatabaseBridge from '../lib/bridge-database';
import player from '../lib/player';
import useLibraryStore from '../lib/store';
import toastManager from '../lib/toast-manager';
import { logAndNotifyError } from '../lib/utils';
import { removeRedundantFolders } from '../lib/utils-library';
import type { TrackListStatusInfo, TrackMutation } from '../types/museeks';

/**
 * Filter tracks by search
 */
function search(value: string): void {
  useLibraryStore.setState({ search: value });
}

/**
 * Scan the library for new tracks
 */
async function scan(
  // Force a refresh of the ID3 tags stored in the DB
  refresh = false,
): Promise<void> {
  try {
    useLibraryStore.setState({ refreshing: true });

    const libraryFolders = await ConfigBridge.get('library_folders');
    const scanResult = await DatabaseBridge.importTracks(
      libraryFolders,
      refresh,
    );

    if (scanResult.track_count > 0) {
      const message = refresh
        ? t`${scanResult.track_count} track(s) were refreshed.`
        : t`${scanResult.track_count} track(s) were added to the library.`;

      toastManager.add({ title: message, type: 'success', timeout: 5000 });
    }

    if (scanResult.playlist_count > 0) {
      toastManager.add({
        title: t`${scanResult.playlist_count} playlist(s) were added to the library.`,
        type: 'success',
        timeout: 5000,
      });
    }
  } catch (err) {
    logAndNotifyError(err);
  } finally {
    useLibraryStore.setState({
      refreshing: false,
      refresh: { current: 0, total: 0 },
    });
  }
}

async function addLibraryFolders(paths: Array<string>): Promise<void> {
  try {
    const musicFolders = await ConfigBridge.get('library_folders');
    const newFolders = removeRedundantFolders([
      ...musicFolders,
      ...paths,
    ]).sort();
    await ConfigBridge.set('library_folders', newFolders);
  } catch (err) {
    logAndNotifyError(err);
  }
}

async function removeLibraryFolder(path: string): Promise<void> {
  const musicFolders = await ConfigBridge.get('library_folders');
  const updatedMusicFolders = musicFolders.filter(
    (folderPath: string) => folderPath !== path,
  );

  if (updatedMusicFolders.length === musicFolders.length) {
    // Path to remove not found: no changes to persist
    return;
  }

  await ConfigBridge.set('library_folders', updatedMusicFolders);
}

function setRefresh(current: number, total: number): void {
  useLibraryStore.setState({ refresh: { current, total } });
}

/**
 * Remove tracks from the library
 */
async function removeTracks(tracksIDs: string[]): Promise<void> {
  await DatabaseBridge.removeTracks(tracksIDs);
}

/**
 * Reset the library
 */
async function reset(): Promise<void> {
  player.stop();
  try {
    await DatabaseBridge.reset();
    await ConfigBridge.set('library_folders', []);
    toastManager.add({ title: t`Library was reset`, type: 'success' });
  } catch (err) {
    logAndNotifyError(err);
  }
}

/**
 * Update the ID3 attributes of a track.
 * IMPROVE ME: add support for writing metadata to disk (and not only update
 * the DB).
 */
async function updateTrackMetadata(
  trackID: string,
  newFields: TrackMutation,
): Promise<void> {
  try {
    let [track] = await DatabaseBridge.getTracks([trackID]);

    if (!track) {
      throw new Error('No track found while trying to update track metadata');
    }

    track = { ...track, ...newFields };

    await DatabaseBridge.updateTrack(track);
  } catch (err) {
    logAndNotifyError(err, 'Something wrong happened when updating the track');
  }
}

/**
 * Manually set the footer content based on a list of tracks
 */
function setTracksStatus(status?: TrackListStatusInfo): void {
  useLibraryStore.setState({ tracksStatus: status ?? null });
}

const LibraryAPI = {
  search,
  scan,
  addLibraryFolders,
  removeLibraryFolder,
  setRefresh,
  removeTracks,
  reset,
  updateTrackMetadata,
  setTracksStatus,
};

export default LibraryAPI;
