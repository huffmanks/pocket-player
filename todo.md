# TODOS

## Issues

1. [Video player](components/video-player.tsx):
   - Add orientation override to playlists player.
2. [Modal screens](<app/(screens)/_layout.tsx>):
   - HeaderItems are not clickable.
3. [Videos screen](<app/(tabs)/videos.tsx>), [Favorites screen](<app/(tabs)/favorites.tsx>), [Playlists screen](<app/(tabs)/playlists.tsx>):
   - flash ListEmptyComponent on screen focus.
4. If no videos delete all playlists.
5. If currentPath is a modal when app reloads goBack goes to index. Find a way to refactor.
6. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L449)
   - value = `10` (player.currentTime | number | seconds)
