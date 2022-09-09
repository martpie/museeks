// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

declare global {
  interface Window {
    __museeks: {
      platform: NodeJS.Platform;
    };
  }
}

export {};
