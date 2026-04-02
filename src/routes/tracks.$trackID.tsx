import { Trans, useLingui } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import type React from 'react';
import { useCallback, useState } from 'react';

import LibraryAPI from '../api/LibraryAPI';
import * as Setting from '../components/Setting';
import SettingCheckbox from '../components/SettingCheckbox';
import Button from '../elements/Button';
import Flexbox from '../elements/Flexbox';
import Separator from '../elements/Separator';
import View from '../elements/View';
import { parseDuration } from '../hooks/useFormattedDuration';
import useInvalidate from '../hooks/useInvalidate';
import DatabaseBridge from '../lib/bridge-database';
import type { TrackMutation } from '../types/museeks';

// We assume no artist or genre has a comma in its name (fingers crossed)
const DELIMITER = ',';

export const Route = createFileRoute('/tracks/$trackID')({
  component: ViewTrackDetails,
  loader: async ({ params }) => {
    const { trackID } = params;

    if (trackID == null) {
      throw new Error('Track ID should not be null');
    }

    const [track] = await DatabaseBridge.getTracks([trackID]);

    if (track == null) {
      throw new Error('Track not found');
    }

    return { track };
  },
});

function ViewTrackDetails() {
  const { track } = Route.useLoaderData();
  const invalidate = useInvalidate();
  const { t } = useLingui();

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
    is_compilation: track.is_compilation,
  });

  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await LibraryAPI.updateTrackMetadata(track.id, formData);
      await invalidate();
      router.history.back();
    },
    [track, formData, router, invalidate],
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
      <form onSubmit={handleSubmit} {...stylex.props(styles.detailsForm)}>
        <h2>
          <Trans>Edit "{track.title}"</Trans>
        </h2>
        <Setting.Section>
          <Setting.Input
            label={t`Title`}
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
            label={t`Album`}
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
            label={t`Album Artist`}
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
            label={t`Track Artists`}
            description={t`You can add multiple artists with commas`}
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
            label={t`Genre`}
            description={t`You can add multiple genres with commas`}
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
            label={t`Year`}
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
              label={t`Track Nº`}
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
              label={t`Of`}
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
              label={t`Disk Nº`}
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
              label={t`Of`}
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
          <SettingCheckbox
            title={t`Compilation`}
            description={t`Group this track with other tracks from the same compilation, regardless of the artist names.`}
            value={formData.is_compilation}
            onChange={(value) => {
              setFormData({ ...formData, is_compilation: value });
            }}
          />
        </Setting.Section>
        <Setting.Section>
          <Setting.Input
            label={t`Duration`}
            type="text"
            disabled
            value={parseDuration(track.duration)}
          />
        </Setting.Section>
        <Setting.Section>
          <Setting.Input
            label={t`Path`}
            type="text"
            disabled
            value={track.path}
          />
        </Setting.Section>
        <div {...stylex.props(styles.detailsActions)}>
          <Button type="button" onClick={handleCancel}>
            <Trans>Cancel</Trans>
          </Button>
          <Button type="submit">
            <Trans>Save</Trans>
          </Button>
        </div>
        <Separator />
        <p>
          <Trans>
            Clicking "save" will only update the library data, but will not save
            it to the original file.
          </Trans>
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

const styles = stylex.create({
  detailsForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailsActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginBottom: '16px',
  },
});
