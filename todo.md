# TODOS

## Issues

1. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - use modular imports. remove all \* imports.
   - Add app screenshots to repo
2. Miscellaneous:
   - Alert cancel text isn't centered.
   - When resorting playlist items, sometimes image flashes.
   - Mute icon off increase opacity.
   - Playlist view make edit and delete vertical dots drop-down.
   - Forms delete and update make neutral colors white and black. secondary and default.
   - Video thumb picker make slider able to get more seconds and frames. add input, slider and skip frame buttons. maybe detach from hook and use inline videoplayer.
   - if watch screen is last visited it will not lock. need to remove disableLock.

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
   - value = `10` (player.currentTime | number | seconds)
