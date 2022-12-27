import electron from 'electron';

import { ConfigBounds } from '~shared/types/museeks';

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 550;

export const checkBounds = function (bounds: ConfigBounds | undefined): ConfigBounds {
  if (bounds === undefined) {
    bounds = {
      x: 0,
      y: 0,
      height: 0,
      width: 0,
    };
  }

  // check if the browser window is offscreen
  const display = electron.screen.getDisplayNearestPoint({
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
  }).workArea;

  const onScreen =
    bounds.x >= display.x &&
    bounds.x + bounds.width <= display.x + display.width &&
    bounds.y >= display.y &&
    bounds.y + bounds.height <= display.y + display.height;

  if (!onScreen) {
    return {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      x: display.width / 2 - DEFAULT_WIDTH / 2,
      y: display.height / 2 - DEFAULT_HEIGHT / 2,
    };
  }

  return bounds;
};
