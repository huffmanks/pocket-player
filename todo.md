# TODOS

## Issues

1. [Screens](<app/(screens)/_layout.tsx>):
   - HeaderItems are not clickable.
2. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo
3. Miscellaneous:
   - Alert cancel text isn't centered.
   - Disable buttons on settings screen when submitting.
   - When resorting playlist items, sometimes image flashes.
   - Reset settings isn't deleting persistent storage. i.e. lastVisitedPath, etc.
   - enableOrientation should be ignored on video-thumb-picker.
   - video player, on swipe up disable slider. Or move slider up some.
   - favorite star is not being filled.
   - player icons arent filled.

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
   - value = `10` (player.currentTime | number | seconds)
