import { useLoaderData, useOutlet } from 'react-router-dom';

import SideNav from '../components/SideNav';
import SideNavLink from '../components/SideNavLink';
import View from '../elements/View';
import * as ViewMessage from '../elements/ViewMessage';
import database from '../lib/database';
import type { LoaderData } from '../types/museeks';

export default function ViewArtists() {
  const { artists } = useLoaderData() as ArtistsLoaderData;
  const outlet = useOutlet();

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
      {outlet ?? (
        <ViewMessage.Notice>
          <p>No artist selected</p>
        </ViewMessage.Notice>
      )}
    </View>
  );
}

export type ArtistsLoaderData = LoaderData<typeof ViewArtists.loader>;

ViewArtists.loader = async () => {
  const artists = await database.getAllArtists();

  return { artists };
};
