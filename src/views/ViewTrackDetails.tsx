import type React from 'react';
import { useCallback, useState } from 'react';
import {
  type LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';

import * as Setting from '../components/Setting/Setting';
import Button from '../elements/Button/Button';
import type { Track } from '../generated/typings';
import database from '../lib/database';
import { useLibraryAPI } from '../stores/useLibraryStore';

import Separator from '../elements/Separator/Separator';
import useInvalidate from '../hooks/useInvalidate';
import appStyles from './Root.module.css';
import styles from './ViewTrackDetails.module.css';
import type { LoaderData } from './router';

// We assume no artist or genre has a comma in its name (fingers crossed)
const DELIMITER = ',';

export default function ViewTrackDetails() {
  const { track } = useLoaderData() as DetailsLoaderData;
  const invalidate = useInvalidate();

  const [formData, setFormData] = useState<
    Pick<Track, 'title' | 'artists' | 'album' | 'genres'>
  >({
    title: track.title ?? '',
    artists: track.artists,
    album: track.album ?? '',
    genres: track.genres,
  });

  const libraryAPI = useLibraryAPI();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await libraryAPI.updateTrackMetadata(track._id, formData);
      invalidate();
      navigate(-1);
    },
    [track, formData, navigate, libraryAPI, invalidate],
  );

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      navigate(-1);
    },
    [navigate],
  );

  return (
    <div className={`${appStyles.view} ${styles.viewDetails}`}>
      <form className={styles.detailsForm} onSubmit={handleSubmit}>
        <h2>Edit &quot;{formData.title}&quot;</h2>
        <Setting.Section>
          <Setting.Input
            label="Title"
            description="You can add multiple artists with commas"
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.currentTarget.value });
            }}
          />
        </Setting.Section>
        <Setting.Section>
          <Setting.Input
            label="Artist"
            id="artist"
            name="artist"
            type="text"
            value={formData.artists.join(DELIMITER)}
            onChange={(e) => {
              setFormData({
                ...formData,
                artists: e.currentTarget.value.split(DELIMITER),
              });
            }}
          />
        </Setting.Section>
        <Setting.Section>
          <Setting.Input
            label="Album"
            id="album"
            name="album"
            type="text"
            value={formData.album}
            onChange={(e) => {
              setFormData({ ...formData, album: e.currentTarget.value });
            }}
          />
        </Setting.Section>
        <Setting.Section>
          <Setting.Input
            label="Genre"
            id="genre"
            description="You can add multiple genre with commas"
            name="genre"
            type="text"
            value={formData.genres.join(DELIMITER)}
            onChange={(e) => {
              setFormData({
                ...formData,
                genres: e.currentTarget.value.split(DELIMITER),
              });
            }}
          />
        </Setting.Section>
        <div className={styles.detailsActions}>
          <Button type="button" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
        <Separator />
        <p>
          Clicking &quot;save&quot; will only update the library data, and will
          not save it to the original file.
        </p>
      </form>
    </div>
  );
}

export type DetailsLoaderData = LoaderData<typeof ViewTrackDetails.loader>;

ViewTrackDetails.loader = async ({ params }: LoaderFunctionArgs) => {
  const { trackID } = params;

  if (trackID == null) {
    throw new Error('Track ID should not be null');
  }

  const [track] = await database.getTracks([trackID]);

  if (track == null) {
    throw new Error('Track not found');
  }

  return { track };
};
