import { PureComponent } from 'react';
import { Link } from 'react-router';

export default class NewLibrary extends PureComponent {
    render() {
        return (
            <div className='full-message'>
                <p>Too bad, there is no music in your library =(</p>
                <p className='sub-message'>
                    <span>nothing found yet, but that's fine, you can always </span>
                    <Link to='/settings/library'>add your music here</Link>
                </p>
            </div>
        );
    }
}
