# TODOS

## Changes/Fixes

1. Video player: fix scrubber
   - Update currentTime when scrubbing.
   - Refactor scrubbing pause/play.
   - Sometimes replay button is shown instead of play.
   - When video on loop, the currentTime and scrubber does not reset.
   - When video on loop, controls don't hide, they get shown again and dont go away.
   - If fast forward button, 5s, is greater than time left it bugs out.
2. Navbar buttons don't work when in modal. (have not been able to reproduce this in dev)

## Features

1. Video player custom controls:
   - Add buttons loop, chromecast
   - Not currently working with new arch. [react-native-google-cast](https://react-native-google-cast.github.io/docs/components/CastButton)
2. Edit video screen: add video scrubber to select/replace thumbnail.
3. Add custom expo config plugin to enable flag_secure. Hide/blackout screen when inactive or in background.
