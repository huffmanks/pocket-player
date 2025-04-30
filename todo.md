# TODOS

## Issues

1. [Video player](components/video-player.tsx):
   - Sometimes video orientation loads incorrectly.
   - Add orientation override to playlists player.
2. [Search bar](components/search-bar.tsx):
   - move to header.
   - use `headerTransparent: true` and `headerBlurEffect: regular`.
3. [Modal screens](<app/(modals)/_layout.tsx>):
   - HeaderItems are not clickable.
   - try overriding the whole header and adding custom back and title.
4. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L449)
   - value = `10` (player.currentTime | number | seconds)
