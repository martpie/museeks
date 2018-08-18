import React from 'react';
import Scrollbars from 'react-custom-scrollbars';


interface Props {
  className: string,
  onScroll: React.UIEventHandler<any>,
}


class CustomScrollbar extends React.Component<Props> {
  static defaultProps = {
    className: '',
  }

  static getRenderView(props: any) {
    // the tabIndex={0} is needed to make the pageup/pagedown/home/end keys
    // work properly
    return (
      <div {...props} className="tracks-list-render-view" />
    );
  }

  static getTrackVertical(props: any) {
    return <div {...props} className="track-vertical" />;
  }

  static getThumbVertical(props: any) {
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
