import {
  Outlet,
  createFileRoute,
  redirect,
  useMatch,
} from '@tanstack/react-router';
import SideNav from '../components/SideNav';
import SideNavLink from '../components/SideNavLink';
import View from '../elements/View';
import * as ViewMessage from '../elements/ViewMessage';
import database from '../lib/database';
import usePlayerStore from '../stores/usePlayerStore';

export const Route = createFileRoute('/artists')({
  component: ViewArtists,
  loader: async ({ params }) => {
    const artists = await database.getAllArtists();
    const queueOrigin = usePlayerStore.getState().queueOrigin;

    if (!('artistID' in params) && artists.length > 0) {
      // If there is a playing Playlist, redirect to it
      if (queueOrigin?.type === 'artist') {
        throw redirect({
          to: '/artists/$artistID',
          params: { artistID: queueOrigin.artistID },
        });
      }

      throw redirect({
        to: '/artists/$artistID',
        params: { artistID: artists[0] },
      });
    }

    return { artists };
  },
});

function ViewArtists() {
  const { artists } = Route.useLoaderData();
  const match = useMatch({ from: '/artists/$artistID', shouldThrow: false });

  return (
    <View
      sideNav={
        <SideNav title="Artists">
          {artists.map((artist) => (
            <SideNavLink
              key={artist}
              id={artist}
              label={artist}
              href={`/artists/${artist}`}
            />
          ))}
        </SideNav>
      }
    >
      {match ? (
        <Outlet />
      ) : (
        <ViewMessage.Notice>
          <p>No artist selected</p>
        </ViewMessage.Notice>
      )}
    </View>
  );
}
