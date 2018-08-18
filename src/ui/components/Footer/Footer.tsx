import React, { Component } from 'react';
import { Route, Switch, withRouter, RouteComponentProps } from 'react-router';
import { NavLink } from 'react-router-dom';
import { Row, Col, ButtonGroup, ProgressBar } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import { connect } from 'react-redux';

import { getStatus } from '../../utils/utils-library';
import { RootState } from '../../reducers';
import { LibraryState } from '../../reducers/library';


/*
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
*/

interface InjectedProps {
  library: LibraryState,
}

type Props = InjectedProps & RouteComponentProps<{}>;


class Footer extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.getStatus = this.getStatus.bind(this);
  }

  getStatus() {
    const { library } = this.props;
    const { processed, total } = library.refresh;

    // If the library is being scanned, show the scan progress
    // const progressBarClasses = classnames('library-refresh-progress', {
    //   'hidden': !this.props.library.refreshing,
    // });

    if (library.refreshing) {
      const progress = total > 0 ? Math.round((processed / total) * 100) : 100;
      return (
        <div className="library-refresh">
          <ProgressBar className="library-refresh-progress" now={progress} active={total === 0} />
          {total > 0 && (
            <div className="library-refresh-count">
              {processed} / {total}
            </div>
          )}
        </div>
      );
    }

    // Else, return the amount of time for the library or the playlist depending
    // of the route
    return (
      <Switch>
        <Route
          path="/library"
          render={() => (
            getStatus(library.tracks.library)
          )}
        />
        <Route
          path="/playlists"
          render={() => (
            getStatus(library.tracks.playlist)
          )}
        />
      </Switch>
    );
  }

  render() {
    return (
      <footer className="container-fluid">
        <Row className="footer-row">
          <Col sm={3}>
            <ButtonGroup className="view-switcher">
              <NavLink
                to="/library"
                activeClassName="active"
                className="btn btn-default view-link"
                title="Library"
              >
                <Icon name="align-justify" fixedWidth />
              </NavLink>
              <NavLink
                to="/playlists"
                activeClassName="active"
                className="btn btn-default view-link "
                title="Playlists"
              >
                <Icon name="star" fixedWidth />
              </NavLink>
              <NavLink
                to="/settings"
                activeClassName="active"
                className="btn btn-default view-link"
                title="Settings"
              >
                <Icon name="gear" fixedWidth />
              </NavLink>
            </ButtonGroup>
          </Col>
          <Col sm={5} className="library-status text-center">
            {this.getStatus()}
          </Col>
        </Row>
      </footer>
    );
  }
}

const mapsStateToProps = (state: RootState): InjectedProps => ({
  library: state.library,
});

// TODO with router
export default withRouter(connect(mapsStateToProps)(Footer));
