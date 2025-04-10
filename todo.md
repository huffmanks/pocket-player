# TODOS

## Changes/Fixes

1. Light mode custom video controls
   - Fix overlay color.
   - Icon colors.
2. Video player: fix scrubber
   - Update currentTime when scrubbing.
   - Refactor scrubbing pause/play.
   - Sometimes replay button is shown instead of play.
   - Try adding default orientation to: ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
3. Status bar:
   - Add hidden={false}
   - Hide status bar when in view video screen.

## Features

1. Video player custom controls:
   - Add buttons loop, chromecast
   - Not currently working with new arch. [react-native-google-cast](https://react-native-google-cast.github.io/docs/components/CastButton)
2. Edit video screen: add video scrubber to select/replace thumbnail.
3. Add custom expo config plugin to enable flag_secure. Hide/blackout screen when inactive or in background.