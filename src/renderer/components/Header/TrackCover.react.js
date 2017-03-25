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
        }
    }

    componentWillReceiveProps(nextProps) {
        const oldProps = this.props;
        if (oldProps.src !== nextProps.src) {
            http({
                method: 'GET',
                url: nextProps.src,
                responseType: 'blob'
            })
            .then((response) => {
                const reader = new window.FileReader();
                reader.readAsDataURL(response.data);
                reader.onloadend = () => this.setState({ data: reader.result });
            })
            .catch(() => this.setState({ data: undefined }));
        }
    }

    render() {
        return this.state.data
            ? <div className='cover' style={{ backgroundImage: `url('${this.state.data}')` }} />
            : (
                <div className='cover empty'>
                    <div className='note'>♪</div>
                </div>
            )
    }
}

export default TrackCover;
