import React, { Component } from 'react';
import { Col, Button, ButtonGroup, ProgressBar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Icon from 'react-fontawesome';

import classnames from 'classnames';

import utils from '../../utils/utils';


/*
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
*/

export default class Footer extends Component {

    static propTypes = {
        tracks: React.PropTypes.array,
        library: React.PropTypes.object
    }

    constructor(props) {
        super(props);
    }

    render() {
        const tracks = this.props.tracks;
        let status = (tracks !== null) ? utils.getStatus(tracks) : 'An apple a day keeps Dr Dre away';

        const progressBarClasses = classnames('library-refresh-progress', {
            'hidden': !this.props.library.refreshing,
        });

        const library = this.props.library;

        if(library.refreshing) {
            const progress = Math.round(library.refresh.processed / library.refresh.total * 100);

            status = <ProgressBar className={ progressBarClasses } now={ progress } />;
        }

        const navButtons = (
            <ButtonGroup className='view-switcher'>
                <LinkContainer to='/library'>
                    <Button className='view-link'>
                        <Icon name='align-justify' fixedWidth />
                    </Button>
                </LinkContainer>
                <LinkContainer to='/playlists'>
                    <Button className='view-link'>
                        <Icon name='star' fixedWidth />
                    </Button>
                </LinkContainer>
                <LinkContainer to='/settings'>
                    <Button className='view-link'>
                        <Icon name='gear' fixedWidth />
                    </Button>
                </LinkContainer>
            </ButtonGroup>
        );

        return (
            <footer className='row'>
                <Col sm={ 3 }>
                    { navButtons }
                </Col>
                <Col sm={ 5 } className='status text-center'>
                    { status }
                </Col>
            </footer>
        );
    }
}
