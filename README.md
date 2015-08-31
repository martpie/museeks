# museeks
A music player, in active development. The code is still a bit messy, I'm working on it.

![Screenshot](screenshot.png)

It uses:
* [io.js](http://iojs.org/) for back-end
* [electron (used to be atom-shell)](https://github.com/atom/atom-shell/) for embedded browser
* [react.js](https://facebook.github.io/react/) as front-end framework

===

### Installation

Please consider **this app is under development, just install it for fun**, I'm aware of multiple bugs and designs issues.

- Download [Electron](https://github.com/atom/electron/releases)
- Download Museeks source code
- Put it in a folder called `app` in `[Electron path]/resources`
- `bower install && npm install`
- Run Electron

===

### Contribute

```bash
gulp
```

Gulp will watch for .jsx and .scss files changes.

Then commit and PR :)

===

### To-do list

##### on-deck

- [ ] refactor once it's frozen
- [ ] move from JST to babel (see [there](http://facebook.github.io/react/blog/2015/06/12/deprecating-jstransform-and-react-tools.html))
- [ ] use es6 classes instead of React.createClass()

##### general
- [x] shortcuts & global shortcuts
- [x] have a real development stack to generate views, scss, etc...

##### settings view
- [ ] freeze settings list
- [x] add/remove music folder
- [x] refresh library with the given folders

##### library view list
- [x] list all tracks
- [ ] manage columns
- [ ] resize columns
- [x] search

##### player
- [x] make it works ftw !
- [x] auto-read next track
- [x] next/previous button
- [x] list next tracks
- [ ] manage next tracks (on the road)
- [x] shuffle
- [ ] loop

##### nice to have
- [ ] themes support
- [ ] add languages support
- [ ] auto-updater from Github releases
- [ ] playlists
- [ ] async search
