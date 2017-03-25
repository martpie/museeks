import React, { PureComponent } from 'react';


/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

class TrackCover extends PureComponent {

    static propTypes = {
        cover: React.PropTypes.string
    }

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        const img = new Image();
        img.src = this.props.cover;
        img.onerror = () => this.setState({ cover: undefined });
    }


    // import http from 'axios';
    // class image = {
    //     onPropsDidChange(newProps) {
    //         const oldProps = this.props;
    //         if (oldProps.src != newProps.src) {
    //             http(src).then((response) => {
    //                 this.setState({data: response.data);
    //             })
    //         }
    //     }
    //     render() {
    //         return this.state.data
    //             ? <div style={{ src = this.state.data }}></div>
    //             ? <div style={{ fa-music-note }}></div>
    //     }
    // }


    render() {
        if (this.cover) {
            const styles = { backgroundImage: `url('${this.state.cover}')` };
            return <div className='cover' style={ styles } />;
        }

        return(
            <div className='cover empty'>
                <div className='note'>♪</div>
            </div>
        );
    }
}

export default TrackCover;
