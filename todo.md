# TODOS

## rename to pocket-player

## Issues

1. [Video player](components/video-player.tsx):
   - Play, pause, (check replay), skip and forward icons remove the black stroke.
   - Add orientation override to playlists player.
2. [Modal screens](<app/(modals)/_layout.tsx>):
   - HeaderItems are not clickable.
   - try overriding the whole header and adding custom back and title.
3. [index splash screen](<app/(tabs)/index.tsx>):
   - add get started button that goes to upload screen.
   - Add title.
4. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L449)
   - value = `10` (player.currentTime | number | seconds)
