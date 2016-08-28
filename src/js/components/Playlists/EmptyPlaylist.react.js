import React, { PureComponent } from 'react';
import FullViewMessage from '../Shared/FullViewMessage.react';

/*
|--------------------------------------------------------------------------
| EmptyPlaylist
|--------------------------------------------------------------------------
*/

export default class EmptyPlaylist extends PureComponent {
    render() {
        return (
          <FullViewMessage message='Empty playlist'>
            <span>You can add tracks from the library view</span>
          </FullViewMessage>
        );
    }
}
