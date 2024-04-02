import * as Setting from '../components/Setting/Setting';
import Button from '../elements/Button/Button';
import Flexbox from '../elements/Flexbox/Flexbox';
import useLibraryStore, { useLibraryAPI } from '../stores/useLibraryStore';

export default function ViewSettingsLibrary() {
  const libraryAPI = useLibraryAPI();
  const isLibraryRefreshing = useLibraryStore((state) => state.refreshing);

  return (
    <div className="setting settings-musicfolder">
      <Setting.Section>
        <Setting.Title>Import music</Setting.Title>
        <Setting.Description>
          playlists from <code>.m3u</code> files will also be created.
        </Setting.Description>
        <Flexbox>
          <Button disabled={isLibraryRefreshing} onClick={libraryAPI.add}>
            Add files or folders
          </Button>
        </Flexbox>
      </Setting.Section>
      <Setting.Section>
        <Setting.Title>Danger zone</Setting.Title>
        <Setting.Description>
          Delete all tracks and playlists from Museeks.
        </Setting.Description>
        <Flexbox>
          <Button
            relevancy="danger"
            title="Fully reset the library"
            disabled={isLibraryRefreshing}
            onClick={libraryAPI.reset}
          >
            Reset library
          </Button>
        </Flexbox>
      </Setting.Section>
    </div>
  );
}
