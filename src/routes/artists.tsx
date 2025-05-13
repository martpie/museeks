import { Outlet, createFileRoute, useMatch } from '@tanstack/react-router';
import SideNav from '../components/SideNav';
import SideNavLink from '../components/SideNavLink';
import View from '../elements/View';
import * as ViewMessage from '../elements/ViewMessage';
import database from '../lib/database';

export const Route = createFileRoute('/artists')({
  component: ViewArtists,
  loader: async () => {
    const artists = await database.getAllArtists();
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
