#!/bin/sh

set -eu

for package in boxes/*/package.json; do
    node merge-deps.mjs "$package"
    cp shared/index.html "$(dirname "$package")/index.html"
    cp shared/index.tsx "$(dirname "$package")/src/index.tsx"
done
