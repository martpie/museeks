import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { openExternal } from '../../lib/electron';


/*
|--------------------------------------------------------------------------
| External Link
|--------------------------------------------------------------------------
*/

export default class ExternalLink extends Component {
  static propTypes = {
    href: PropTypes.string,
    children: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.openLink = this.openLink.bind(this);
  }

  openLink(e) {
    e.preventDefault();
    openExternal(this.props.href);
  }

  render() {
    return (
      <a href="" onClick={this.openLink}>
        { this.props.children }
      </a>
    );
  }
}
