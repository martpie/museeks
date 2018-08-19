import * as React from 'react';

import AppActions from '../../actions/AppActions';

/*
|--------------------------------------------------------------------------
| WindowControls
|--------------------------------------------------------------------------
*/

export default class WindowControls extends React.PureComponent {
  render() {
    return (
      <div className="window-controls">
        <button
          className="window-control window-minimize"
          onClick={AppActions.minimize}
          title="Minimize"
        /> { /* custom line with ::after */ }
        <button
          className="window-control window-maximize"
          onClick={AppActions.maximize}
          title="Maximize"
        /> { /* custom square with ::after */ }
        <button
          className="window-control window-close"
          onClick={AppActions.close}
          title="Close"
        /> { /* custom cross with ::before and ::after */ }
      </div>
    );
  }
}
