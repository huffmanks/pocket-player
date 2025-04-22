# TODOS

## Issues/Modifications

1. [Video player](components/video-player.tsx): play/pause/replay toggle button
   - Sometimes replay button is shown instead of play. (have not been able to reproduce this in dev)
   - Toggling mute doesn't work if mute is true in global settings.
2. [Video screen](<app/(tabs)/index.tsx>):
   - Remove from playlist is always showing even if not in playlist.
   - If video item is towards the bottom the dropdown may be cutoff some.
3. [Settings screen](<app/(tabs)/settings.tsx>):
   - Add icons with each section.
   - Add theme section. light, dark, system.
   - Video player settings: add override orientation and default to that on player component if true.
   - Delete all videos and images that are not associated with a row in the database. Or find a way to do this on app start. - [list-all-files.ts](lib/list-all-files.ts)
4. [Edit playlist form](components/forms/edit-playlist.tsx):
   - Combobox if titles are too long the chevronsupdownicon is pushed out. maybe make the input resize/grow.
5. [playlist-sortable](components/playlist-sortable.tsx):
   - Verify there are no scroll or overflow issues when playlist is long.
6. Database and file creation:
   - Use toast.promise to verify success or error.
7. Cleanup:
   - Update version
   - Update readme.md
   - Add app screenshots to repo

## Features

1. [Video player](components/video-player.tsx):
   - Add title at top.
   - Additional button controls:
     - Toggle loop.
     - Chromecast: currently not working with new arch. [react-native-google-cast](https://react-native-google-cast.github.io/docs/components/CastButton)
2. Add custom expo config plugin to enable flag_secure. Hide/blackout screen when inactive or in background.
3. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L381)
   - value = `10` (player.currentTime | number | seconds)
