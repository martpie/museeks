import * as React from 'react';
import { Route, Switch, withRouter, RouteComponentProps } from 'react-router';
import { NavLink } from 'react-router-dom';
import * as Icon from 'react-fontawesome';
import { connect } from 'react-redux';

import { getStatus } from '../../utils/utils-library';
import { RootState } from '../../reducers';
import { LibraryState } from '../../reducers/library';

import * as styles from './Footer.css';
import ProgressBar from '../ProgressBar/ProgressBar';

interface InjectedProps {
  library: LibraryState;
}

type Props = InjectedProps & RouteComponentProps<{}>;

class Footer extends React.Component<Props> {
  constructor (props: Props) {
    super(props);
    this.getStatus = this.getStatus.bind(this);
  }

  getStatus () {
    const { library } = this.props;
    const { processed, total } = library.refresh;

    if (library.refreshing) {
      const progress = total > 0 ? Math.round((processed / total) * 100) : 100;
      return (
        <div className={styles.footer__libraryRefresh}>
          <div className={styles.footer__libraryRefresh__progress}>
            <ProgressBar progress={progress} animated={total === 0} />
          </div>
          {total > 0 && (
            <div className={styles.footer__libraryRefresh__count}>
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
          path='/library'
          render={() => (
            getStatus(library.tracks.library)
          )}
        />
        <Route
          path='/playlists'
          render={() => (
            getStatus(library.tracks.playlist)
          )}
        />
      </Switch>
    );
  }

  render () {
    return (
      <footer className={styles.footer}>
        <div className={styles.footer__navigation}>
          <div className={styles.footer__navigation__linkgroup}>
            <NavLink
              to='/library'
              activeClassName={styles.footer__navigation__linkIsActive}
              className={styles.footer__navigation__link}
              title='Library'
              draggable={false}
            >
              <Icon name='align-justify' fixedWidth />
            </NavLink>
            <NavLink
              to='/playlists'
              activeClassName={styles.footer__navigation__linkIsActive}
              className={styles.footer__navigation__link}
              title='Playlists'
              draggable={false}
            >
              <Icon name='star' fixedWidth />
            </NavLink>
            <NavLink
              to='/settings'
              activeClassName={styles.footer__navigation__linkIsActive}
              className={styles.footer__navigation__link}
              title='Settings'
              draggable={false}
            >
              <Icon name='gear' fixedWidth />
            </NavLink>
          </div>
        </div>
        <div className={styles.footer__status}>
          {this.getStatus()}
        </div>
      </footer>
    );
  }
}

const mapsStateToProps = (state: RootState): InjectedProps => ({
  library: state.library
});

// TODO with router
export default withRouter(connect(mapsStateToProps)(Footer));
