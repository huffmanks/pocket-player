# TODOS

## Issues

1. [Screens](<app/(screens)/_layout.tsx>):
   - HeaderItems are not clickable.
2. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
   - value = `10` (player.currentTime | number | seconds)
