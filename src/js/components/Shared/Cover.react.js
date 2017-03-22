import React, { PureComponent } from 'react';

import utils  from '../../utils/utils';


/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

export default class TrackCover extends PureComponent {

    static propTypes = {
        path: React.PropTypes.string
    }

    constructor(props) {
        super(props);
        this.state = {
            coverPath: null,
        };

        this.fetchInitialCover = this.fetchInitialCover.bind(this);
    }

    render() {
        if(this.state.coverPath) {
            const styles = { backgroundImage: `url('${this.state.coverPath}')` };

            return <div className='cover' style={ styles } />;
        }

        return(
            <div className='cover empty'>
                <div className='note'>♪</div>
            </div>
        );
    }

    componentDidMount() {
        this.fetchInitialCover();
    }

    async componentWillUpdate(nextProps) {
        if(nextProps.path !== this.props.path) {
            const coverPath = await utils.fetchCover(nextProps.path);
            this.setState({ coverPath });
        }
    }

    async fetchInitialCover() {
        const coverPath = await utils.fetchCover(this.props.path);
        this.setState({ coverPath });
    }
}
