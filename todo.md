# TODOS

## Issues

1. [Screens](<app/(screens)/_layout.tsx>):
   - HeaderItems are not clickable.
2. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo
3. Miscellaneous:
   - Alert cancel text isn't centered.
   - When resorting playlist items, sometimes image flashes.
   - Redirecting happening in modals after first load.

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
   - value = `10` (player.currentTime | number | seconds)
