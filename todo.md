# TODOS

## Issues/Modifications

1. [Video player](components/video-player.tsx): play/pause/replay toggle button
   - Sometimes replay button is shown instead of play. (have not been able to reproduce this in dev)
   - Overlay not extending to bottom. (only for some videos)
   - Toggling mute doesn't work if mute is true in global settings.
2. [Playlists view screen](<app/(modals)/playlists/view/[id].tsx>):
   - Warning: Reading from `value` during component render. Please ensure that you do not access the `value` property or use `get` method of a shared value while React is rendering a component.
     - This is coming from this component.
     - import ReorderableList from "react-native-reorderable-list"
     - [upgrade issue fix here](https://github.com/omahili/react-native-reorderable-list/issues/20)
   - Show playlist title and description on screen.
   - Make videos grid 2x2 on screen.
3. [Video screen](<app/(tabs)/index.tsx>):
   - Remove from playlist is always showing even if not in playlist.
   - If video item is towards the bottom the dropdown may be cutoff some.
   - screenPosition doesnt appear to be working.
4. [Playlists screen](<app/(tabs)/playlists.tsx>):
   - Stale data when videos are removed from playlist.
   - When playlist is first created thumbs do not show up.
   - Make this screen use accordions with list view. Add action buttons to:
     - watch
     - view
     - edit
     - delete
5. [Settings screen](<app/(tabs)/settings.tsx>):
   - Add icons with each section.
   - Add theme section. light, dark, system.
   - Video player settings: add override orientation and default to that on player component if true.
   - Delete all videos and images that are not associated with a row in the database. Or find a way to do this on app start.
     - [list-all-files.ts](lib/list-all-files.ts)
6. Database and file creation:
   - Use toast.promise to verify success or error.
7. Upgrade packages
   - [update this](https://github.com/roninoss/rn-primitives/issues/46#issuecomment-2495382868)

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
4. [Edit video form](components/forms/edit-video.tsx):
   - Add/remove playlist option.
   - Delete video option with alert dialog to confirm.
   - Replace video option.
