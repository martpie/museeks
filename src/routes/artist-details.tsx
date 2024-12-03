import { type LoaderFunctionArgs, useParams } from 'react-router-dom';
import type { LoaderData } from '../types/museeks';

export default function ViewArtistDetails() {
  // const { /** */ } = useLoaderData() as ArtistDetailsLoaderData;
  const params = useParams();
  return <div>{params.artist}</div>;
}

export type ArtistDetailsLoaderData = LoaderData<
  typeof ViewArtistDetails.loader
>;

ViewArtistDetails.loader = async ({ params }: LoaderFunctionArgs) => {
  if (typeof params.artist !== 'string') {
    throw new Error('Invalid artist');
  }

  return {};
};
