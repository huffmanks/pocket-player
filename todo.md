# TODOS

## Changes/Fixes

1. Video player: play/pause/replay toggle button
   - Sometimes replay button is shown instead of play. (have not been able to reproduce this in dev)
2. Router tabs add padding top and bottom.
3. Playlists screen: Remove border from circle images. [playlists](<app/(tabs)/playlists.tsx#L83>)
4. Edit video screen: add video scrubber to select/replace thumbnail.
   - Init: [VideoThumbPicker](components/video-thumb-picker.tsx)
   - Debug: Currently is not saving/updating thumbnail to storage and/or db
5. DB: Add thumbTimestamp field to video schema.
   - Default to 1000 (ms)
   - Edit video screen: update thumbTimestamp when thumbnail changed.

## Features

1. Video player custom controls:
   - Add buttons toggle loop.
   - Chromecast: currently not working with new arch. [react-native-google-cast](https://react-native-google-cast.github.io/docs/components/CastButton)
2. Add custom expo config plugin to enable flag_secure. Hide/blackout screen when inactive or in background.
