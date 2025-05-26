import { createFileRoute, useRouter } from '@tanstack/react-router';
import type React from 'react';
import { useCallback, useState } from 'react';

import * as Setting from '../components/Setting';
import Button from '../elements/Button';
import Flexbox from '../elements/Flexbox';
import Separator from '../elements/Separator';
import View from '../elements/View';
import { parseDuration } from '../hooks/useFormattedDuration';
import useInvalidate from '../hooks/useInvalidate';
import database from '../lib/database';
import { useLibraryAPI } from '../stores/useLibraryStore';
import type { TrackMutation } from '../types/museeks';

import styles from './tracks.$trackID.module.css';

// We assume no artist or genre has a comma in its name (fingers crossed)
const DELIMITER = ',';

export const Route = createFileRoute('/tracks/$trackID')({
  component: ViewTrackDetails,
  loader: async ({ params }) => {
    const { trackID } = params;

    if (trackID == null) {
      throw new Error('Track ID should not be null');
    }

    const [track] = await database.getTracks([trackID]);

    if (track == null) {
      throw new Error('Track not found');
    }

    return { track };
  },
});

function ViewTrackDetails() {
  const { track } = Route.useLoaderData();
  const invalidate = useInvalidate();

  const [formData, setFormData] = useState<TrackMutation>({
    title: track.title ?? '',
    album: track.album ?? '',
    artists: track.artists,
    album_artist: track.album_artist ?? '',
    genres: track.genres,
    year: track.year,
    track_no: track.track_no ?? null,
    track_of: track.track_of ?? null,
    disk_no: track.disk_no ?? null,
    disk_of: track.disk_of ?? null,
  });

  const libraryAPI = useLibraryAPI();
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await libraryAPI.updateTrackMetadata(track.id, formData);
      invalidate();
      router.history.back();
    },
    [track, formData, router, libraryAPI, invalidate],
  );

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      router.history.back();
    },
    [router],
  );

  return (
    <View hasPadding layout="centered">
      <form className={styles.detailsForm} onSubmit={handleSubmit}>
        <h2>Edit &quot;{track.title}&quot;</h2>
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
            label="Album Artist"
            id="album_artist"
            name="album_artist"
            type="text"
            value={formData.album_artist}
            onChange={(e) => {
              setFormData({
                ...formData,
                album_artist: e.currentTarget.value,
              });
            }}
          />
        </Setting.Section>
        <Setting.Section>
          <Setting.Input
            label="Track Artists"
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
            label="Genre"
            id="genre"
            description="You can add multiple genres with commas"
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
          <Flexbox direction="horizontal" gap={16}>
            <Setting.Input
              label="Track Nº"
              id="track"
              name="track"
              type="number"
              min="0"
              step="1"
              value={formData.track_no ?? ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  track_no: parseNullableNumber(e.currentTarget.value),
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
              value={formData.track_of ?? ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  track_of: parseNullableNumber(e.currentTarget.value),
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
              value={formData.disk_no ?? ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  disk_no: parseNullableNumber(e.currentTarget.value),
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
              value={formData.disk_of ?? ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  disk_of: parseNullableNumber(e.currentTarget.value),
                });
              }}
            />
          </Flexbox>
        </Setting.Section>
        <Setting.Section>
          <Setting.Input
            label="Duration"
            id="duration"
            type="text"
            disabled
            value={parseDuration(track.duration)}
          />
        </Setting.Section>
        <Setting.Section>
          <Setting.Input
            label="Path"
            id="path"
            type="text"
            disabled
            value={track.path}
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
          Clicking &quot;save&quot; will only update the library data, but will
          not save it to the original file.
        </p>
      </form>
    </View>
  );
}

function parseNullableNumber(str: string): number | null {
  if (str === '' || str === '0') {
    return null;
  }

  return Number(str);
}
