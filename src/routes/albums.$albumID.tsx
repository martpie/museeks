import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import TrackList from '../components/TrackList';
import TrackListStates from '../components/TrackListStates';
import { useFilteredTrackGroup } from '../hooks/useFilteredTracks';
import useFocusedAlbum, {
    validateFocusedAlbumSearch,
} from '../hooks/useFocusedAlbum';
import useGlobalTrackListStatus from '../hooks/useGlobalTrackListStatus';
import DatabaseBridge from '../lib/bridge-database';
import { configQuery } from '../lib/queries';
import type { QueueOrigin } from '../types/museeks';

export const Route = createFileRoute('/albums/$albumID')({
    component: ViewAlbumDetails,
    loader: async ({ params }) => {
        const [albums, playlists] = await Promise.all([
            DatabaseBridge.getAlbumTracks(params.albumID),
            DatabaseBridge.getAllPlaylists(),
        ]);

        return { albums, playlists };
    },
    validateSearch: validateFocusedAlbumSearch,
});

export default function ViewAlbumDetails() {
    const { albums, playlists } = Route.useLoaderData();
    const config = useSuspenseQuery(configQuery).data;
    const { albumID } = Route.useParams();
    const content = useFilteredTrackGroup(albums);
    useGlobalTrackListStatus(content.flatMap(group => group.tracks));

    const queueOrigin = useMemo(() => {
        return { type: 'album', albumID } satisfies QueueOrigin;
    }, [albumID]);

    useFocusedAlbum(Route.useSearch().focused_album);

    const allArtistsAreSame = content.every(
        group => group.tracks.every(
            track => track.album_artist === content[0].tracks[0].album_artist
        )
    );

    return (
        <TrackListStates isLoading={false} tracks={content.flatMap(group => group.tracks)}>
            <TrackList
                layout="grouped"
                data={content}
                tracksDensity={config.track_view_density}
                playlists={playlists}
                queueOrigin={queueOrigin}
                showArtistLabel={true}
                showArtistInTitle={!allArtistsAreSame}
            />
        </TrackListStates>
    );
}
