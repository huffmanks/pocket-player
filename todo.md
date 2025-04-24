# TODOS

## Issues/Modifications

1. [Video player](components/video-player.tsx):
   - play/pause/replay toggle button:
     - !ifPlaying play button else if hasEnded or !hasNext replay button else pause button.
   - Toggling mute doesn't work if mute is true in global settings.
   - Sometimes video orientation loads incorrectly.
   - Add title to top.
   - Add toggle loop button next to sound.
   - Light mode make bottom navigation bar dark.
   - Go back button and all video controls buttons replace has a Pressable with no styles.
   - Default to overrideOrientation if true in global settings.
   - Add useFocusEffect to cleanup previous player video.
2. [Lock screen](<app/(modals)/lock.tsx>):
   - scrollPosition is not set if:
     - app is manually locked
     - sometimes when coming from locked screen
3. [Search bar](components/search-bar.tsx):
   - Make glass effect when scrolling.
4. [Settings screen](<app/(tabs)/settings.tsx>):
   - Add icons with each section.
   - Add theme section. light, dark, system.
5. [Playlist dropdown](components/playlist-dropdown.tsx), [Video dropdown](components/video-dropdown.tsx):
   - Dropdown is not responsive and can fall out of safe area.
   - [useRelativePosition.tsx](https://github.com/roninoss/rn-primitives/blob/main/packages%2Fhooks%2Fsrc%2FuseRelativePosition.tsx)
6. [Edit video form](components/forms/edit-video.tsx), [Create playlist form](components/forms/create-playlist.tsx), [Edit playlist form](components/forms/edit-playlist.tsx):
   - Use toast.promise to verify success or error.
7. [playlist-sortable](components/playlist-sortable.tsx):
   - Scroll view issues if playlist is long. Not all items appear.
   - Sometimes on reorder images flash.
8. Cleanup:
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
