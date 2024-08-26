#!/bin/bash

if [ ! -f ./package.json ]; then
    echo "You should run Museeks scripts from the project root directory, exiting..."
    exit 1
fi

# Let's clean stuff a little bit
rm -rf ./dist
rm -rf ./build

# Make sure we have the latest build
rm -rf ./node_modules
bun install

# Package the whole application
bun tauri build

# Generate checksums
bun package:checksums
