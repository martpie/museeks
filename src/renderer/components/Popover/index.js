import React, { PropTypes, Component } from 'react';
import styles from './styles.css';
import Popover from 'react-popover';

export default class PopoverWrapper extends Component {
  static propTypes = {
    preferPlace         : PropTypes.string,               // ['above', 'below', 'left', 'right']
                                                          // Default: 'above'
    open                : PropTypes.bool,                 // Is the popover open? Often used with trigger === 'none' to control state externally
    trigger             : PropTypes.string,               // ['click', 'hover', 'hoverDelay', 'hoverSingleDelay', 'none']
                                                          // Default: 'click'
    disableClickClose   : PropTypes.bool,                 // This will stop the popup closing when the overlay is clicked.
    tipSize             : PropTypes.number,               // Size of the arrow. Default: 6
    children            : PropTypes.node.isRequired,      // Two children should be passed in - children[0] is the trigger, children[1] is the popup content
    inheritIsOpen       : PropTypes.bool                  // Should the popup content inherit the 'isOpen' prop?
  }

  static defaultProps = {
    ...Component.defaultProps,
    tipSize: 6,
    trigger: 'click',
    preferPlace: 'above'
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
    this.toggleDelayTime = 200;
    this.toggleDelayTimeout = null;
  }

  componentWillUnmount() {
    clearInterval(this.toggleDelayTimeout);
  }

  componentWillReceiveProps(nextProps) {
    const { open } = nextProps;
    if (open === true || open === false) {
      this.setState({ isOpen: open });
    }
  }

  toggleDelay = (toState) => {
    clearTimeout(this.toggleDelayTimeout);
    this.toggleDelayTimeout = setTimeout(() => {
      this.toggle(toState);
    }, this.toggleDelayTime);
  }

  toggle = (toState) => {
    // Toggle isOpen to the toState (toState === null will toggle)
    const newValue = toState === null ? !this.state.isOpen : toState;
    if (this.state.isOpen !== newValue) {
      this.setState({ isOpen: newValue });
    }
  }

  outerAction = () => {
      if (this.props.trigger !== 'none') {
        this.toggle(false);
      }
  }

  getTriggerEventBinds = (triggerType) => {
    const events = {
      // Standard hover trigger
      hover: {
        onMouseEnter: () => { this.toggle(true) },
        onMouseLeave: () => { this.toggle(false) },
      },
      // Delay open/close toggle
      hoverDelay: {
        onMouseEnter: () => { this.toggleDelay(true) },
        onMouseLeave: () => { this.toggleDelay(false) },
      },
      // Only trigger on the parent (not sub elements)
      hoverSingleDelay: {
        onMouseEnter: () => { this.toggleDelay(true) },
        onMouseOut: () => { this.toggleDelay(false) },
      },
      // Standard click trigger
      click: {
        onClick: () => { this.toggle(null) },
        onContextMenu: (e) => {
          e.preventDefault();
          this.toggle(null);
        }
      },
      // No trigger (to be used with props.open)
      none: {},
    };

    return events[triggerType];
  }

  getPopoverEventBinds = (triggerType) => {
    const events = {
      hover: {},
      hoverDelay: {
        onMouseEnter: () => { this.toggleDelay(true) },
        onMouseLeave: () => { this.toggleDelay(false) },
      },
      click: {
        onClick: () => { this.props.disableClickClose ? null : this.toggle(false) },
      },
      none: {},
    };

    return events[triggerType];
  }

  render() {
    const { preferPlace, trigger, tipSize, offset, children, inheritIsOpen } = this.props;
    const { isOpen } = this.state;

    // Get the event bind props
    const triggerProps = this.getTriggerEventBinds(trigger);
    const contentProps = this.getPopoverEventBinds(trigger);

    // Add the 'isOpen' prop to the content if 'inheritIsOpen'
    const contentPropsWithInherit = inheritIsOpen
      ? Object.assign({}, contentProps, { isOpen })
      : contentProps;

    // Create the content element
    const contentElement = children[1]
      ? React.cloneElement(children[1], contentPropsWithInherit)
      : '';

    // Create the trigger element
    const triggerElement = children[0]
      ? React.cloneElement(children[0], triggerProps)
      : '';

    return (
      <Popover
        isOpen={ isOpen }
        body={ contentElement }
        onOuterAction={ this.outerAction }
        preferPlace = { preferPlace }
        tipSize={ tipSize }
        offset={ offset }>
        { triggerElement }
      </Popover>
    );
  }
}
