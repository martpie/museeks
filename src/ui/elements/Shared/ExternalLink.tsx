import * as React from 'react';

import { shell } from 'electron';

/*
|--------------------------------------------------------------------------
| External Link
|--------------------------------------------------------------------------
*/

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
    console.log(this.props.href);
    shell.openExternal(this.props.href);
  }

  render () {
    return (
      <button
        className='external-link'
        role='link'
        onClick={this.openLink}
      >
        { this.props.children }
      </button>
    );
  }
}
