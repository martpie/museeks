import type React from 'react';
import { useCallback, useState } from 'react';
import {
  type LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';

import * as Setting from '../components/Setting';
import Button from '../elements/Button';
import Flexbox from '../elements/Flexbox';
import Separator from '../elements/Separator';
import View from '../elements/View';
import type { Track } from '../generated/typings';
import { parseDuration } from '../hooks/useFormattedDuration';
import useInvalidate from '../hooks/useInvalidate';
import database from '../lib/database';
import { useLibraryAPI } from '../stores/useLibraryStore';
import type { LoaderData } from '../types/museeks';
import styles from './ViewTrackDetails.module.css';

// We assume no artist or genre has a comma in its name (fingers crossed)
const DELIMITER = ',';

export default function ViewTrackDetails() {
  const { track } = useLoaderData() as DetailsLoaderData;
  const invalidate = useInvalidate();

  const [formData, setFormData] = useState<
    Pick<
      Track,
      | 'title'
      | 'artists'
      | 'album'
      | 'genres'
      | 'year'
      | 'duration'
      | 'track_no'
      | 'track_of'
      | 'disk_no'
      | 'disk_of'
      | 'path'
    >
  >({
    title: track.title ?? '',
    artists: track.artists,
    album: track.album ?? '',
    genres: track.genres,
    year: track.year,
    duration: track.duration,
    track_no: track.track_no ?? null,
    track_of: track.track_of ?? null,
    disk_no: track.disk_no ?? null,
    disk_of: track.disk_of ?? null,
    path: track.path,
  });

  const libraryAPI = useLibraryAPI();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await libraryAPI.updateTrackMetadata(track.id, formData);
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
    <View hasPadding layout="centered">
      <form className={styles.detailsForm} onSubmit={handleSubmit}>
        <h2>Edit &quot;{formData.title}&quot;</h2>
        <Setting.Section>
          <Setting.Input
            label="Title"
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
            description="You can add multiple artists with commas"
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
        <Setting.Section>
          <Setting.Input
            label="Year"
            id="year"
            name="year"
            type="number"
            min="0"
            step="1"
            value={Number(formData.year)}
            onChange={(e) => {
              setFormData({ ...formData, year: Number(e.currentTarget.value) });
            }}
          />
        </Setting.Section>
        <Setting.Section>
          <Setting.Input
            label="Duration"
            id="duration"
            name="duration"
            type="text"
            pattern="([01]?[0-9]{1}|2[0-3]{1}):[0-5]{1}[0-9]{1}"
            disabled={true}
            value={parseDuration(formData.duration)}
            onChange={(e) => {
              setFormData({
                ...formData,
                duration: Number(e.currentTarget.value),
              });
            }}
          />
        </Setting.Section>
        <Setting.Section>
          <Flexbox direction="horizontal" gap={16}>
            <Setting.Input
              label="Track Nº"
              id="track"
              name="track"
              type="number"
              min="0"
              step="1"
              value={Number(formData.track_no)}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  track_no: Number(e.currentTarget.value),
                });
              }}
            />
            <Setting.Input
              label="Of"
              id="trackOf"
              name="trackOf"
              type="number"
              min="0"
              step="1"
              value={Number(formData.track_of)}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  track_of: Number(e.currentTarget.value),
                });
              }}
            />
          </Flexbox>
        </Setting.Section>
        <Setting.Section>
          <Flexbox direction="horizontal" gap={16}>
            <Setting.Input
              label="Disk Nº"
              id="disk"
              name="disk"
              type="number"
              min="0"
              step="1"
              value={Number(formData.disk_no)}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  disk_no: Number(e.currentTarget.value),
                });
              }}
            />
            <Setting.Input
              label="Of"
              id="diskOf"
              name="diskOf"
              type="number"
              min="0"
              step="1"
              value={Number(formData.disk_of)}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  disk_of: Number(e.currentTarget.value),
                });
              }}
            />
          </Flexbox>
        </Setting.Section>
        <Setting.Section>
          <Setting.Input
            label="Path"
            id="path"
            name="path"
            type="text"
            value={formData.path}
            readOnly={true}
            onChange={(e) => {
              setFormData({ ...formData, path: e.currentTarget.value });
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
    </View>
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
