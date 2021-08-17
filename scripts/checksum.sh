#!/bin/bash

if [ ! -f ./package.json ]; then
    echo "You should run Museeks scripts from the project root directory, exiting..."
    exit 1
fi

checksum_file () {
  shasum -a 256 $1 > $1.sha256
}

checksum_file build/museeks-amd64.deb
checksum_file build/museeks-i386.AppImage
checksum_file build/museeks-i386.deb
checksum_file build/museeks-i686.rpm
checksum_file build/museeks-ia32-setup.exe
checksum_file build/museeks-x64-setup.exe
checksum_file build/museeks-ia32-portable.exe
checksum_file build/museeks-x64-portable.exe
checksum_file build/museeks-x86_64.AppImage
checksum_file build/museeks-x86_64.rpm
checksum_file build/museeks-x64.dmg
checksum_file build/museeks-arm64.dmg
