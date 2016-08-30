import React, { PureComponent } from 'react';

import QueueEmpty from './QueueEmpty.react';
import QueueList from './QueueList.react';


/*
|--------------------------------------------------------------------------
| Header - Queue
|--------------------------------------------------------------------------
*/

export default class Queue extends PureComponent {

    static propTypes = {
        queue: React.PropTypes.array,
        queueCursor: React.PropTypes.number,
        visible: React.PropTypes.bool
    }

    constructor(props) {

        super(props);
    }

    render() {
        const queue       = this.props.queue;
        const queueCursor = this.props.queueCursor;

        const shownQueue = queue.slice(queueCursor + 1, queueCursor + 21);

        if(shownQueue.length === 0) {
            return <QueueEmpty visible={ this.props.visible } />;
        }

        return <QueueList { ...this.props } />;
    }
}
