# TODOS

## Issues

1. [Video player](components/video-player.tsx):
   - Add orientation override to playlists player.
   - Don't autoPlay for playlists.
2. [Modal screens](<app/(screens)/_layout.tsx>):
   - HeaderItems are not clickable.
3. [Videos screen](<app/(tabs)/videos.tsx>), [Favorites screen](<app/(tabs)/favorites.tsx>), [Playlists screen](<app/(tabs)/playlists.tsx>):
   - flash ListEmptyComponent on screen focus.
4. [Screens layout](<app/(screens)/_layout.tsx>):
   - Refactor dynamic route navigation behaviors when lock screen enabled.
5. [video thumb picker](components/video-thumb-picker.tsx):
   - change isLocked, setIsLocked state to isDisabled, setIsDisabled.
   - thumb gen and saving to DB change to Math.round(player.currentTime * 1000).
   - show null or loading state so progress and player.currentTime can be set without flashing.
   - Refactor slider min/max to 0 and player.duration. Step to 0.25.
6. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L449)
   - value = `10` (player.currentTime | number | seconds)
