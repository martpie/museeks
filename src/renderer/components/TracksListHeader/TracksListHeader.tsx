import React, { useCallback } from "react";
import { connect } from "react-redux";

import TracksListHeaderCell from "../TracksListHeaderCell/TracksListHeaderCell";

import { PlayerStatus, SortBy, SortOrder } from "../../../shared/types/museeks";
import { RootState } from "../../store/reducers";
import { LibrarySort } from "../../store/reducers/library";

import { Menu } from "@electron/remote";
import styles from "./TracksListHeader.module.css";
import electron from "electron";
import { type } from "os";
import playlists from "src/renderer/store/reducers/playlists";

interface OwnProps {
	enableSort: boolean;
}

interface InjectedProps {
	sort?: LibrarySort;
}

type Props = OwnProps & InjectedProps;

class TracksListHeader extends React.Component<Props> {
	static getIcon = (sort: LibrarySort | undefined, sortType: SortBy) => {
		if (sort && sort.by === sortType) {
			if (sort.order === SortOrder.ASC) {
				return "angle-up";
			}

			// Must be DSC then
			return "angle-down";
		}

		return null;
	};

	showContextMenu(_e: React.MouseEvent, selected: string) {
		const template: electron.MenuItemConstructorOptions[] = [
			{
				label: selected,
			},
		];

		const context = Menu.buildFromTemplate(template);

		context.popup({}); // Let it appear
	}

	render() {
		const { enableSort, sort } = this.props;

		return (
			<div className={styles.tracksListHeader}>
				{" "}
				<TracksListHeaderCell className={styles.cellTrackPlaying} title="&nbsp;" />
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "title")}
					className={styles.cellSection}
					title="Title"
					sortBy={enableSort ? SortBy.TITLE : null}
					icon={TracksListHeader.getIcon(sort, SortBy.TITLE)}
				/>
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "duration")}
					className={styles.cellDuration}
					title="Duration"
					sortBy={enableSort ? SortBy.DURATION : null}
					icon={TracksListHeader.getIcon(sort, SortBy.DURATION)}
				/>
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "album")}
					className={styles.cellAlbum}
					title="Album"
					sortBy={enableSort ? SortBy.ALBUM : null}
					icon={TracksListHeader.getIcon(sort, SortBy.ALBUM)}
				/>
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "added")}
					className={styles.cellAdded}
					title="Date Added"
					sortBy={enableSort ? SortBy.ADDED : null}
					icon={TracksListHeader.getIcon(sort, SortBy.ADDED)}
				/>
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "genre")}
					className={styles.cellGenre}
					title="Genre"
					sortBy={enableSort ? SortBy.GENRE : null}
					icon={TracksListHeader.getIcon(sort, SortBy.GENRE)}
				/>
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
