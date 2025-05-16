# TODOS

## Issues

1. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo
2. Video thumb
   - On update thumb, blur input and setIsDisabled true.
   - On mount update progress value. Use videoInfo.duration and videoInfo.thumbTimestamp.
   - On mount, end time isn't showing up until unlocked.

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
   - value = `10` (player.currentTime | number | seconds)
