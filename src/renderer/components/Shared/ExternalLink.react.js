import React, { Component } from 'react';
import lib from '../../lib';

class ExternalLink extends Component {

    static propTypes = {
        href: React.PropTypes.string,
        children: React.PropTypes.string
    }

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <a href onClick={ this.openLink }>
                { this.props.children }
            </a>
        );
    }

    openLink = (e) => {
        e.preventDefault();
        lib.shell.openExternal(this.props.href);
    }
}

export default ExternalLink;
