export const getTracks = (req, res) => {
  req.send({
    type: 'find-track',
    name: req.query.name
  }));
  res.send('done')
}

export const getPlaylists = (req, res) => {
  req.send({
    type: 'find-playlists',
    name: req.query.name
  }));
  res.send('done')
}
