ALTER TABLE tracks ADD COLUMN album_artist_sort TEXT NOT NULL DEFAULT '';

UPDATE tracks SET album_artist_sort = album_artist;
