import { useLingui } from '@lingui/react/macro';
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router';

import SideNav from '../components/SideNav';
import SideNavLink from '../components/SideNavLink';
import TrackListStates from '../components/TrackListStates';
import View from '../elements/View';
import DatabaseBridge from '../lib/bridge-database';
import player from '../lib/player';

export const Route = createFileRoute('/artists')({
  component: ViewArtists,
  beforeLoad: async ({ location }) => {
    const [artists, hasCompilations] = await Promise.all([
      DatabaseBridge.getAllArtists(),
      DatabaseBridge.hasCompilations(),
    ]);

    // Only redirect when landing on /artists with no child route selected
    if (location.pathname === '/artists') {
      const queueOrigin = player.getQueueOrigin();

      // If there is a playing artist, redirect to it
      if (queueOrigin?.type === 'artist' && artists.length > 0) {
        throw redirect({
          to: '/artists/$artistID',
          params: { artistID: queueOrigin.artistID },
        });
      }

      if (artists.length > 0) {
        throw redirect({
          to: '/artists/$artistID',
          params: { artistID: artists[0] },
        });
      }

      if (hasCompilations) {
        throw redirect({ to: '/artists/presets/compilations' });
      }
    }

    return { artists, hasCompilations };
  },
  loader: async ({ context }) => {
    return context;
  },
});

function ViewArtists() {
  const { artists, hasCompilations } = Route.useLoaderData();
  const { pathname } = useLocation();
  const { t } = useLingui();

  return (
    <View
      sideNav={
        <SideNav
          title={t`Artists`}
          bottomContent={
            hasCompilations && (
              <SideNavLink
                key="compilations"
                id="compilations"
                label={t`Compilations`}
                linkOptions={{ to: '/artists/presets/compilations' }}
              />
            )
          }
        >
          {artists.map((artist) => (
            <SideNavLink
              key={artist}
              id={artist}
              label={artist}
              linkOptions={{
                to: '/artists/$artistID',
                params: { artistID: artist },
              }}
            />
          ))}
        </SideNav>
      }
    >
      {pathname !== '/artists' ? (
        <Outlet />
      ) : (
        <TrackListStates isLoading={false} tracks={[]} />
      )}
    </View>
  );
}
