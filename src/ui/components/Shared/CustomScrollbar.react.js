import React from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';


class CustomScrollbar extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    onScroll: PropTypes.func.isRequired,
  }

  static defaultProps = {
    children: null,
    className: '',
  }

  static getRenderView(props) {
    // the tabIndex={0} is needed to make the pageup/pagedown/home/end keys
    // work propery
    return (
      <div {...props} className="tracks-list-render-view" />
    );
  }

  static getTrackVertical(props) {
    return <div {...props} className="track-vertical" />;
  }

  static getThumbVertical(props) {
    return <div {...props} className="thumb-vertical" />;
  }

  render() {
    return (
      <Scrollbars
        className={this.props.className}
        onScroll={this.props.onScroll}
        renderView={CustomScrollbar.getRenderView}
        renderTrackVertical={CustomScrollbar.getTrackVertical}
        renderThumbVertical={CustomScrollbar.getThumbVertical}
        autoHide
        autoHideTimeout={1000}
      >
        {this.props.children}
      </Scrollbars>
    );
  }
}

export default CustomScrollbar;
