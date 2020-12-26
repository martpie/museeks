import { createStore, applyMiddleware, Store } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { PlayerStatus } from '../shared/types/interfaces';
import rootReducer, { RootState } from './reducers';
import { PlayerState } from './reducers/player';
import player from './lib/player';

const logger = createLogger({
  collapsed: true,
});

// We do not want to persist player's status as the player should always be
// stopped/paused when starting the app
const playerStatusTransform = createTransform(
  (inboundState: PlayerState) => {
    return {
      ...inboundState,
      playerStatus: inboundState.playerStatus === PlayerStatus.PLAY ? PlayerStatus.PAUSE : inboundState.playerStatus,
    };
  },
  null,
  { whitelist: ['player'] }
);

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['toasts', 'playlists', 'library'],
  version: 1,
  transforms: [playerStatusTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middlewares = applyMiddleware(thunk, logger);
const store: Store<RootState> = createStore(persistedReducer, middlewares);

export const persistor = persistStore(store, null, () => {
  // Let's set the player's src and currentTime with the info we have persisted in store
  const state = store.getState();

  if (state.player.queue && state.player.queueCursor) {
    const track = state.player.queue[state.player.queueCursor];

    player.setAudioSrc(track.path);
  }
});

export default store;
