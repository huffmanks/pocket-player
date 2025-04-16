# TODOS

## Changes/Fixes

1. Video player: play/pause/replay toggle button
   - Sometimes replay button is shown instead of play. (have not been able to reproduce this in dev)
2. Playlists screen: Stale data [playlists](<app/(tabs)/playlists.tsx>)

## Features

1. Video player custom controls:
   - Add buttons toggle loop.
   - Chromecast: currently not working with new arch. [react-native-google-cast](https://react-native-google-cast.github.io/docs/components/CastButton)
2. Add custom expo config plugin to enable flag_secure. Hide/blackout screen when inactive or in background.
3. Files screen: display all app files and allow user to delete some or all. Include videoDir and cache files.
4. Restore FlashList scroll position. Use mmkv.
5. Save timestamp of last view of video. Use mmkv. const key = `lastViewed:${videoId}`;
6. Edit video: replace video option.
