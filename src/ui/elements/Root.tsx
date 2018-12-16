import * as React from 'react';

import FullViewMessage from './Shared/FullViewMessage';
import ExternalLink from './Shared/ExternalLink';

interface State {
  hasError: boolean;
}

class Root extends React.Component<{}, State> {
  constructor (props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch () {
    // RIP
    this.setState({ hasError: true });
  }

  render () {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <FullViewMessage>
          <p>💥 Something wrong happened</p>
          <p className='sub-message'></p>
          <p className='sub-message'>If it happens again, please <ExternalLink href='https://github.com/KeitIG/museeks/issues'>report an issue</ExternalLink></p>
        </FullViewMessage>
      );
    }

    return this.props.children;
  }
}

export default Root;
