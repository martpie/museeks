#!/bin/bash

if [ ! -f ./package.json ]; then
    echo "You should run Museeks scripts from the project root directory, exiting..."
    exit 1
fi

version=$(jq -r .version package.json)

checksum_file () {
  shasum -a 256 $1 > $1.sha256
}

echo Generating checksums for version ${version}

checksum_file release/Museeks_${version}_amd64.deb
checksum_file release/Museeks_${version}_x64-setup.exe
checksum_file release/Museeks_${version}_amd64.AppImage
checksum_file release/Museeks-${version}-1.x86_64.rpm
checksum_file release/Museeks_${version}_universal.dmg
