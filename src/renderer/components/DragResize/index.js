import React, { Component } from 'react';
import Dragger from './Dragger';

import classNames from 'classnames';
import './styles.css';

export default class DragResize extends Component {

    static propTypes = {
        widthRange: React.PropTypes.array,
        heightRange: React.PropTypes.array,
        side: React.PropTypes.string
    }

    constructor(props) {
        super(props);
        this.state = props.width
            ? { width: parseInt(props.width) }
            : { height: parseInt(props.height) };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.animateHide !== this.props.animateHide) {
            if (nextProps.width) {
                this.setState({
                    width: nextProps.animateHide ? '0' : nextProps.width,
                    animate: true
                });
            } else{
                this.setState({
                    height: nextProps.animateHide ? '0' : nextProps.height,
                    animate: true
                });
            }
            setTimeout(() => this.setState({ animate: false }), 300);
        }
    }

    drag = (change) => {
        const { widthRange, heightRange } = this.props;
        if (change.deltaX) {
            let width = parseInt(this.state.width) + change.deltaX;
            if (widthRange) {
                if (width < widthRange[0]) {
                    width = widthRange[0];
                } else if (width > widthRange[1]) {
                    width = widthRange[1];
                }
            }
            this.setState({ width });
        } else if (change.deltaY) {
            let height = parseInt(this.state.height) + change.deltaY;
            if (heightRange) {
                if (height < heightRange[0]) {
                    height = heightRange[0];
                } else if(height > heightRange[1]) {
                    height = heightRange[1];
                }
            }
            this.setState({ height });
        }
    }

    render() {
        const { width, height, animate } = this.state;
        const { className, children, side, style } = this.props;
        const baseStyle = {
            width: `${width}px`,
            height: `${height}px`,
            transition: animate ? '0.3s ease all' : 'none',
        };
        const allStyles = Object.assign({}, baseStyle, style);

        return (
            <div style={ allStyles } className={ classNames('DragResizeBox', className) }>
                { children }
                <Dragger changeFn={ this.drag } side={ side } />
            </div>
        );
    }
}
