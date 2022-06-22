import React from 'react';
import { Menu } from '@electron/remote';
import { connect } from 'react-redux';
import electron from 'electron';

import { LibraryLayoutSettings, set_context_state } from '../../store/actions/LibraryActions';
import TracksListHeaderCell from '../TracksListHeaderCell/TracksListHeaderCell';

import { SortBy, SortOrder } from '../../../shared/types/museeks';
import { RootState } from '../../store/reducers';
import { LibrarySort } from '../../store/reducers/library';
import styles from './TracksListHeader.module.css';

interface OwnProps {
  enableSort: boolean;
  layout: LibraryLayoutSettings;
}

interface InjectedProps {
  sort?: LibrarySort;
}

type Props = OwnProps & InjectedProps;

const LAYOUT_LISTS = ['title', 'duration', 'album', 'artist', 'genre'];
const capitalize = (str: string) => {
  return str.toUpperCase()[0] + str.substring(1);
};

class TracksListHeader extends React.Component<Props> {
  static getIcon = (sort: LibrarySort | undefined, sortType: SortBy) => {
    if (sort && sort.by === sortType) {
      if (sort.order === SortOrder.ASC) {
        return 'angle-up';
      }

      // Must be DSC then
      return 'angle-down';
    }

    return null;
  };

  // questionable?
  constructor(props: Props, state: LibraryLayoutSettings) {
    super(props, state);
  }

  showContextMenu(_e: React.MouseEvent, id: string) {
    const template: electron.MenuItemConstructorOptions[] = [
      {
        label: `Selected: ${capitalize(id)}`,
        enabled: false,
      },
    ];

    LAYOUT_LISTS.forEach((tag) => {
      template.push({
        type: 'checkbox',
        label: capitalize(tag),
        checked: this.props.layout.visibility.includes(tag),
        click: () => {
          // toggles the existence of props.layout.visibility[tag]
          const visibility = this.props.layout.visibility;
          if (visibility.includes(tag)) {
            set_context_state({
              visibility: visibility.filter((value) => value !== tag),
            });
          } else {
            set_context_state({
              visibility: [...visibility, tag],
            });
          }
        },
      });
    });

    const context = Menu.buildFromTemplate(template);

    context.popup({}); // Let it appear
  }

  render() {
    const { enableSort, sort, layout } = this.props;

    const sorts: [boolean, React.ReactElement][] = [
      [
        layout.visibility.includes('title'),
        <TracksListHeaderCell
          onContextMenu={(e) => this.showContextMenu(e, 'title')}
          className={styles.cellTrack}
          title='Title'
          sortBy={enableSort ? SortBy.TITLE : null}
          icon={TracksListHeader.getIcon(sort, SortBy.TITLE)}
          layout={this.props.layout}
          key='Title'
        />,
      ],
      [
        layout.visibility.includes('duration'),
        <TracksListHeaderCell
          onContextMenu={(e) => this.showContextMenu(e, 'duration')}
          className={styles.cellDuration}
          title='Duration'
          sortBy={enableSort ? SortBy.DURATION : null}
          icon={TracksListHeader.getIcon(sort, SortBy.DURATION)}
          layout={this.props.layout}
          key='Duration'
        />,
      ],
      [
        layout.visibility.includes('artist'),
        <TracksListHeaderCell
          onContextMenu={(e) => this.showContextMenu(e, 'artist')}
          className={styles.cellArtist}
          title='Artist'
          sortBy={enableSort ? SortBy.ARTIST : null}
          icon={TracksListHeader.getIcon(sort, SortBy.ARTIST)}
          layout={this.props.layout}
          key='Artist'
        />,
      ],
      [
        layout.visibility.includes('album'),
        <TracksListHeaderCell
          onContextMenu={(e) => this.showContextMenu(e, 'album')}
          className={styles.cellAlbum}
          title='Album'
          sortBy={enableSort ? SortBy.ALBUM : null}
          icon={TracksListHeader.getIcon(sort, SortBy.ALBUM)}
          layout={this.props.layout}
          key='Album'
        />,
      ],
      [
        layout.visibility.includes('genre'),
        <TracksListHeaderCell
          onContextMenu={(e) => this.showContextMenu(e, 'genre')}
          className={styles.cellGenre}
          title='Genre'
          sortBy={enableSort ? SortBy.GENRE : null}
          icon={TracksListHeader.getIcon(sort, SortBy.GENRE)}
          layout={this.props.layout}
          key='Genre'
        />,
      ],
    ];

    const headers: React.ReactElement[] = [];
    sorts.forEach((element) => {
      if (element[0]) headers.push(element[1]);
    });

    return (
      <div
        className={styles.tracksListHeader}
        onContextMenu={headers.length === 0 ? (e) => this.showContextMenu(e, 'background') : undefined}
      >
        {' '}
        <TracksListHeaderCell className={styles.cellTrackPlaying} title='&nbsp;' layout={this.props.layout} />
        {...headers}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): InjectedProps => {
  if (ownProps.enableSort) {
    return {
      sort: state.library.sort,
    };
  }

  return {};
};

export default connect(mapStateToProps)(TracksListHeader);
