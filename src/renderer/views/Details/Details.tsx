import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';

import Placeholder from '../../../images/assets/placeholder.png';
import * as coverUtils from '../../../shared/lib/utils-cover';
import { EditableTrackFields, TrackModel } from '../../../shared/types/museeks';
import appStyles from '../../App.module.css';
import { Input, Label, Section } from '../../components/Setting/Setting';
import Button from '../../elements/Button/Button';
import { db } from '../../lib/app';
// import * as LibraryActions from '../../store/actions/LibraryActions';

import styles from './Details.module.css';

// We assume no artist or genre has a comma in its name (fingers crossed)
const DELIMITER = ', ';

const Details: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditableTrackFields>({
    title: '',
    artist: [],
    album: '',
    genre: [],
  });

  const navigate = useNavigate();

  // const updateSong = useCallback(
  //   (data) => {
  //     const song = { ...track };
  //     song.title = data.title;
  //     song.artist.push(data.artist);
  //     song.album = data.album;
  //     song.genre[0] = data.genre;
  //     song.loweredMetas = getLoweredMeta(song);
  //     return song;
  //   },
  //   [track]
  // );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      // const song = updateSong(data);
      // nope
      // await LibraryActions.updateTrack(song);
      navigate(-1);
    },
    [/* data, updateSong, */ navigate]
  );

  const handleChange = useCallback(
    (e) => {
      e.preventDefault();
      // setFormData({
      //   ...formData,
      //   [e.target.name]: e.target.value,
      // });
    },
    [formData]
  );

  const handleCancel = useCallback(
    (e) => {
      e.preventDefault();
      navigate(-1);
    },
    [navigate]
  );

  useEffect(() => {
    db.Track.findOne(
      { _id: trackId },
      async (err: Error, track: TrackModel) => {
        if (err !== null) return console.error(err);

        setFormData({
          title: track.title ?? '',
          artist: track.artist,
          album: track.album ?? '',
          genre: track.genre,
        });

        coverUtils.fetchCover(track.path).then((cover) => setCoverSrc(cover));
      },
      []
    );

    return () => {
      setFormData({
        title: '',
        artist: [],
        album: '',
        genre: [],
      });
    };
  }, [trackId]);

  return (
    <div className={`${appStyles.view} ${styles.viewDetails}`}>
      <form className={styles.detailForm} onSubmit={handleSubmit}>
        <Section>
          <Label htmlFor='title'>Title</Label>
          <Input id='title' name='title' type='text' onChange={handleChange} value={formData.title} />
        </Section>
        <Section>
          <Label htmlFor='artist'>Artist</Label>
          <Input
            id='artist'
            name='artist'
            type='text'
            onChange={handleChange}
            value={formData.artist.join(DELIMITER)}
          />
        </Section>
        <Section>
          <Label htmlFor='album'>Album</Label>
          <Input id='album' name='album' type='text' onChange={handleChange} value={formData.album} />
        </Section>
        <Section>
          <Label htmlFor='genre'>Genre</Label>
          <Input id='genre' name='genre' type='text' onChange={handleChange} value={formData.genre.join(DELIMITER)} />
        </Section>
        <div className={styles.detailCover}>
          {coverSrc === null && <img src={Placeholder} alt='Cover' width='150' height='150' />}
          {coverSrc !== null && <img src={coverSrc} alt='Cover' width='150' height='150' />}
        </div>
        <div className={styles.detailActions}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type='submit'>Save</Button>
          <Button type='submit'>Save and persist</Button>
        </div>
        <p>
          Clicking "save" will only change the library data, but clicking "save and persist" will save the new track
          information to the file on disk.
        </p>
      </form>
    </div>
  );
};

export default Details;
