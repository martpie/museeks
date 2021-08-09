import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Section, Label, Input } from '../../components/Setting/Setting';
import Button from '../../elements/Button/Button';
import { RootState } from '../../store/reducers';
import appStyles from '../../App.module.css';
import * as LibraryActions from '../../store/actions/LibraryActions';
import * as coverUtils from '../../../shared/lib/utils-cover';
import Placeholder from '../../../images/assets/placeholder.png';
import { getLoweredMeta, parseDuration } from '../../lib/utils';

import styles from './Detail.module.css';

const Detail: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const tracks = useSelector((state: RootState) => state.library.tracks.library);
  const [track, setTrack] = useState(undefined);
  const [coverSrc, setCoverSrc] = useState(undefined);
  const [data, setData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: '',
  });

  const getCover = async (path: string) => {
    const data = await coverUtils.fetchCover(path);
    if (data !== null) {
      setCoverSrc(data);
    }
  };

  const updateSong = (data) => {
    const song = { ...track };
    song.title = data.title;
    song.artist[0] = data.artist;
    song.album = data.album;
    song.genre[0] = data.genre;
    song.loweredMetas = getLoweredMeta(song);
    return song;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const song = updateSong(data);
    await LibraryActions.updateTrack(song);
    // dispatch(LibraryActions.refresh());
    history.back();
  };

  const handleChange = (e) => {
    e.preventDefault();
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = (e) => {
    e.preventDefault();
    history.back();
  };

  useEffect(() => {
    const song = tracks.find((tr) => tr._id === trackId);
    getCover(song.path);

    setTrack(song);
    setData({
      title: song.title || '',
      artist: song.artist[0] || '',
      album: song.album || '',
      genre: song.genre[0] || '',
      duration: parseDuration(song.duration) || '',
    });
    return () => {
      setData({
        title: '',
        artist: '',
        album: '',
        genre: '',
        duration: '',
      });
    };
  }, [trackId, tracks]);

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
