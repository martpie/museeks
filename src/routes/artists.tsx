import { Trans, useLingui } from '@lingui/react/macro';
import {
  createFileRoute,
  Outlet,
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
  beforeLoad: async ({ params }) => {
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
  loader: async ({ context }) => {
    return context;
  },
});

function ViewArtists() {
  const { artists } = Route.useLoaderData();
  const match = useMatch({ from: '/artists/$artistID', shouldThrow: false });
  const { t } = useLingui();

  return (
    <View
      sideNav={
        <SideNav title={t`Artists`}>
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
      {match ? (
        <Outlet />
      ) : (
        <ViewMessage.Notice>
          <p>
            <Trans>No artist selected</Trans>
          </p>
        </ViewMessage.Notice>
      )}
    </View>
  );
}
