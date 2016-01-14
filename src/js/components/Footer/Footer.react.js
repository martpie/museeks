import React, { Component } from 'react';
import { Col, Button, ButtonGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Icon from 'react-fontawesome';



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

        var navButtons = (
            <ButtonGroup>
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
                    { this.props.status }
                </Col>
            </footer>
        );
    }
}
