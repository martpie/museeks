# Museeks

![build](https://github.com/martpie/museeks/actions/workflows/build.yml/badge.svg?branch=master)
![Github All Releases](https://img.shields.io/github/downloads/martpie/museeks/total)

A simple, clean and cross-platform music player. ([museeks.io](https://museeks.io))

![Screenshot](screenshot.png)

## Features

Museeks aims to be a simple and easy to use music player with a clean UI. You will not find tons of features, as it goal is not to compete with more complete and more famous music players.

Here is a little preview though:

- 💻 Cross-platform music player (Linux, macOS and Windows)
- 🎧 Supported formats: mp3, mp4, m4a/aac, flac, wav, ogg, 3gpp
- 🔄 Library auto-refresh
- 🌟 Playlists
- 🎼 Queue management
- ➰ Shuffle, loop
- 🌄 Covers
- 🤓 Dark theme
- 🚤 Playback speed control
- 😴 Sleep mode blocker
- 📥 `.m3u` import/export

Want more? Open a new issue or 👍 an existing one so we can talk about it.

## Releases notes

[Over here!](https://github.com/martpie/museeks/releases)

## Installation

### Installers

Binaries/Installers can be found [on the releases page](https://github.com/martpie/museeks/releases).

> [!NOTE]  
> Publication of Museeks to package managers is community-maintained. Museeks may be available there (like Homebrew, AUR, etc), but with no guarantee of it being the latest version available.

### Build (advanced)

Museeks is built upon:

- Back-end: [Tauri v2](https://v2.tauri.app/) / Rust 🦀
- UI: [React.js](https://react.dev)

Requirements:

- See [Tauri requirements](https://v2.tauri.app/start/prerequisites/) for `rust`
- [`bun`](https://bun.sh)

Please consider that **`master` is unstable**.

- `git clone git@github.com:martpie/museeks.git`
- `cd museeks`
- `bun install --frozen-lockfile`
- `bun tauri dev`

### Package binaries (advanced)

- `bun install --frozen-lockfile`
- `bun tauri build`

Tauri does not support x-platform binaries, so the command will only generate binaries for your current platform (macOS, Linux or Windows).

## Troubleshooting

Museeks is currently in development. This implies some things can break after an update (database schemes changes, config...).

If you encounter freezes or crashes when using the app, you can reset Museeks by following these steps:

- Go to Settings -> Open Storage Directory
- Alternatively, go to the Museeks folder directory
  - Windows: `%AppData%\Museeks`
  - OSX: `~/Library/Application Support/Museeks`
  - Linux: `~/.config/museeks/` or `$XDG_CONFIG_HOME/Museeks`
- Delete everything there
- Restart Museeks

If you still get problems after that, please open an issue :)

## Bug report

If you want to report a bug, first, thanks a lot, that helps us a lot. Please open an issue and mention your OS, your Museeks version, and how to reproduce it. Adding a screen of the console (Menu -> View -> Toggle Developer Tools) is a big help too.

## Contribute

- Fork and clone
- Master may be unstable, checkout to a tag to have a stable state of the app
- `bun install --frozen-lockfile && bun tauri dev` will launch Tauri and compile the app. Hot reload will work out of the box.

Please respect a few rules:

- Before making complex stuff, don't hesitate to open an issue first to discuss about it ;)
- Understandable code > short code: comment if needed
- Make sure your build pass

Then open a PR :)
