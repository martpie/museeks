import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import lib from '../../lib';

import PlaylistsNavLink from './PlaylistsNavLink.react';
import { remote } from 'electron';
const { Menu } = remote;

class PlaylistsNav extends Component {

    static propTypes = {
        playlists: React.PropTypes.array,
        remove: React.PropTypes.func,
        create: React.PropTypes.func,
        rename: React.PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.state = {
            renamed: null // the playlist being renamed if there's one
        };
    }

    render() {
        const self = this;
        // TODO (y.solovyov): extract into separate method that returns items
        const nav = this.props.playlists.map((elem, index) => {
            let navItemContent;

            if (elem._id === self.state.renamed) {
                navItemContent = (
                    <input
                        type='text'
                        ref='renamedPlaylist'
                        defaultValue={ elem.name }
                        onKeyDown={ self.keyDown }
                        onBlur={ self.blur }
                        autoFocus
                    />
                );
            } else {
                navItemContent = (
                    <PlaylistsNavLink
                        playlistId={ elem._id }
                        onContextMenu={ self.showContextMenu }
                    >
                        { elem.name }
                    </PlaylistsNavLink>
                );
            }

            return (
                <div className={ 'playlist-nav-item' } key={ index }>
                    { navItemContent }
                </div>
            );
        });

        return (
            <div className='playlists-nav'>
                <div className='playlists-nav-body'>
                    { nav }
                </div>
                <div className='playlists-nav-footer'>
                    <ButtonGroup className='playlists-management'>
                        <Button bsStyle='link' bsSize='xs' onClick={ this.createPlaylist }>
                            <Icon name='plus' />
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        );
    }

    componentDidUpdate = () => {
        // If a playlist is being update
        if (!!this.refs.renamedPlaylist && document.activeElement !== this.refs.renamedPlaylist) {
            this.refs.renamedPlaylist.select();
        }
    }

    showContextMenu = (_id) => {
        const renamePlaylist = () => {
            this.setState({ renamed: _id });
        };
        const deletePlaylist = () => {
            this.props.remove(_id);
        };
        const template = [
            {
                label: 'Delete',
                click: deletePlaylist
            },
            {
                label: 'Rename',
                click: renamePlaylist
            }
        ];
        const menu = Menu.buildFromTemplate(template);
        menu.popup(remote.getCurrentWindow());
    }

    createPlaylist = () => {
        this.props.create('New playlist', true);
    }

    rename = (_id, name) => {
        this.props.rename(_id, name);
    }

    keyDown = (e) => {
        switch (e.keyCode) {
            case 13: { // Enter
                this.rename(this.state.renamed, e.currentTarget.value);
                this.setState({ renamed: null });
                break;
            }
            case 27: { // Escape
                this.setState({ renamed: null });
                break;
            }
        }
    }

    blur = (e) => {
        this.rename(this.state.renamed, e.currentTarget.value);
        this.setState({ renamed: null });
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    remove: lib.actions.playlists.remove,
    create: lib.actions.playlists.create,
    rename: lib.actions.playlists.rename
};

export default connect(stateToProps, dispatchToProps)(PlaylistsNav);
