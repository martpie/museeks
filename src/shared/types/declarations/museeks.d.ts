// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

import TeenyConf from 'teeny-conf';

declare global {
  interface Window {
    __museeks: {
      platform: NodeJS.Platform;
      config: TeenyConf;
    };
  }
}

export {};
