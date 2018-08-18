import React, { Component, SyntheticEvent } from 'react';

import { openExternal } from '../../lib/electron';


/*
|--------------------------------------------------------------------------
| External Link
|--------------------------------------------------------------------------
*/

interface Props {
  href: string;
}


export default class ExternalLink extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.openLink = this.openLink.bind(this);
  }

  openLink(e: SyntheticEvent) {
    e.preventDefault();
    openExternal(this.props.href);
  }

  render() {
    return (
      <button
        className="external-link"
        role="link"
        onClick={this.openLink}
      >
        { this.props.children }
      </button>
    );
  }
}
