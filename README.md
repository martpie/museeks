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

### To-do list

##### general

- [ ] refactor once it's working
- [ ] ~~use es6 classes instead of React.createClass()~~

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
- [ ] manage next tracks
- [ ] random
- [ ] loop

##### nice to have
- [ ] themes support
- [ ] add languages support
- [ ] auto-updater from Github releases
- [ ] playlists
