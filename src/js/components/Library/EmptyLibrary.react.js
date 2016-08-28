import { PureComponent } from 'react';
import { Link } from 'react-router';
import FullViewMessage from '../Shared/FullViewMessage.react';

/*
|--------------------------------------------------------------------------
| EmptyLibrary
|--------------------------------------------------------------------------
*/

export default class EmptyLibrary extends PureComponent {
    render() {
        return (
            <FullViewMessage message='Too bad, there is no music in your library =(' >
                <span>nothing found yet, but that's fine, you can always </span>
                <Link to='/settings/library'>add your music here</Link>
            </FullViewMessage>
        );
    }
}
