import React, {PropTypes} from 'react';
import styles from './styles.css';

import Popover from 'react-popover';

const PropTypesObject = {
  preferPlace         : PropTypes.string,               // ['above', 'below', 'left', 'right']
                                                        // Default: 'above'
  open                : PropTypes.bool,                 // Is the popover open? Often used with trigger === 'none'
  trigger             : PropTypes.string,               // ['click', 'hover', 'hoverDelay', 'none']
                                                        // Default: 'click'
  disableClickClose   : PropTypes.bool,                 // This will stop the popup closing when the overlay is clicked.
  tipSize             : PropTypes.number,               // Size of the arrow. Default: 0
  children            : PropTypes.node.isRequired,      // Two children should be passed in - children[0] is the trigger, children[1] is the popup content
  inheritIsOpen       : PropTypes.bool,                 // Should the popup content inherit the 'isOpen' prop?
                                                        // Default: false
}

export default React.createClass({
  propTypes: PropTypesObject,
  getInitialState () {
    return {
      isOpen: false,
    }
  },
  toggleDelayTime: 200,
  toggleDelayTimeout: null,
  toggleDelay (toState){
    clearTimeout(this.toggleDelayTimeout);
    this.toggleDelayTimeout = setTimeout(()=>{
      this.toggle(toState);
    }, this.toggleDelayTime)
  },
  componentWillUnmount(){
    clearInterval(this.toggleDelayTimeout);
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.open === true || nextProps.open === false){
      this.setState({ isOpen: nextProps.open })
    }
  },
  toggle (toState) {
    const newValue = toState === null ? !this.state.isOpen : toState;
    if(this.state.isOpen !== newValue){
      this.setState({ isOpen: newValue });
    }
  },
  render() {
    const { preferPlace, trigger, disableClickClose, tipSize, offset, children, inheritIsOpen } = this.props;
    const { isOpen } = this.state;
    const tipSizeDefault = tipSize || 6;
    const triggerMap = {
      hover          : {
        onMouseEnter : () => {this.toggle(true)},
        onMouseLeave : () => {this.toggle(false)}
      },
      hoverDelay     : {
        onMouseEnter : () => {this.toggleDelay(true)},
        onMouseLeave : () => {this.toggleDelay(false)}
      },
      hoverSingleDelay : { // This will not trigger out when a child is triggered
        onMouseEnter : () => {this.toggleDelay(true)},
        onMouseOut   : () => {this.toggleDelay(false)}
      },
      click          : {
        onClick      : () => {this.toggle(null)},
        onContextMenu : (e) => {
          e.preventDefault();
          this.toggle(null)
        }
      },
      none          : {},
    };

    const contentMap = {
      hover          : {
      },
      hoverDelay     : {
        onMouseEnter : () => {this.toggleDelay(true)},
        onMouseLeave : () => {this.toggleDelay(false)},
      },
      click          : {
        onClick      : () => {disableClickClose ? null : this.toggle(false)},
      },
      none           : {
      },
    }

    const triggerProps = triggerMap[trigger] || triggerMap['click']; // Default to click
    const contentProps = contentMap[trigger] || contentMap['click']; // Default to click

    // Add the inherited props if required
    const contentPropsWithInherit = inheritIsOpen
    ? Object.assign({}, contentProps, {isOpen: isOpen})
    : contentProps;

    return (
      <Popover
        isOpen={isOpen}
        body={children[1] ? React.cloneElement(children[1], contentPropsWithInherit) : ''}
        onOuterAction={()=>{if(trigger !== 'none'){this.toggle(false)}}}
        preferPlace = {preferPlace || 'above'}
        tipSize={tipSizeDefault}
        offset={offset}>
        {React.cloneElement(children[0], triggerProps)}
      </Popover>
    );
  }
})
