import React, { Component } from 'react';
import clickDrag from 'react-clickdrag';
import './styles.css';

const styles = {
    right: {
        width: '10px',
        top: '0',
        bottom: '0',
        right: '0',
        marginRight: '-6px',
        cursor: 'col-resize'
    },
    left: {
        width: '10px',
        top: '0',
        bottom: '0',
        left: '0',
        marginLeft: '-6px',
        cursor: 'col-resize'
    },
    bottom: {
        height: '6px',
        bottom: '0',
        right: '0',
        left: '0',
        marginBottom: '0px',
        cursor: 'row-resize'
    },
    top: {
        height: '6px',
        top: '0',
        right: '0',
        left: '0',
        marginTop: '-3px',
        cursor: 'row-resize'
    }
};

class DraggerComponent extends Component {

    static propTypes = {
        dataDrag: React.PropTypes.object,
        side: React.PropTypes.string,
        changeFn: React.PropTypes.function
    }

    constructor(props) {
        super(props);

        this.state = {
            lastEventId: null,
            active: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataDrag.isMoving && nextProps.dataDrag.id && nextProps.dataDrag.id !== this.state.lastEventId) {
            this.setState({ active: true, lastEventId: nextProps.dataDrag.id });
            if (nextProps.side === 'left' || nextProps.side === 'right') {
                this.props.changeFn({
                    deltaX: nextProps.side === 'right'
                        ? nextProps.dataDrag.deltaX
                        : -nextProps.dataDrag.deltaX,
                });
            } else {
                this.props.changeFn({
                    deltaY: nextProps.side === 'bottom'
                        ? nextProps.dataDrag.deltaY
                        : -nextProps.dataDrag.deltaY
                });
            }
        } else {
            this.setState({ active: false });
        }
    }

    render() {
        const { side } = this.props;
        return (
          <div className='DragResizeDragger' style={ styles[side] } />
        );
    }
}

export default clickDrag(DraggerComponent, { touch: true });
