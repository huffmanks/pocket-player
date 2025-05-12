# TODOS

## Issues

1. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo
2. Miscellaneous:
   - Alert cancel text isn't centered.
   - When resorting playlist items, sometimes image flashes.
   - BottomSheet combobox remove spacing between select all and list. Also search hides the fields probably a text color issue.
   - Mute icon off increase opacity.
   - Playlist view make edit and delete vertical dots drop-down.
   - Forms delete and update make neutral colors white and black. secondary and default.
   - Video thumb picker make slider able to get more seconds and frames.

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
   - value = `10` (player.currentTime | number | seconds)
