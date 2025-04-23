# TODOS

## Issues/Modifications

1. [Video player](components/video-player.tsx):
   - play/pause/replay toggle button: sometimes replay button is shown instead of play. (have not been able to reproduce this in dev)
   - Toggling mute doesn't work if mute is true in global settings.
   - Sometimes video orientation loads incorrectly.
   - Add title to top.
   - Add toggle loop button next to sound.
   - Light mode make bottom navigation bar dark.
   - Go back button has a hover/focus color. Remove styles or use pressable.
   - Default to overrideOrientation if true in global settings.
2. [Home screen](<app/(tabs)/index.tsx>):
   - If app is manually locked, scrollPosition is not set.
3. [Search bar](components/search-bar.tsx):
   - Make glass effect when scrolling.
4. [Settings screen](<app/(tabs)/settings.tsx>):
   - Add icons with each section.
   - Add theme section. light, dark, system.
5. [Upload video form](components/forms/upload-video.tsx):
   - Clear cache on successful upload complete.
   - New videos are all being set to landscape.
   - Try and get original file created date.
   - Disable clear and import button if no files have been selected.
   - Use toast.promise to verify success or error.
6. [Edit video form](components/forms/edit-video.tsx):
   - Add video title to AlertDialog.
   - On light mode, swap track colors.
7. [Video item](components/video-item.tsx):
   - Add video and audio codec icons.
   - Dropdown when selecting favorite change toast message.
   - Add video title to AlertDialog.
   - Sometimes remove from playlist is shown even if not in playlist. Need to refactor if video is in multiple playlists.
   - Dropdown is not responsive and can fall out of safe area.
8. [Playlists screen](<app/(tabs)/playlists.tsx>):
   - Add playlist title to AlertDialog.
   - Dropdown is not responsive and can fall out of safe area.
9. [Create playlist form](components/forms/create-playlist.tsx):
   - When submitting if combobox is empty change error message.
   - Ensure router.push("/playlists") on successful submit.
10. [playlist-sortable](components/playlist-sortable.tsx):
    - Scroll view issues if playlist is long. Not all items appear.
    - Sometimes on reorder images flash.
11. Cleanup:
    - Update version
    - Update readme.md
    - Add app screenshots to repo

## Features

1. Add custom expo config plugin to enable flag_secure. Hide/blackout screen when inactive or in background.
2. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L381)
   - value = `10` (player.currentTime | number | seconds)
3. Data screen (new):
   - Show all data with a chart.
   - Ability to select multiple to delete.
   - [list-all-files.ts](lib/list-all-files.ts)
