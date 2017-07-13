import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';


/*
|--------------------------------------------------------------------------
| Dropzone
|--------------------------------------------------------------------------
*/

export default class TrackRow extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        subtitle: PropTypes.string,
        onDrop: PropTypes.func,
        onClick: PropTypes.func,
        onDragEnter: PropTypes.func,
        onDragLeave: PropTypes.func,
        onDragOver: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.state = {
            state: 'idle',
        };

        this.onDrop = this.onDrop.bind(this);
        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
    }

    render() {
        const classes = classnames('dropzone', this.state.state);

        return (
            <div
                className={ classes }
                onDragEnter={ this.onDragEnter }
                onDragOver={ this.onDragOver }
                onDragLeave={ this.onDragLeave }
                onDrop={ this.onDrop }
                onClick={ this.props.onClick }
            >
                <div className='title'>{ this.props.title }</div>
                <div className='subtitle'>{ this.props.subtitle }</div>
            </div>
        );
    }

    onDragEnter() {
        if(this.props.onDragEnter) this.props.onDragEnter();
    }

    onDragLeave() {
        this.setState({ state: 'idle' });
        if(this.props.onDragLeave) this.props.onDragLeave();
    }

    onDragOver(e) {
        e.preventDefault();
        this.setState({ state: 'dragging' });
        if(this.props.onDragOver) this.props.onDragOver();
    }

    onDrop(e) {
        e.preventDefault();
        this.setState({ state: 'idle' });
        if(this.props.onDrop) this.props.onDrop(e.nativeEvent);
    }
}
