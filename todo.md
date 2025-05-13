# TODOS

## Issues

1. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo
2. Miscellaneous:
   - Video thumb picker make slider able to get more seconds and frames. add input, slider and skip frame buttons. maybe detach from hook and use inline videoplayer.

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
   - value = `10` (player.currentTime | number | seconds)
