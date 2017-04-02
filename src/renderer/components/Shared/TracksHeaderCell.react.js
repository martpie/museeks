import React, { Component } from 'react';

import classnames from 'classnames';

import Dragger from '../DragResize/Dragger';

class TracksHeaderCell extends Component {

    static propTypes = {
        children: React.PropTypes.node,
        id: React.PropTypes.string,
        width: React.PropTypes.number,
        className: React.PropTypes.string,
        setColumnWidth: React.PropTypes.func,
        toggleSort: React.PropTypes.func,
        sort: React.PropTypes.string,
    }

    constructor(props) {
        super(props);
    }

    drag = (event) => {
        this.props.setColumnWidth({
            id: this.props.id,
            width: this.props.width + event.deltaX
        });
    }

    toggleSort = () => {
        this.props.toggleSort({
            id: this.props.id
        });
    }

    render() {
        const { children, width, className, sort } = this.props;
        const style = width && width >= 0
            ? { width: `${width}px` }
            : { };

        return (
            <div className={ classnames('track-cell-header', className) } onClick={ this.toggleSort } style={ style }>
                <div className='track-cell-header-inner'>
                    { children }
                    { sort === 'asc' || sort === 'desc'
                        ? <div className={ classnames('sort-indicator', sort === 'asc' ? 'up' : 'down' ) } />
                        : null
                    }
                </div>
                { width && width >= 0
                    ? <Dragger changeFn={ this.drag } side='left' />
                    : null
                }
            </div>
        );
    }
}

export default TracksHeaderCell;
