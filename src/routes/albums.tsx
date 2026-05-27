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

export const Route = createFileRoute('/albums')({
  component: ViewAlbums,
  beforeLoad: async ({ location }) => {
    const albums = await DatabaseBridge.getAllAlbums();

    // Only redirect when landing on /albums with no child route selected
    if (location.pathname === '/albums') {
      const queueOrigin = player.getQueueOrigin();

      // If there is a playing album, redirect to it
      if (queueOrigin?.type === 'album' && albums.length > 0) {
        throw redirect({
          to: '/albums/$albumID',
          params: { albumID: queueOrigin.albumID },
        });
      }

      if (albums.length > 0) {
        throw redirect({
          to: '/albums/$albumID',
          params: { albumID: albums[0] },
        });
      }
    }

    return { albums };
  },
  loader: async ({ context }) => {
    return context;
  },
});

function ViewAlbums() {
  const { albums } = Route.useLoaderData();
  const { pathname } = useLocation();
  const { t } = useLingui();

  return (
    <View
      sideNav={
        <SideNav title={t`Albums`}>
          {albums.map((album) => (
            <SideNavLink
              key={album}
              id={album}
              label={album}
              linkOptions={{
                to: '/albums/$albumID',
                params: { albumID: album },
              }}
            />
          ))}
        </SideNav>
      }
    >
      {pathname !== '/albums' ? (
        <Outlet />
      ) : (
        <TrackListStates isLoading={false} tracks={[]} />
      )}
    </View>
  );
}
