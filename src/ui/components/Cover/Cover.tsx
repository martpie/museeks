import * as React from 'react';

import * as coverUtils from '../../../shared/utils/cover';

import * as styles from './Cover.css';

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
      const coverPath = await coverUtils.fetchCover(nextProps.path);
      this.setState({ coverPath });
    }
  }

  async fetchInitialCover () {
    const coverPath = await coverUtils.fetchCover(this.props.path);
    this.setState({ coverPath });
  }

  render () {
    if (this.state.coverPath) {
      const coverPath = encodeURI(this.state.coverPath)
        .replace(/'/g, '\\\'')
        .replace(/"/g, '\\"');
      const inlineStyles = { backgroundImage: `url('${coverPath}')` };

      return <div className={styles.cover} style={inlineStyles} />;
    }

    return (
      <div className={`${styles.cover} -is-empty`}>
        <div className={styles.cover__note}>♪</div>
      </div>
    );
  }
}
