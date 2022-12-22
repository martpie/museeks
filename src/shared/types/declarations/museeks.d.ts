// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

import TeenyConf from 'teeny-conf';
import { Config } from '../museeks';

declare global {
  interface Window {
    __museeks: {
      platform: NodeJS.Platform;
      version: string;
      config: TeenyConf<Config>;
    };
  }
}

export {};
