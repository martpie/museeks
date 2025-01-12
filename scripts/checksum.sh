#!/bin/bash

if [ ! -f ./package.json ]; then
    echo "You should run Syncudio scripts from the project root directory, exiting..."
    exit 1
fi

checksum_file () {
  shasum -a 256 $1 > $1.sha256
}

checksum_file release/Syncudio_0.20.5_amd64.deb
checksum_file release/Syncudio_0.20.5_x64-setup.exe
checksum_file release/Syncudio_0.20.5_amd64.AppImage
checksum_file release/Syncudio-0.20.5-1.x86_64.rpm
checksum_file release/Syncudio_0.20.5_universal.dmg
