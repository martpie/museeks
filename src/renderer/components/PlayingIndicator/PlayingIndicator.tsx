import React, { useState } from 'react';
import Icon from 'react-fontawesome';
import { useSelector } from 'react-redux';

import * as PlayerActions from '../../store/actions/PlayerActions';
import { PlayerStatus } from '../../../shared/types/museeks';
import { RootState } from '../../store/reducers';

import styles from './PlayingIndicator.module.css';

const getIcon = (state: PlayerStatus, hovered: boolean) => {
  if (state === PlayerStatus.PLAY) {
    if (hovered) {
      return <Icon name='pause' fixedWidth />;
    }

    return (
      <div className={styles.animation}>
        <div className={`${styles.bar}`} />
        <div className={`${styles.bar} ${styles.barSecond}`} />
        <div className={`${styles.bar} ${styles.barThird}`} />
      </div>
    );
  }

  return <Icon name='play' fixedWidth />;
};

const TrackPlayingIndicator: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const playerStatus = useSelector((state: RootState) => state.player.playerStatus);

  const icon = getIcon(playerStatus, hovered);

  return (
    <button
      className={`${styles.playingIndicator} reset`}
      onClick={PlayerActions.playPause}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
    >
      {icon}
    </button>
  );
};

export default TrackPlayingIndicator;
