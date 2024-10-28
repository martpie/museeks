import { describe, expect, test } from 'bun:test';

import type { Track } from '../../generated/typings';
import {
  getStatus,
  removeRedundantFolders,
  stripAccents,
} from '../utils-library';

const TEST_TRACKS_ALBUM: Array<Track> = [
  {
    _id: '0_1',
    path: '/tmp/unknown.mp3',
    album: 'Album',
    artists: ['Artist'],
    track_no: 2,
    track_of: 2,
    disk_no: null,
    disk_of: null,
    duration: 42,
    genres: ['pop', 'rock'],
    title: 'Song 1',
    year: 2000,
  },
  {
    _id: '0_2',
    path: '/tmp/unknown_2.mp3',
    album: 'Album',
    artists: ['Artist'],
    track_no: 1,
    track_of: 2,
    disk_no: null,
    disk_of: null,
    duration: 60,
    genres: ['pop', 'rock'],
    title: 'Song 2',
    year: 2000,
  },
];

const TEST_TRACKS_PODCAST: Array<Track> = [
  {
    _id: '1_1',
    path: '/tmp/unknown_2.mp3',
    album: 'Another',
    artists: ['Another Artist'],
    track_no: 1,
    track_of: 1,
    disk_no: null,
    disk_of: null,
    duration: 3600,
    genres: ['podcast'],
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

describe('removeRedundantFolders', () => {
  test('should return the same array if there are no duplicates or subpaths', () => {
    expect(
      removeRedundantFolders(['/users/me/music', '/users/me/videos']),
    ).toStrictEqual(['/users/me/music', '/users/me/videos']);
  });

  test('should remove duplicate entries', () => {
    expect(
      removeRedundantFolders([
        '/users/me/music',
        '/users/me/videos',
        '/users/me/music',
      ]),
    ).toStrictEqual(['/users/me/music', '/users/me/videos']);
  });

  test('should remove subpaths', () => {
    expect(
      removeRedundantFolders([
        '/tmp/data/music',
        '/users/me/music',
        '/users/me/music/archive',
        '/tmp/data',
      ]),
    ).toStrictEqual(['/users/me/music', '/tmp/data']);
  });
});
