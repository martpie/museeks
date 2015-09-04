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
- `bower install && npm install && gulp`
- Run Electron

===

### Contribute

- fork and clone
- `bower install && npm install && gulp`
Gulp will watch for .jsx and .scss files changes.

Please respect a few rules:
- Make the code readable and comment if needed
- 4 spaces indent !
- Before making complex stuff, don't hesitate to open an issue first to discuss about it

Then open a PR :)

===

### To-do list

This list is not limited. Features findable in issues with the `to-do` tag will be achieved first.

##### discussion

- [ ] refactor once it's frozen
- [ ] move from JST to babel (see [there](http://facebook.github.io/react/blog/2015/06/12/deprecating-jstransform-and-react-tools.html))
- [ ] use es6 classes instead of React.createClass()
- [ ] build system for each platform (.exe, .app, .deb...) need help on this one

##### general
- [x] shortcuts & global shortcuts
- [x] have a real development stack to generate views, scss, etc...
- [ ] dark theme

##### settings view
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
- [x] manage next tracks
- [x] shuffle
- [x] loop, single-loop

##### nice to have
- [ ] themes support
- [ ] add languages support
- [ ] auto-updater from Github releases
- [ ] playlists
- [x] async search
