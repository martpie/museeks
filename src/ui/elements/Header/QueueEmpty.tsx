import * as React from 'react';

/*
|--------------------------------------------------------------------------
| EmptyQueue
|--------------------------------------------------------------------------
*/

export default class QueueEmpty extends React.PureComponent {
  render () {
    return (
      <div className='queue text-left'>
        <div className='empty-queue text-center'>
          queue is empty
        </div>
      </div>
    );
  }
}
