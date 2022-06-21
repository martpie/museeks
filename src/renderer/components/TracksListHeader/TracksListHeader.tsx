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
	layout: LibraryLayoutSettings;
}

interface InjectedProps {
	sort?: LibrarySort;
}

type Props = OwnProps & InjectedProps;

const LAYOUT_LISTS = ["artist", "duration", "title", "added", "genre"];
const capitalize = (str: string) => {
	return str.toUpperCase()[0] + str.substring(1);
};

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

	showContextMenu(_e: React.MouseEvent, id: string) {
		const template: electron.MenuItemConstructorOptions[] = [
			{
				label: `Selected: ${capitalize(id)}`,
				enabled: false,
			},
		];

		LAYOUT_LISTS.forEach((tag) => {
			template.push({
				type: "checkbox",
				label: capitalize(tag),
				checked: this.props.layout.visibility.includes(tag),
				click: () => {
					// A very confusing toggle mechanism
					const visibility = this.props.layout.visibility;
					console.log(visibility);
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

		let sorts = [
			[
				layout.visibility.includes("title"),
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "title")}
					className={styles.cellTrack}
					title="Title"
					sortBy={enableSort ? SortBy.TITLE : null}
					icon={TracksListHeader.getIcon(sort, SortBy.TITLE)}
					layout={this.props.layout}
				/>,
			],
			[
				layout.visibility.includes("duration"),
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "duration")}
					className={styles.cellDuration}
					title="Duration"
					sortBy={enableSort ? SortBy.DURATION : null}
					icon={TracksListHeader.getIcon(sort, SortBy.DURATION)}
					layout={this.props.layout}
				/>,
			],
			[
				layout.visibility.includes("artist"),
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "artist")}
					className={styles.cellArtist}
					title="Artist"
					sortBy={enableSort ? SortBy.ARTIST : null}
					icon={TracksListHeader.getIcon(sort, SortBy.ARTIST)}
					layout={this.props.layout}
				/>,
			],
			[
				layout.visibility.includes("album"),
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "album")}
					className={styles.cellAlbum}
					title="Album"
					sortBy={enableSort ? SortBy.ALBUM : null}
					icon={TracksListHeader.getIcon(sort, SortBy.ALBUM)}
					layout={this.props.layout}
				/>,
			],
			[
				layout.visibility.includes("genre"),
				<TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "genre")}
					className={styles.cellGenre}
					title="Genre"
					sortBy={enableSort ? SortBy.GENRE : null}
					icon={TracksListHeader.getIcon(sort, SortBy.GENRE)}
					layout={this.props.layout}
				/>,
			],
		];

		return (
			<div className={styles.tracksListHeader}>
				{" "}
				<TracksListHeaderCell className={styles.cellTrackPlaying} title="&nbsp;" layout={this.props.layout} />
				{sorts.filter((value) => value[0] && value[1])}
				{/* <TracksListHeaderCell
					onContextMenu={(e) => this.showContextMenu(e, "added", "Added")}
					className={styles.cellAdded}
					title="Date Added"
					sortBy={enableSort ? SortBy.ADDED : null}
					icon={TracksListHeader.getIcon(sort, SortBy.ADDED)}
					layout={this.props.layout}
				/> */}
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
