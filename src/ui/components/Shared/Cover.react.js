import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import * as utils from '../../utils/utils';


/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

export default class TrackCover extends PureComponent {
  static propTypes = {
    path: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      coverPath: null,
    };

    this.fetchInitialCover = this.fetchInitialCover.bind(this);
  }

  componentDidMount() {
    this.fetchInitialCover();
  }

  async componentWillUpdate(nextProps) {
    if(nextProps.path !== this.props.path) {
      const coverPath = await utils.fetchCover(nextProps.path);
      this.setState({ coverPath });
    }
  }

  async fetchInitialCover() {
    const coverPath = await utils.fetchCover(this.props.path);
    this.setState({ coverPath });
  }

  render() {
    if(this.state.coverPath) {
      const coverPath = encodeURI(this.state.coverPath)
        .replace(/'/g, '\\\'')
        .replace(/"/g, '\\"');
      const styles = { backgroundImage: `url('${coverPath}')` };

      return <div className='cover' style={styles} />;
    }

    return(
      <div className='cover empty'>
        <div className='note'>♪</div>
      </div>
    );
  }
}
