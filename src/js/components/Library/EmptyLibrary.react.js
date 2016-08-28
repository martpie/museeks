import { PureComponent } from 'react';
import { Link } from 'react-router';

import FullViewMessage from '../Shared/FullViewMessage.react';
import FullViewSubMessage from '../Shared/FullViewSubMessage.react';

/*
|--------------------------------------------------------------------------
| EmptyLibrary
|--------------------------------------------------------------------------
*/

export default class EmptyLibrary extends PureComponent {
    render() {
        return (
            <FullViewMessage message='' >
                <p>Too bad, there is no music in your library =(</p>
                <FullViewSubMessage>
                    <span>nothing found yet, but that's fine, you can always </span>
                    <Link to='/settings/library'>add your music here</Link>
                </FullViewSubMessage>
            </FullViewMessage>
        );
    }
}
