import React, { Component } from 'react';
import { Col, Button, ButtonGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Icon from 'react-fontawesome';

import utils from '../../utils/utils';


/*
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
*/

export default class Footer extends Component {

    static propTypes = {
        tracks: React.PropTypes.array,
        refreshingLibrary: React.PropTypes.bool
    }

    constructor(props) {

        super(props);
    }

    render() {

        const tracks = this.props.tracks;
        const status = (tracks !== null) ? utils.getStatus(tracks) : 'An apple a day keeps Dr Dre away';

        const navButtons = (
            <ButtonGroup className='view-switcher'>
                <LinkContainer to='/library' disabled={ this.props.refreshingLibrary }>
                    <Button className='view-link'>
                        <Icon name='align-justify' fixedWidth />
                    </Button>
                </LinkContainer>
                <LinkContainer to='/playlists' disabled={ this.props.refreshingLibrary }>
                    <Button className='view-link'>
                        <Icon name='star' fixedWidth />
                    </Button>
                </LinkContainer>
                <LinkContainer to='/settings' disabled={ this.props.refreshingLibrary }>
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
