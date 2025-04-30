# TODOS

## Issues

1. [Video player](components/video-player.tsx):
   - Sometimes video orientation loads incorrectly.
   - Add orientation override to playlists player.
2. [Search bar](components/search-bar.tsx):
   - move to header.
   - use `headerTransparent: true` and `headerBlurEffect: regular`.
3. [Modal screens](<app/(modals)/_layout.tsx>):
   - HeaderItems are not clickable.
   - try overriding the whole header and adding custom back and title.
4. [index](<app/(tabs)/index.tsx>):
   - make index route splash screen with logo and then reroute to lock or videos screen. this should help with scrollPosition.
   - make tab option `href: null`.
5. Cleanup:
   - Upgrade packages
   - Add app screenshots to repo
6. playlist sortable
   - remove scrollbar visible add some padding top of list remove some at bottom.
   - favorites and index hide scrollbar
   - combobox select all deselect all, remove scrollbar

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L449)
   - value = `10` (player.currentTime | number | seconds)
