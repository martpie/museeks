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
import { LibraryLayoutSettings, set_context_state } from "src/renderer/store/actions/LibraryActions";

interface OwnProps {
	enableSort: boolean;
	// this should be in the interface below, but it doesn't want to work there
	// FIXME?
	libraryLayoutSettings: LibraryLayoutSettings;
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

	// questionable?
	constructor(props: Props, state: LibraryLayoutSettings) {
		super(props, state);

		console.log(props);
	}

	showContextMenu(_e: React.MouseEvent, selected: string, title: string) {
		const template: electron.MenuItemConstructorOptions[] = [
			{
				label: `Selected: ${title}`,
				enabled: false,
			},
			{
				type: "checkbox",
				label: "Collapse Artist and Title",
				checked: this.props.libraryLayoutSettings.collapse_artist,
				click: () => {
					// I didn't know a better way to do this
					// FIXME
					set_context_state({
						visibility: this.props.libraryLayoutSettings.visibility,
						collapse_artist: !this.props.libraryLayoutSettings.collapse_artist,
					});
				},
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
					onContextMenu={(e) => this.showContextMenu(e, "title", "Title")}
					className={styles.cellSection}
					title="Title"
					sortBy={enableSort ? SortBy.TITLE : null}
					icon={TracksListHeader.getIcon(sort, SortBy.TITLE)}
				/>
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "duration", "Duration")}
					className={styles.cellDuration}
					title="Duration"
					sortBy={enableSort ? SortBy.DURATION : null}
					icon={TracksListHeader.getIcon(sort, SortBy.DURATION)}
				/>
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "album", "Album")}
					className={styles.cellAlbum}
					title="Album"
					sortBy={enableSort ? SortBy.ALBUM : null}
					icon={TracksListHeader.getIcon(sort, SortBy.ALBUM)}
				/>
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "added", "Added")}
					className={styles.cellAdded}
					title="Date Added"
					sortBy={enableSort ? SortBy.ADDED : null}
					icon={TracksListHeader.getIcon(sort, SortBy.ADDED)}
				/>
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "genre", "Genre")}
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
