import PlaylistsActions from '../../actions/PlaylistsActions';

import React, { Component } from 'react';
import { ButtonGroup, Button, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';




/*
|--------------------------------------------------------------------------
| PlaylistsNav
|--------------------------------------------------------------------------
*/

export default class PlaylistsNav extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        var nav = this.props.playlists.map((elem, index) => {

            return (
                <LinkContainer to={ '/playlists/' + elem._id } key={ index }>
                    <NavItem className='playlist-link'>
                        { elem.name }
                    </NavItem>
                </LinkContainer>
            );
        });

        return (
            <div className='playlists-nav'>
                <div className='playlists-nav-header'>
                    <ButtonGroup>
                        <Button bsStyle='link' bsSize='xs' onClick={ this.createPlaylist }>
                            <Icon name='plus' />
                        </Button>
                    </ButtonGroup>
                </div>
                <div className='playlists-nav-body'>
                    <Nav stacked handleSelect={ () => {} }>
                        { nav }
                    </Nav>
                </div>
            </div>
        );
    }

    createPlaylist() {

        PlaylistsActions.create('Untitled');
    }

    deletePlaylist(_id) {
        PlaylistsActions.delete(_id);
    }
}
