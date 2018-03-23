const electron = require('electron');

module.exports.checkBounds = function(bounds) {
  // check if the browser window is offscreen
  const display = electron.screen.getDisplayNearestPoint(bounds).workArea;

  const onScreen = bounds.x >= display.x
        && bounds.x + bounds.width <= display.x + display.width
        && bounds.y >= display.y
        && bounds.y + bounds.height <= display.y + display.height;

  if(!onScreen) {
    delete bounds.x;
    delete bounds.y;
    bounds.width = 900;
    bounds.height = 550;
  }

  return bounds;
};
