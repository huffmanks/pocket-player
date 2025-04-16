# TODOS

## Changes/Fixes

1. [Video player](components/video-player.tsx): play/pause/replay toggle button
   - Sometimes replay button is shown instead of play. (have not been able to reproduce this in dev)
   - Overlay not extending to bottom.
2. [Playlists screen](<app/(tabs)/playlists.tsx>): Stale data. When video gets updated, thumbnail does not on playlists item.
3. [Playlists view screen](<app/(modals)/playlists/view/[id].tsx>): Get the following warning (x2)
   - Reading from `value` during component render. Please ensure that you do not access the `value` property or use `get` method of a shared value while React is rendering a component.
   - Make this screen use accordions for quicker access to playing playlist, etc.
   - can still have [id] page for playlist
4. [File dropzone design](https://dribbble.com/shots/18231693-Drag-n-drop-areas)

## Features

1. [Video player](components/video-player.tsx):
   - Additional button controls
     - Toggle loop
     - Chromecast: currently not working with new arch. [react-native-google-cast](https://react-native-google-cast.github.io/docs/components/CastButton)
2. Add custom expo config plugin to enable flag_secure. Hide/blackout screen when inactive or in background.
3. Files screen (new):
   - Accessible from settings screen.
   - Display all app files (local and cache).
   - Allow user to delete some or all.
   - If video is deleted:
     - delete thumb
     - remove from playlist in db
   - Move delete all data button to this screen.
4. Restore flashlist scroll position.

   - Screens: index and favorites
   - Use zustand and mmkv.
   - key = `scroll_position:${screen}`
   - value = `248.3876953125` (e.nativeEvent.contentOffset.y| float)
   - ```
      const flashListRef = useRef<FlashList<VideoMeta> | null>(null);

      useEffect(() => {
         getScroll().then(offset => {
            flashListRef.current?.scrollToOffset({ offset, animated: false });
         });
      }, []);

      <FlashList
         {/* ... */}
         onScroll={e => {
            saveScroll(e.nativeEvent.contentOffset.y);
         }}
         scrollEventThrottle={16}
      />
     ```

5. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - key = `video_progress:${videoId}`
   - value = `10` (player.currentTime | number | seconds)
6. [Edit video form](components/forms/edit-video.tsx): replace video option.
