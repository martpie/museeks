import { describe, expect, test } from 'bun:test';

import type { Track } from '../../generated/typings';
import { getStatus, stripAccents } from '../utils-library';

const TEST_TRACKS_ALBUM: Array<Track> = [
  {
    _id: '0_1',
    album: 'Album',
    artists: ['Artist'],
    track: {
      no: 2,
      of: 2,
    },
    disk: {
      no: null,
      of: null,
    },
    duration: 42,
    genres: ['pop', 'rock'],
    path: '/tmp/unknown.mp3',
    title: 'Song 1',
    year: 2000,
  },
  {
    _id: '0_2',
    album: 'Album',
    artists: ['Artist'],
    track: {
      no: 1,
      of: 2,
    },
    disk: {
      no: null,
      of: null,
    },
    duration: 60,
    genres: ['pop', 'rock'],
    path: '/tmp/unknown_2.mp3',
    title: 'Song 2',
    year: 2000,
  },
];

const TEST_TRACKS_PODCAST: Array<Track> = [
  {
    _id: '1_1',
    album: 'Another',
    artists: ['Another Artist'],
    track: {
      no: 1,
      of: 1,
    },
    disk: {
      no: null,
      of: null,
    },
    duration: 3600,
    genres: ['podcast'],
    path: '/tmp/unknown_2.mp3',
    title: 'Song 2',
    year: 2000,
  },
];

const TEST_TRACKS = [...TEST_TRACKS_ALBUM, ...TEST_TRACKS_PODCAST];

describe('getStatus', () => {
  test('should return the aggregation of # songs and total duration as a human-friendly string', () => {
    expect(getStatus(TEST_TRACKS)).toStrictEqual('3 tracks, 01:01:42');
    expect(getStatus(TEST_TRACKS_ALBUM)).toStrictEqual('2 tracks, 01:42');
    expect(getStatus(TEST_TRACKS_PODCAST)).toStrictEqual('1 track, 01:00:00');
  });
});

describe('stripAccents', () => {
  test('should remove all accentutated characters in a string by its non-accentuated version', () => {
    expect(
      stripAccents(
        'AbCdÀÁÂÃÄÅĄĀàáâãäåąāÒÓÔÕÕÖØòóôõöøÈÉÊËĘĒèéêëðęēÇĆČçćčÐÌÍÎÏĪìíîïīÙÚÛÜŪùúûüūÑŅñņŠŚšśŸÿýŽŹŻžźżŁĻłļŃŅńņàáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîüûñçýỳỹỵỷğışĞİŞĢģĶķ',
      ),
    ).toStrictEqual(
      'abcdaaaaaaaaaaaaaaaaoooooooooooooeeeeeeeeeeeeeccccccdiiiiiiiiiiuuuuuuuuuunnnnssssyyyzzzzzzllllnnnnaaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiuuncyyyyygisgisggkk',
    );
  });
});
