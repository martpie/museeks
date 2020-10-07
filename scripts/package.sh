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
npm ci
npm run build

# Package the whole application
npm run package:lmw

# Generate checksums
npm run package:checksums
