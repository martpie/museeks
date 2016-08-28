import React, { PureComponent } from 'react';
import FullViewMessage from '../Shared/FullViewMessage.react';

/*
|--------------------------------------------------------------------------
| EmptyPlaylist
|--------------------------------------------------------------------------
*/

export default class EmptyPlaylist extends PureComponent {

    constructor(props) {

        super(props);
    }

    render() {
        return (
            <FullViewMessage>
                <p>Empty playlist</p>
                <p className='sub-message'>You can add tracks from the library view</p>
            </FullViewMessage>
        );
    }
}
