import React, { PureComponent } from 'react';
import FullViewMessage from '../Shared/FullViewMessage.react';
import FullViewSubMessage from '../Shared/FullViewSubMessage.react';

/*
|--------------------------------------------------------------------------
| EmptyPlaylist
|--------------------------------------------------------------------------
*/

export default class EmptyPlaylist extends PureComponent {
    render() {
        return (
            <FullViewMessage>
                <p>Empty playlist</p>
                <FullViewSubMessage>
                  You can add tracks from the library view
                </FullViewSubMessage>
            </FullViewMessage>
        );
    }
}
