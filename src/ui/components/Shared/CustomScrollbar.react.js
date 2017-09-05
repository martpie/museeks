import React from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';


class CustomScrollbar extends React.Component {
  static propTypes = {
    children: PropTypes.object,
    className: PropTypes.string,
    onScroll: PropTypes.func,
  }

  constructor(props) {
    super(props);
  }

  getRenderView(props) {
    return <div {...props} className='tracks-list-render-view' />;
  }

  getTrackVertical(props) {
    return <div {...props} className='track-vertical' />;
  }

  getThumbVertical(props) {
    return <div {...props} className='thumb-vertical' />;
  }

  render() {
    return (
      <Scrollbars
        className={this.props.className}
        onScroll={this.props.onScroll}
        renderView={this.getRenderView}
        renderTrackVertical={this.getTrackVertical}
        renderThumbVertical={this.getThumbVertical}
        autoHide
        autoHideTimeout={1000}
      >
        {this.props.children}
      </Scrollbars>
    );
  }
}

export default CustomScrollbar;
