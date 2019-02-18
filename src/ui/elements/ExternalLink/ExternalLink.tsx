import * as React from 'react';
import { shell } from 'electron';

import * as styles from './ExternalLink.css';

interface Props {
  href: string;
}

export default class ExternalLink extends React.Component<Props> {
  constructor (props: Props) {
    super(props);

    this.openLink = this.openLink.bind(this);
  }

  openLink (e: React.SyntheticEvent) {
    e.preventDefault();
    shell.openExternal(this.props.href);
  }

  render () {
    return (
      <button
        className={styles.externalLink}
        role='link'
        onClick={this.openLink}
      >
        { this.props.children }
      </button>
    );
  }
}
