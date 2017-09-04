import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';


/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

export default class Settings extends Component {
    static propTypes = {
      config: PropTypes.object,
      library: PropTypes.object,
      children: PropTypes.object,
    }

    constructor(props) {
      super(props);
    }

    render() {
      const config = this.props.config;

      return (
        <div className='view view-settings'>
          <div className='settings-switcher'>
            <Nav bsStyle="pills" activeKey={ 1 } onSelect={ undefined }>
              <LinkContainer to='/settings/library'>
                <NavItem eventKey={ 1 }>Library</NavItem>
              </LinkContainer>
              <LinkContainer to='/settings/audio'>
                <NavItem eventKey={ 2 }>Audio</NavItem>
              </LinkContainer>
              <LinkContainer to='/settings/interface'>
                <NavItem eventKey={ 3 }>Interface</NavItem>
              </LinkContainer>
              <LinkContainer to='/settings/advanced'>
                <NavItem eventKey={ 4 }>Advanced</NavItem>
              </LinkContainer>
              <LinkContainer to='/settings/about'>
                <NavItem eventKey={ 5 }>About</NavItem>
              </LinkContainer>
            </Nav>
            <div className="tab-content">
              { React.cloneElement(
                this.props.children, {
                  config,
                  library: this.props.library,
                })
              }
            </div>
          </div>
        </div>
      );
    }
}
