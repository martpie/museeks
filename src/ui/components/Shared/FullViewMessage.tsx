import React, { PureComponent } from 'react';

/*
|--------------------------------------------------------------------------
| FullViewMessage
|--------------------------------------------------------------------------
*/

export default class FullViewMessage extends PureComponent {
  render() {
    return (
      <div className="full-message">
        { this.props.children }
      </div>
    );
  }
}
