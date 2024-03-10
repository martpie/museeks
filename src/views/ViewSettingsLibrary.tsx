import * as Setting from '../components/Setting/Setting';
import Button from '../elements/Button/Button';
import useLibraryStore, { useLibraryAPI } from '../stores/useLibraryStore';

export default function ViewSettingsLibrary() {
  const libraryAPI = useLibraryAPI();
  const isLibraryRefreshing = useLibraryStore((state) => state.refreshing);

  return (
    <div className="setting settings-musicfolder">
      <Setting.Section>
        <h3 style={{ marginTop: 0 }}>Import music</h3>
        <Setting.Description>
          This will also scan for <code>.m3u</code> files and create
          corresponding playlists.
        </Setting.Description>
        <Button disabled={isLibraryRefreshing} onClick={libraryAPI.add}>
          Add files or folders
        </Button>
      </Setting.Section>
      <Setting.Section>
        <h3>Danger zone</h3>
        <Button
          relevancy="danger"
          title="Fully reset the library"
          disabled={isLibraryRefreshing}
          onClick={libraryAPI.reset}
        >
          Reset library
        </Button>
      </Setting.Section>
    </div>
  );
}
