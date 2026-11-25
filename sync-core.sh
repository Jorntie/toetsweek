#!/bin/sh
# Kopieert de gedeelde kern naar alle vak-apps (toetsweek-*) naast deze map.
cd "$(dirname "$0")" || exit 1
for d in ../toetsweek-*/; do
  cp core/core.js core/core.css "$d" && echo "kern bijgewerkt in $d"
done
