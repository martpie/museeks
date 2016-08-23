import React, { Component } from 'react';


/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

export default class PlayingBar extends Component {

    static propTypes = {
        cover: React.PropTypes.string
    }

    constructor(props) {

        super(props);
    }

    render() {


        if(this.props.cover) {

            const styles = { backgroundImage: `url(${this.props.cover})` };

            return <div className='cover' style={ styles }></div>;
        }

        return(
            <div className='cover empty'>
                <div className='note'>♪</div>
            </div>
        );
    }
}
