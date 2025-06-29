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

Binaries/Installers can be found [on the releases page](https://github.com/martpie/museeks/releases).

> [!NOTE]
> Publication of Museeks to package managers is community-maintained. Museeks may be available there (like Homebrew, AUR, etc), but with no guarantee of it being the latest version available.

## Bugs

Please open an issue on GitHub, mention your OS, your Museeks version, and how to reproduce it. Adding a screen of the console (Menu -> View -> Toggle Developer Tools) is a big help too.

Thank you!

## Troubleshooting

Since version `0.20`, I try to build things as backwards-compatible as possible, but I may miss some edgecases.

If you encounter freezes or crashes when using the app, you can reset Museeks.

<p>
  <details>
    <summary>
      Reset Museeks
    </summary>

  - Go to Settings -> Open Storage Directory
  - Alternatively, go to the Museeks folder directory
    - Windows: `%AppData%\museeks`
    - OSX: `~/Library/Application Support/museeks`
    - Linux: `~/.config/museeks/` or `$XDG_CONFIG_HOME/museeks`
  - Delete everything there
  - Restart Museeks
  </details>
</p>

If you still get problems after that, please open an issue :)

## Contributing and Development

### Guidelines

- Before making complex stuff, don't hesitate to open an issue first to discuss about it ;)
- Understandable code > short code: comment if needed
- That's it :)

### Setup

Museeks is built upon:

- Back-end: [Tauri v2](https://v2.tauri.app/) / Rust 🦀
- UI: [React.js](https://react.dev)

So you will need to install the following dependencies:

- [Tauri requirements](https://v2.tauri.app/start/prerequisites/) for `rust`
- [`bun`](https://bun.sh)

Then you can:

- fork the repository
- `git clone git@github.com:<username>/museeks.git`
- `cd museeks`

### Development Mode

- `bun install --frozen-lockfile`
- `bun tauri dev`

This will launch Museeks in dev mode. Hot reload will work out-of-the-box, so when you update a `.js` file, the UI will automatically update, and when you edit a `.rs` file, Museeks will automatically relaunch.

### Package binaries

- `bun install --frozen-lockfile`
- `bun tauri build`

Tauri does not support x-platform binaries, so the command will only generate binaries for your current platform (macOS, Linux or Windows).

### Translations

- follow the steps from the "Setup" and "Development Mode" sections
- go to `src/translations/languages.ts`
- add your language information to the list
- run `bun run gen:translations`
- this will create a new file `<your_language_code>.po` in the same folder
- fill the translations from the created `.po` file
- open a Pull Request

<p>
  <details>
    <summary>
      Pluralization Help
    </summary>

  - [Pluralization guide](https://lingui.dev/guides/plurals)
  - [Pluralization reference](https://www.unicode.org/cldr/charts/42/supplemental/language_plural_rules.html)
  </details>
</p>

ps: _translations are in an early stage. If your language has "special" characteristics, like right-to-left, specific locales instead of languages, or else, Museeks might not be ready for it yet. Please open an issue so we can discuss it :)_
