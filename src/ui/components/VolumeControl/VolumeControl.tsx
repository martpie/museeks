import * as React from 'react';
import * as Icon from 'react-fontawesome';
import cx from 'classnames';
import Slider from 'react-rangeslider';

import * as PlayerActions from '../../actions/PlayerActions';
import Player from '../../lib/player';

import * as styles from './VolumeControl.css';
import * as controlStyles from '../PlayerControls/PlayerControls.css';

// Volume easing - http://www.dr-lex.be/info-stuff/volumecontrols.html#about
const SMOOTHING_FACTOR = 4;

const smoothifyVolume = (value: number): number => value ** SMOOTHING_FACTOR;
const unsmoothifyVolume = (value: number): number => value ** (1 / SMOOTHING_FACTOR);

interface Props {}

interface State {
  showVolume: boolean;
  volume: number;
  muted: boolean;
}

export default class VolumeControl extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props);

    const audio = Player.getAudio();

    this.state = {
      showVolume: false,
      volume: unsmoothifyVolume(audio.volume),
      muted: audio.muted
    };

    this.mute = this.mute.bind(this);
    this.showVolume = this.showVolume.bind(this);
    this.hideVolume = this.hideVolume.bind(this);
    this.setVolume = this.setVolume.bind(this);
  }

  getVolumeIcon (volume: number, muted: boolean) {
    if (muted || volume === 0) return 'volume-off';
    if (volume < 0.5) return 'volume-down';
    return 'volume-up';
  }

  setVolume (value: number) {
    const smoothVolume = smoothifyVolume(value);

    PlayerActions.setVolume(smoothVolume);
    this.setState({ volume: smoothVolume });
  }

  showVolume () {
    this.setState({ showVolume: true });
  }

  hideVolume () {
    this.setState({ showVolume: false });
  }

  mute (e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.classList.contains(controlStyles.control) || e.currentTarget.classList.contains('fa')) {
      const muted = !Player.isMuted();

      PlayerActions.setMuted(muted);
      this.setState({ muted });
    }
  }

  render () {
    const volumeClasses = cx(styles.volumeControl, {
      [styles.visible]: this.state.showVolume
    });

    return (
      <div
        className={styles.volumeControlContainer}
        onMouseEnter={this.showVolume}
        onMouseLeave={this.hideVolume}
      >
        <button
          type='button'
          className={controlStyles.control}
          title='Volume'
          onClick={this.mute}
        >
          <Icon name={this.getVolumeIcon(unsmoothifyVolume(this.state.volume), this.state.muted)} />
        </button>
        <div className={volumeClasses}>
          <Slider
            min={0}
            max={1}
            step={0.01}
            tooltip={false}
            value={unsmoothifyVolume(this.state.volume)}
            onChange={this.setVolume}
          />
        </div>
      </div>
    );
  }
}
