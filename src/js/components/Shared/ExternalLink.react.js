import React, { Component } from 'react';

const shell = electron.shell;


/*
|--------------------------------------------------------------------------
| External Link
|--------------------------------------------------------------------------
*/

export default class ExternalLink extends Component {

    static propTypes = {
        href: React.PropTypes.string,
        children: React.PropTypes.string
    }

    constructor(props) {
        super(props);

        this.openLink = this.openLink.bind(this);
    }

    render() {
        return (
            <a href onClick={ this.openLink }>
                { this.props.children }
            </a>
        );
    }

    openLink(e) {
        e.preventDefault();
        shell.openExternal(this.props.href);
    }
}
