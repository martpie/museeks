import * as React from 'react';

import * as utils from '../../utils/utils';

/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

interface Props {
  path: string;
}

interface State {
  coverPath: string | null;
}

export default class TrackCover extends React.PureComponent<Props, State> {

  constructor (props: Props) {
    super(props);

    this.state = {
      coverPath: null
    };

    this.fetchInitialCover = this.fetchInitialCover.bind(this);
  }

  async componentDidMount () {
    await this.fetchInitialCover();
  }

  async componentWillReceiveProps (nextProps: Props) {
    if (nextProps.path !== this.props.path) {
      const coverPath = await utils.fetchCover(nextProps.path);
      this.setState({ coverPath });
    }
  }

  async fetchInitialCover () {
    const coverPath = await utils.fetchCover(this.props.path);
    this.setState({ coverPath });
  }

  render () {
    if (this.state.coverPath) {
      const coverPath = encodeURI(this.state.coverPath)
        .replace(/'/g, '\\\'')
        .replace(/"/g, '\\"');
      const styles = { backgroundImage: `url('${coverPath}')` };

      return <div className='cover' style={styles} />;
    }

    return (
      <div className='cover empty'>
        <div className='note'>♪</div>
      </div>
    );
  }
}
