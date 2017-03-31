import React, { PureComponent } from 'react';
import http from 'axios';


/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

class TrackCover extends PureComponent {

    static propTypes = {
        src: React.PropTypes.string
    }

    constructor(props) {
        super(props);

        this.state = {
            data: undefined
        };
    }

    componentDidMount() {
        this.fetchCover(this.props.src);
    }

    componentWillReceiveProps(nextProps) {
        const oldProps = this.props;
        if (oldProps.src !== nextProps.src) {
            this.fetchCover(nextProps.src);
        }
    }

    fetchCover = (url) => {
        http({
            method: 'GET',
            url,
            responseType: 'blob'
        })
        .then((response) => {
            const reader = new window.FileReader();
            reader.readAsDataURL(response.data);
            reader.onloadend = () => this.setState({ data: reader.result });
        })
        // .catch(() => this.setState({ data: undefined }));
    }

    render() {
        return this.state.data
            ? <div className='cover' style={ { backgroundImage: `url('${this.state.data}')` } } />
            : (
                <div className='cover empty'>
                    <div className='note'>♪</div>
                </div>
            );
    }
}

export default TrackCover;
