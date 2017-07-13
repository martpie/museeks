import React, { Component } from 'react';
import PropTypes from 'prop-types';

const shell = electron.shell;


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

    render() {
        return (
            <a href onClick={ this.openLink }>
                { this.props.children }
            </a>
        );
    }

    openLink(e) {
        e.preventDefault();
        // TODO (y.solovyov | KeitIG): this should be somewhere else, not in the component
        shell.openExternal(this.props.href);
    }
}
