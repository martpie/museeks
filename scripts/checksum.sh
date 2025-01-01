#!/bin/bash

if [ ! -f ./package.json ]; then
    echo "You should run Museeks scripts from the project root directory, exiting..."
    exit 1
fi

checksum_file () {
  shasum -a 256 $1 > $1.sha256
}

checksum_file release/Museeks_0.20.0_amd64.deb
checksum_file release/Museeks_0.20.0_x64-setup.exe
checksum_file release/Museeks_0.20.0_amd64.AppImage
checksum_file release/Museeks-0.20.0-1.x86_64.rpm
checksum_file release/Museeks_0.20.0_universal.dmg
