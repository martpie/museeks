import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Row, Col, ButtonGroup, ProgressBar } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import { connect } from 'react-redux';
import classnames from 'classnames';

import utils from '../../utils/utils';


/*
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
*/

class Footer extends Component {
  static propTypes = {
    tracks: PropTypes.array,
    library: PropTypes.object,
  }

  constructor(props) {
    super(props);
  }

  getStatus(props) {
    const { library } = props;
    const tracks = library.tracks[library.tracksCursor];

    const progressBarClasses = classnames('library-refresh-progress', {
      'hidden': !this.props.library.refreshing,
    });

    if (library.refreshing) {
      const progress = Math.round(library.refresh.processed / library.refresh.total * 100);

      return <ProgressBar className={progressBarClasses} now={progress} />;
    }

    return (tracks !== null) ? utils.getStatus(tracks) : 'An apple a day keeps Dr Dre away';
  }

  render() {
    return (
      <footer className='container-fluid'>
        <Row>
          <Col sm={3}>
            <ButtonGroup className='view-switcher'>
              <NavLink
                to='/library'
                activeClassName='active'
                className='btn btn-default view-link'
                title='Library'
              >
                <Icon name='align-justify' fixedWidth />
              </NavLink>
              <NavLink
                to='/playlists'
                activeClassName='active'
                className='btn btn-default view-link '
                title='Playlists'
              >
                <Icon name='star' fixedWidth />
              </NavLink>
              <NavLink
                to='/settings'
                activeClassName='active'
                className='btn btn-default view-link'
                title='Settings'
              >
                <Icon name='gear' fixedWidth />
              </NavLink>
            </ButtonGroup>
          </Col>
          <Col sm={5} className='status text-center'>
            {this.getStatus(this.props)}
          </Col>
        </Row>
      </footer>
    );
  }
}

const mapsStateToProps = (state) => {
  return {
    library: state.library,
  };
};

export default withRouter(connect(mapsStateToProps)(Footer));
