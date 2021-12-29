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
yarn install --frozen-lockfile
yarn build

# Package the whole application
yarn package:lmw

# Generate checksums
yarn package:checksums
