import React, { Component } from 'react';

import shell from 'electron';
import lib from '../../lib';


/*
|--------------------------------------------------------------------------
| External Link
|--------------------------------------------------------------------------
*/

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
        // TODO (y.solovyov | KeitIG): this should be somewhere else, not in the component
        lib.shell.openExternal(this.props.href);
    }
}

export default ExternalLink;
