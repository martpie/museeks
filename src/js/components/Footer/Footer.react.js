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

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        var tracks = this.props.tracks;
        var status = (tracks !== null) ? tracks.length + ' tracks, ' + utils.parseDuration(tracks.map(d => d.duration).reduce((a, b) => a + b)) : 'An apple a day keeps Dr Dre away';

        var navButtons = (
            <ButtonGroup className='view-switcher'>
                <LinkContainer to='/library' disabled={ this.props.refreshingLibrary }>
                    <Button className='view-link'>
                        <Icon name='align-justify' fixedWidth />
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
                <Col sm={3}>
                    { navButtons }
                </Col>
                <Col sm={5} className='status text-center'>
                    { status }
                </Col>
            </footer>
        );
    }
}
