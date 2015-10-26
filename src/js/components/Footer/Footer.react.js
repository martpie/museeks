import React, { Component } from 'react';
import { Col, Button, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router';
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

        if (!this.props.refreshingLibrary) {
            var navButtons = (
                <ButtonGroup className='view-switcher'>
                    <Link to='/' className='view-link btn btn-default'>
                        <Icon name='align-justify' fixedWidth />
                    </Link>
                    <Link to='/settings' className='view-link btn btn-default'>
                        <Icon name='gear' fixedWidth />
                    </Link>
                </ButtonGroup>
            );
        } else {
            var navButtons = (
                <ButtonGroup>
                    <Link to='/' disabled className='view-link btn btn-default'>
                        <Icon name='align-justify' fixedWidth />
                    </Link>
                    <Link to='/settings' disabled className='view-link btn btn-default'>
                        <Icon name='gear' fixedWidth />
                    </Link>
                </ButtonGroup>
            );
        }

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
