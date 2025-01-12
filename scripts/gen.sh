#!/bin/bash

if [ ! -f ./package.json ]; then
    echo "You should run Syncudio scripts from the project root directory, exiting..."
    exit 1
fi

# Generate types via ts-rs
find ./src/generated/typings -iname '*.ts' -not -iname 'index.ts' -execdir rm {} \;
cargo test --manifest-path src-tauri/Cargo.toml
