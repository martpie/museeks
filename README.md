# museeks

[![Gitter](https://badges.gitter.im/KeitIG/museeks.svg)](https://gitter.im/KeitIG/museeks?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
![Dependencies](https://david-dm.org/KeitIG/museeks.svg)

A cross-platform music player, in active development. **0.1 will be released soon.**

![Screenshot](screenshot.png)

It uses:
* [Node.js](https://nodejs.org/en/) for back-end
* [electron (used to be atom-shell)](https://github.com/atom/electron/) for embedded browser
* [React.js](https://facebook.github.io/react/) as front-end framework

===

### Features

- Lightweight music player
- Queue management
- Shuffle, loop
- Dark theme
- Supported formats:
    - mp3
    - ogg
    - wav

===

### Changelog / Roadmap

- [Changelog](CHANGELOG.md#changelog)
- [Roadmap](CHANGELOG.md#roadmap)

===

### Installation

Please consider **this app is still under development, just install it for fun**, I'm aware of multiple bugs and designs issues.

- Download [Electron](https://github.com/atom/electron/releases) **there are crashes problems in 0.36.x, don't use it**
- Download Museeks source code
- Put it in a folder called `app` in `[Electron path]/resources`
- `bower install && npm install && npm run compile`
- Run Electron

===

### Contribute

- Fork and clone
- You will need `bower` and `webpack` installed globally
- `bower install && npm install && npm run dev`
- Don't forget to enable dev mode in the app in the settings view

Webpack will watch for JSX and SASS changes.

Please respect a few rules:

- Make the code readable and comment if needed
- 4 spaces indent !
- Before making complex stuff, don't hesitate to open an issue first to discuss about it

Then open a PR :)
