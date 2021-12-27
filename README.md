# Museeks

![Build Status](https://github.com/martpie/museeks/workflows/build/badge.svg)
![Dependencies](https://david-dm.org/martpie/museeks.svg)
![Github All Releases](https://img.shields.io/github/downloads/martpie/museeks/total)

A simple, clean and cross-platform music player. ([museeks.io](http://museeks.io))

![Screenshot](screenshot.png)

## Features

Museeks aims to be a simple and easy to use music player with a clean UI.

You will not find tons of features, as its goals is not to compete with more complete and more famous music players. Here is a little preview though:

- 💻 Cross-platform music player (Linux, macOS and Windows)
- 🎧 Supported formats: mp3, mp4, m4a/aac, flac, wav, ogg, 3gpp
- ✨ Clean and polished
- 🌟 Playlists
- 🎼 Queue management
- ➰ Shuffle, loop
- 🌄 Covers
- 🤓 Dark theme
- 🚤 Playback speed control
- 😴 Sleep mode blocker
- 🔊 Minimize to tray
- 🔄 `.m3u` import/export

Want more? Open a new issue or 👍 an existing one so we can talk about it.

## Releases notes

[Over here!](https://github.com/martpie/museeks/releases)

## Installation

### Classic

Builds and installers can be found [on this page](https://github.com/martpie/museeks/releases).

### Build (advanced)

Museeks is built upon:

- [Node.js](https://nodejs.org/en/)
- [Electron](https://github.com/atom/electron/) (formerly atom-shell)
- [React.js](https://facebook.github.io/react/) as UI library and [Flux](https://facebook.github.io/flux/) with [Redux](http://redux.js.org/) as data-flow pattern

Requirements:

- `node` > 10
- `npm` > 6
- `yarn` 1

Please consider that **`master` is unstable**.

- `git clone git@github.com:martpie/museeks.git`
- `cd museeks`
- `yarn install --frozen-lockfile`
- `yarn build` or `yarn dev`
- `yarn museeks` or `yarn museeks:debug`

### Package binaries (advanced)

- `rm -rf node_modules dist build`
- `yarn install --frozen-lockfile`
- `yarn build`
- `yarn package:lmw`, or:
  - `yarn package:l` (linux-only)
  - `yarn package:m` (mac-only)
  - `yarn package:w` (windows-only)

## Troubleshooting

Museeks is currently in development. This implies some things can break after an update (database schemes changes, config...).

If you encounter freezes or crashes when using the app, you can reset Museeks by following these steps:

- Go to the Museeks folder directory
  - Windows: `%AppData%\museeks`
  - OSX: `~/Library/Application Support/museeks`
  - Linux: `~/.config/museeks/` or `$XDG_CONFIG_HOME/museeks`
- Delete:
  - `IndexedDB` folder
  - `config.json` file
- Restart Museeks

If you still get problems after that, please open an issue :)

## Bug report

If you want to report a bug, first, thanks a lot, that helps us a lot. Please open an issue and mention your OS, your Museeks version, and how to reproduce it. Adding a screen of the console (Menu -> View -> Toggle Developer Tools) is a big help too.

## Contribute

- Fork and clone
- Master may be unstable, checkout to a tag to have a stable state of the app
- `yarn install --frozen-lockfile && yarn run dev` then run in a separate terminal `yarn run museeks:debug`
- `yarn run dev` will watch for file changes using ESBuild which will recompile JSX and CSS files.

Please respect a few rules:

- Before making complex stuff, don't hesitate to open an issue first to discuss about it ;)
- Understandable code > short code: comment if needed
- Make sure your build pass

Then open a PR :)
