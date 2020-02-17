#!/bin/bash

checksum_file () {
  shasum -a 256 $1 > $1.sha256
}

checksum_file build/museeks-amd64.deb
checksum_file build/museeks-i386.AppImage
checksum_file build/museeks-i386.deb
checksum_file build/museeks-i686.rpm
checksum_file build/museeks-setup.exe
checksum_file build/museeks-x86_64.AppImage
checksum_file build/museeks-x86_64.rpm
checksum_file build/museeks.dmg
