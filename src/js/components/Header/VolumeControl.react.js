import React, { PureComponent } from 'react';
import Icon from 'react-fontawesome';

import classnames from 'classnames';

export default class VolumeControl extends PureComponent {

    static propTypes = {
        audio: React.PropTypes.object,
        onShowVolume: React.PropTypes.func,
        onHideVolume: React.PropTypes.func,
        onVolumeChange: React.PropTypes.func,
        onMute: React.PropTypes.func,
    }

    getVolumeIcon(audio) {
        return audio.muted || audio.volume === 0 ? 'volume-off' : audio.volume > 0.5 ? 'volume-up' : 'volume-down';
    }

    render() {
        const volumeClasses = classnames('volume-control', {
            visible: this.props.showVolume
        });

        return (
            <button type='button'
                    className='player-control volume'
                    onMouseEnter={ this.props.onShowVolume }
                    onMouseLeave={ this.props.onHideVolume }
                    onClick={ this.props.onMute }
            >
                <Icon name={ this.getVolumeIcon(this.props.audio) } />
                <div className={ volumeClasses }>
                    <input type={ 'range' }
                           min={ 0 }
                           max={ 1 }
                           step={ 0.01 }
                           defaultValue={ Math.pow(this.props.audio.volume, 1 / 4) }
                           ref='volume'
                           onChange={ this.props.onVolumeChange }
                    />
                </div>
            </button>
        );
    }

}
