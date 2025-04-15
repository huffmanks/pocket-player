# TODOS

## Changes/Fixes

1. Video player: play/pause/replay toggle button
   - Sometimes replay button is shown instead of play. (have not been able to reproduce this in dev)

## Features

1. Video player custom controls:
   - Add buttons loop, chromecast
   - Not currently working with new arch. [react-native-google-cast](https://react-native-google-cast.github.io/docs/components/CastButton)
2. Edit video screen: add video scrubber to select/replace thumbnail.
   - Init: [VideoThumbPicker](components/video-thumb-picker.tsx)
   - Debug: Currently is not saving/updating thumbnail to storage and/or db
3. Add custom expo config plugin to enable flag_secure. Hide/blackout screen when inactive or in background.
