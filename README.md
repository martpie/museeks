# museeks

[![Codeship CI status](https://img.shields.io/codeship/0e3dd0f0-3076-0134-158d-029c728c3af4.svg)](https://codeship.com/projects/164162)
[![Dependencies](https://david-dm.org/KeitIG/museeks.svg)](https://github.com/KeitIG/museeks)
[![Gitter](https://badges.gitter.im/KeitIG/museeks.svg)](https://gitter.im/KeitIG/museeks?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

A lightweight and cross-platform music player. ([museeks.io](http://museeks.io))

![Screenshot](screenshot.png)

It uses:
* [Node.js](https://nodejs.org/en/) for back-end
* [electron (used to be atom-shell)](https://github.com/atom/electron/) for embedded browser
* [React.js](https://facebook.github.io/react/) as front-end framework

===

### Features

- Lightweight music player
- Polished
- Queue management
- Shuffle, loop
- Dark theme
- Playback speed control
- Sleep mode blocker
- Supported formats:
    - mp3
    - m4a/aac
    - wav
    - ogg
    - 3gpp

===

### Changelog / Roadmap

- [Changelog](https://github.com/KeitIG/museeks/releases)
- [Roadmap](ROADMAP.md)

===

### Installation

#### Classic

Builds can be found [at this page](https://github.com/KeitIG/museeks/releases). Please notive those are only portable versions. Installers may come in the future.

#### Build (advanced)

- Download [Electron](https://github.com/atom/electron/releases)
- Download Museeks source code
- Put it in a folder called `app` in `[Electron path]/resources`
- `npm install && npm run compile`
- Run Electron

===

### Contribute

- Fork and clone
- Master is usually unstable, checkout to a tag to have a stable state of the app
- `npm install && npm run dev`
- Enable dev mode in the app in the settings view to show DevTools

Webpack will watch for JSX and SASS changes.

Please respect a few rules:

- Before making complex stuff, don't hesitate to open an issue first to discuss about it
- Make the code readable and comment if needed
- Make sure `npm run lint` passes

Then open a PR :)
