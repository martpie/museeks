import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Placeholder from '../../../images/assets/placeholder.png';
import * as coverUtils from '../../../shared/lib/utils-cover';
import { Track } from '../../../shared/types/museeks';
import appStyles from '../../App.module.css';
import { Input, Label, Section } from '../../components/Setting/Setting';
import Button from '../../elements/Button/Button';
import { db } from '../../lib/app';
import { getLoweredMeta, parseDuration } from '../../lib/utils';
import * as LibraryActions from '../../store/actions/LibraryActions';
import styles from './Detail.module.css';

const Detail: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const [track, setTrack] = useState({} as Track);
  const [coverSrc, setCoverSrc] = useState('');
  const [data, setData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: '',
  });

  const getCover = useCallback(async (path) => {
    const data = await coverUtils.fetchCover(path);
    if (data !== null) {
      setCoverSrc(data);
    }
  }, []);

  const updateSong = useCallback(
    (data) => {
      const song = { ...track };
      song.title = data.title;
      song.artist.push(data.artist);
      song.album = data.album;
      song.genre[0] = data.genre;
      song.loweredMetas = getLoweredMeta(song);
      return song;
    },
    [track]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const song = updateSong(data);
      await LibraryActions.updateTrack(song);
      history.back();
    },
    [data, updateSong]
  );

  const handleChange = useCallback(
    (e) => {
      e.preventDefault();
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    },
    [data]
  );

  const handleCancel = useCallback((e) => {
    e.preventDefault();
    history.back();
  }, []);

  useEffect(() => {
    db.Track.findOne(
      { _id: trackId },
      (err: Error, song: Track) => {
        if (err !== null) return console.log(err);
        getCover(song.path);

        setTrack(song);
        setData({
          title: song.title || '',
          artist: song.artist[0] || '',
          album: song.album || '',
          genre: song.genre[0] || '',
          duration: parseDuration(song.duration) || '',
        });
      },
      []
    );

    return () => {
      setData({
        title: '',
        artist: '',
        album: '',
        genre: '',
        duration: '',
      });
    };
  }, [getCover, trackId]);

  return (
    <div className={`${appStyles.view} ${styles.viewDetail}`}>
      <form className={styles.detailForm} onSubmit={handleSubmit}>
        <Section>
          <Label htmlFor='title'>Title</Label>
          <Input id='title' name='title' type='text' onChange={handleChange} value={data.title} />
        </Section>
        <Section>
          <Label htmlFor='artist'>Artist</Label>
          <Input id='artist' name='artist' type='text' onChange={handleChange} value={data.artist} />
        </Section>
        <div className={styles.detailRow}>
          <div className={styles.detailCol}>
            <Section>
              <Label htmlFor='album'>Album</Label>
              <Input id='album' name='album' type='text' onChange={handleChange} value={data.album} />
            </Section>
            <Section>
              <Label htmlFor='genre'>Genre</Label>
              <Input id='genre' name='genre' type='text' onChange={handleChange} value={data.genre} />
            </Section>
            <Section>
              <Label htmlFor='duration'>Duration</Label>
              <Input id='duration' name='duration' type='text' readOnly value={data.duration} />
            </Section>
          </div>
          <div className={styles.detailCol}>
            <div className={styles.detailCover}>
              {coverSrc === undefined && <img src={Placeholder} alt='Cover' width='150' height='150' />}
              {coverSrc !== undefined && <img src={coverSrc} alt='Cover' width='150' height='150' />}
            </div>
          </div>
        </div>
        <div className={styles.detailActions}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type='submit'>Save</Button>
        </div>
      </form>
    </div>
  );
};

export default Detail;
