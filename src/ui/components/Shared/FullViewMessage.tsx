import * as React from 'react';

/*
|--------------------------------------------------------------------------
| FullViewMessage
|--------------------------------------------------------------------------
*/

export default class FullViewMessage extends React.PureComponent {
  render () {
    return (
      <div className='full-message'>
        { this.props.children }
      </div>
    );
  }
}
