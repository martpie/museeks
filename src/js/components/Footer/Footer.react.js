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

        if (this.props.playerStatus == 'play') {
            var playButton = (
                <Button bsStyle='default' onClick={ this.pause }>
                    <i className={'fa fa-fw fa-pause'}></i>
                </Button>
            );
        } else if (this.props.playerStatus == 'pause') {
            var playButton = (
                <Button bsStyle='default' onClick={ this.play }>
                    <i className={'fa fa-fw fa-play'}></i>
                </Button>
            );
        }

        if (!this.props.refreshingLibrary) {
            var navButtons = (
                <ButtonGroup className={'view-switcher'}>
                    <Link to='/'         className={'view-link btn btn-default'}>
                        <Icon name='align-justify' />
                    </Link>
                    <Link to='/settings' className={'view-link btn btn-default'}>
                        <Icon name='gear'/>
                    </Link>
                </ButtonGroup>
            );
        } else {
            var navButtons = (
                <ButtonGroup>
                    <Link to='/' disabled className={'view-link btn btn-default'}>
                        <Icon name='align-justify' />
                    </Link>
                    <Link to='/settings' disabled className={'view-link btn btn-default'}>
                        <Icon name='gear' />
                    </Link>
                </ButtonGroup>
            );
        }

        return (
            <footer className={'row'}>
                <Col sm={3}>
                    { navButtons }
                </Col>
                <Col sm={5} className={'status text-center'}>
                    { this.props.status }
                </Col>
            </footer>
        );
    }
}
