#!/bin/bash

set -e

if [ ! -f ./package.json ]; then
    echo "You should run Museeks scripts from the project root directory, exiting..."
    exit 1
fi

WORK_DIR=$(realpath "release")

echo Extracting binaries

# Extract all zip files in the release directory
for zip in "$WORK_DIR"/*.zip; do
  [ -f "$zip" ] || continue
  unzip -q "$zip" -d "${zip%.zip}_extracted"
done

# Move all files from extracted folders into the release directory
for dir in "$WORK_DIR"/*_extracted; do
  [ -d "$dir" ] || continue
  find "$dir" -type f -exec mv -n {} "$WORK_DIR" \;
done

# Remove extracted directories
for dir in "$WORK_DIR"/*_extracted; do
  rm -rf "$dir"
done

# Compute checksums for all files
VERSION=$(jq -r .version package.json)

checksum_file () {
  shasum -a 256 "$1" > "$1.sha256"
  echo "Generated checksum for $(basename "$1")"
}

echo "Generating checksums for version ${VERSION}"

# Generate checksums for all release files with relevant extensions
for file in release/*.{deb,exe,AppImage,rpm,dmg,flatpak}; do
  [ -f "$file" ] || continue
  checksum_file "$file"
done
