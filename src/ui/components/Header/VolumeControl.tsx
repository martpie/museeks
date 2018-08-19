import * as React from 'react';
import * as Icon from 'react-fontawesome';
import classnames from 'classnames';
import Slider from 'react-rangeslider';

import * as PlayerActions from '../../actions/PlayerActions';
import Player from '../../lib/player';


/*
|--------------------------------------------------------------------------
| Volume easing - http://www.dr-lex.be/info-stuff/volumecontrols.html#about
|--------------------------------------------------------------------------
*/

const factor = 4;

const smoothifyVolume = (value: number): number => value ** factor;
const unsmoothifyVolume = (value: number): number => value ** (1 / factor); // Linearize a smoothed volume value


/*
|--------------------------------------------------------------------------
| VolumeControl
|--------------------------------------------------------------------------
*/

interface Props {}

interface State {
  showVolume: boolean;
  volume: number;
  muted: boolean;
}


export default class VolumeControl extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const audio = Player.getAudio();

    this.state = {
      showVolume: false,
      volume: unsmoothifyVolume(audio.volume),
      muted: audio.muted,
    };

    this.mute = this.mute.bind(this);
    this.showVolume = this.showVolume.bind(this);
    this.hideVolume = this.hideVolume.bind(this);
    this.setVolume = this.setVolume.bind(this);
  }

  getVolumeIcon(volume: number, muted: boolean) {
    if (muted || volume === 0) return 'volume-off';
    if (volume < 0.5) return 'volume-down';
    return 'volume-up';
  }

  setVolume(value: number) {
    const smoothVolume = smoothifyVolume(value);

    PlayerActions.setVolume(smoothVolume);
    this.setState({ volume: smoothVolume });
  }

  showVolume() {
    this.setState({ showVolume: true });
  }

  hideVolume() {
    this.setState({ showVolume: false });
  }

  mute(e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.classList.contains('player-control') || e.currentTarget.classList.contains('fa')) {
      const muted = !Player.isMuted();

      PlayerActions.setMuted(muted);
      this.setState({ muted });
    }
  }

  render() {
    const volumeClasses = classnames('volume-control', {
      visible: this.state.showVolume,
    });

    return (
      <button
        type="button"
        className="player-control volume"
        title="Volume"
        onMouseEnter={this.showVolume}
        onMouseLeave={this.hideVolume}
        onClick={this.mute}
      >
        <Icon name={this.getVolumeIcon(unsmoothifyVolume(this.state.volume), this.state.muted)} />
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
      </button>
    );
  }
}
