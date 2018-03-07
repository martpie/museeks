# museeks

[![Build Status](https://travis-ci.org/KeitIG/museeks.svg?branch=master)](https://travis-ci.org/KeitIG/museeks)
[![Dependencies](https://david-dm.org/KeitIG/museeks.svg)](https://github.com/KeitIG/museeks)
[![Gitter](https://badges.gitter.im/KeitIG/museeks.svg)](https://gitter.im/KeitIG/museeks?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

A simple, clean and cross-platform music player. ([museeks.io](http://museeks.io))

![Screenshot](screenshot.png)

It uses:
* [Node.js](https://nodejs.org/en/) for back-end
* [electron (used to be atom-shell)](https://github.com/atom/electron/) for embedded browser
* [React.js](https://facebook.github.io/react/) as front-end framework and [Flux](https://facebook.github.io/flux/) with  [Redux](http://redux.js.org/) as data-flow pattern

---

### Features

Museeks aims to be a minimalistic and easy to use music player, you will not find tons of feature. Here is a little preview though:

- 💻 Cross-platform music player
- ✨ Clean and polished
- 🌟 Playlists
- 🎼 Queue management
- ➰ Shuffle, loop
- 🌄 Covers support
- 🤓 Dark theme
- 🚤 Playback speed control
- 😴 Sleep mode blocker
- 🔊 Minimize to tray
- 🎧 Supported formats:
    - mp3
    - mp4
    - m4a/aac
    - flac
    - wav
    - ogg
    - 3gpp

---

### Releases notes

- [Releases notes](https://github.com/KeitIG/museeks/releases)

---

### Installation

#### Classic

Builds and installers can be found [on this page](https://github.com/KeitIG/museeks/releases).

#### Build (advanced)

Please consider that **`master` is unstable.**

- `git@github.com:KeitIG/museeks.git`
- `cd museeks`
- `npm install`
- `npm run compile` or `npm run dev`
- `npm run museeks` or `npm run museeks:debug`

---

### Troubleshooting

Museeks is currently in development. This implies some things can break after an update (database schemes changes, config...).

If you encounter freezes when starting the app, you can reset Museeks by following these steps:

- Go to the Museeks folder directory
    - Windows: `%AppData%\museeks`
    - OSX: `~/Library/Application Support/museeks`
    - Linux: `~/.config/museeks/` or `$XDG_CONFIG_HOME/museeks`
- Delete:
    - `IndexedDB` folder
    - `config.json` file
- Restart Museeks

If you still get problems after that, please open an issue :)

---

### Bug report

If you want to report a bug, first, thanks a lot, that helps us a lot. Please open an issue and mention your OS, your Museeks version, and how to reproduce it. Adding a screen of the console (Settings -> Advanced -> Enable dev mode) is a big help too.

---

### Contribute

- Fork and clone
- Master is usually unstable, checkout to a tag to have a stable state of the app

- `npm install && npm run dev` then run in a separate terminal `npm run museeks:debug`
- `npm run dev` will watch for file changes using Webpack which will recompile JSX and SASS files.

Please respect a few rules:

- Before making complex stuff, don't hesitate to open an issue first to discuss about it
- Make the code readable and comment if needed
- Make sure `npm run lint:sass && npm run lint:js` passes

Then open a PR :)
