# TODOS

## Issues

1. [Video player](components/video-player.tsx):
   - Sometimes video orientation loads incorrectly.
2. [Search bar](components/search-bar.tsx):
   - move to header.
   - use `headerTransparent: true` and `headerBlurEffect: regular`.
3. [Modal screens](<app/(modals)/_layout.tsx>):
   - HeaderItems are not clickable.
4. Cleanup:
   - Upgrade packages
   - Add app screenshots to repo
5. Settings
   - Delete cache button.
   - Delete local storage.
   - Delete files.

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L449)
   - value = `10` (player.currentTime | number | seconds)
