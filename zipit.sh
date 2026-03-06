#!/bin/bash

# Script to create the zip files to distribute the extension
# It uses the git archive command to create the zip files
# It uses the git show command to get the version from the manifest.json

# Stop on errors
set -e

# Ensure we are in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Error: Must be run from inside the git repository."
    exit 1
fi

echo "Extracting versions from manifest.json on branches 'main' and 'firefox'..."

# Get versions from the respective branches
VERSION_CHROME=$(git show main:manifest.json 2>/dev/null | grep -E '"version"\s*:' | awk -F'"' '{print $4}')
VERSION_FIREFOX=$(git show firefox:manifest.json 2>/dev/null | grep -E '"version"\s*:' | awk -F'"' '{print $4}')

if [ -z "$VERSION_CHROME" ]; then
    echo "Error: Could not find version in main:manifest.json or 'main' branch does not exist."
    exit 1
fi

if [ -z "$VERSION_FIREFOX" ]; then
    echo "Error: Could not find version in firefox:manifest.json or 'firefox' branch does not exist."
    exit 1
fi

CHROME_ZIP="hide-wpp-buttons-chrome-${VERSION_CHROME}.zip"
FIREFOX_ZIP="hide-wpp-buttons-firefox-${VERSION_FIREFOX}.zip"

# Included "Icons" in the list below as they are referenced in the manifest.json
# and omitting them will cause an error when loading the extension.
CHROME_FILES="Icons content.js manifest.json popup.html popup.js README.md"
FIREFOX_FILES="$CHROME_FILES background.js"

echo "Building Chrome extension zip ($CHROME_ZIP) from 'main' branch..."
git archive --format=zip -o "$CHROME_ZIP" main $CHROME_FILES

echo "Building Firefox extension zip ($FIREFOX_ZIP) from 'firefox' branch..."
git archive --format=zip -o "$FIREFOX_ZIP" firefox $FIREFOX_FILES

echo "Done! Successfully created:"
echo " - $CHROME_ZIP"
echo " - $FIREFOX_ZIP"
