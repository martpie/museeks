import React from 'react';

import * as ViewMessage from './elements/ViewMessage/ViewMessage';
import ExternalLink from './elements/ExternalLink/ExternalLink';

interface State {
  hasError: boolean;
}

class Root extends React.Component<unknown, State> {
  constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(err: Error) {
    // RIP
    console.error(`Museeks crashed: ${err}`);
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ViewMessage.Notice>
          <p>
            <span role='img' aria-label='boom'>
              💥
            </span>{' '}
            Something wrong happened
          </p>
          <ViewMessage.Sub>
            If it happens again, please{' '}
            <ExternalLink href='https://github.com/martpie/museeks/issues'>report an issue</ExternalLink>
          </ViewMessage.Sub>
        </ViewMessage.Notice>
      );
    }

    return this.props.children;
  }
}

export default Root;
