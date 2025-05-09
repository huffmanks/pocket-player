# TODOS

## Issues

1. [Modal screens](<app/(screens)/_layout.tsx>):
   - HeaderItems are not clickable.
2. [Screens layout](<app/(screens)/_layout.tsx>):
   - Refactor dynamic route navigation behaviors when lock screen enabled.
3. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo
4. store
   - rename currentPath and previousPath to lastVisitedPath and previousVisitedPath.

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L449)
   - value = `10` (player.currentTime | number | seconds)
