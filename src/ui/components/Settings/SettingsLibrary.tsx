import * as electron from 'electron';
import * as React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';

import Dropzone from '../Shared/Dropzone';

import * as LibraryActions from '../../actions/LibraryActions';
import * as PlayerActions from '../../actions/PlayerActions';
import { LibraryState } from '../../reducers/library';

const { dialog } = electron.remote;

/*
|--------------------------------------------------------------------------
| Child - SettingsLibrary - manage import folders for library
|--------------------------------------------------------------------------
*/

interface Props {
  library: LibraryState;
}

export default class SettingsLibrary extends React.Component<Props> {

  onDrop (e: DragEvent) {
    const files = [];
    const eventFiles = e.dataTransfer.files;

    for (let i = 0; i < eventFiles.length; i++) {
      files.push(eventFiles[i].path);
    }

    LibraryActions.add(files);
  }

  async resetLibrary () {
    PlayerActions.stop();
    await LibraryActions.reset();
  }

  openFolderSelector () {
    dialog.showOpenDialog({
      properties: ['multiSelections', 'openDirectory']
    }, (result) => {
      if (result) {
        LibraryActions.add(result);
      }
    });
  }

  render () {
    return (
      <div className='setting settings-musicfolder'>
        <div className='setting-section'>
          <h4>Manage library</h4>
          <Dropzone
            title='Add music to library'
            subtitle='Drop files or folders here'
            onDrop={this.onDrop}
            onClick={this.openFolderSelector}
          />
          <ButtonGroup>
            <Button
              bsSize='small'
              bsStyle='danger'
              title='Fully reset the library'
              disabled={this.props.library.refreshing}
              onClick={this.resetLibrary}
            >
              Reset library
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
