import React, { PureComponent } from 'react';

import classnames from 'classnames';

/*
|--------------------------------------------------------------------------
| EmptyQueue
|--------------------------------------------------------------------------
*/

export default class QueueEmpty extends PureComponent {

    render() {
        const queueClasses = classnames('queue text-left', {
            visible: this.props.visible
        });

        return (
            <div className={ queueClasses }>
                <div className='empty-queue text-center'>
                    queue is empty
                </div>
            </div>
        );
    }
}
