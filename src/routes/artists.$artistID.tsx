import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/artists/$artistID')({
  component: ViewArtistDetails,
  loader: async () => {
    return {};
  },
});

export default function ViewArtistDetails() {
  const params = Route.useParams();
  return <div>{params.artistID}</div>;
}
