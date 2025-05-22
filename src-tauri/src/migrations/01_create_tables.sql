-- Tracks Table + Indices
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY NOT NULL,
  path TEXT NOT NULL UNIQUE, -- Path as a string and unique
  title TEXT NOT NULL,
  album TEXT NOT NULL,
  artists JSON NOT NULL, -- Array of strings
  genres JSON NOT NULL, -- Array of strings
  year INTEGER,
  duration INTEGER NOT NULL,
  track_no INTEGER,
  track_of INTEGER,
  disk_no INTEGER,
  disk_of INTEGER
);

CREATE INDEX IF NOT EXISTS index_track_path ON tracks (path);

-- Playlists Table
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  tracks JSON NOT NULL DEFAULT '[]', -- Array of track IDs
  import_path TEXT UNIQUE -- Path of the playlist file, unique if it exists
);
