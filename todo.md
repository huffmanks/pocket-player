# TODOS

## Changes/Fixes

1. Lock screen:
   - Make passcode faster more responsive. Seems sluggish.
   - Background time isnt triggering lock screen.
2. AppState status background: dismiss all models, toasts and alert dialogs.
3. Video player: Add loop and mute buttons to controls.
4. Settings enable passcode: require creating passcode or disable it until created.
5. Stale data:
   - Playlist view: Remove video from playlist, still appearing in list.
   - Home screen: when video is in playlist and all playlists get deleted video dropdown still has remove from playlist action.
   - When playlist videos reorderd update database. Not working.
   - [onRefresh](/components/playlist-sortable.tsx#L63)
   - [handleReorder](/components/playlist-sortable.tsx#L86)
6. Use SearchStore for filtering searches.
7. Switch settings and security stores to react-native-mmkv.

## Styles

1. Tabs bar: add padding top.
2. Standardize safe area view and padding for all screens.

## New features

1. Settings modal: create/update passcode.
2. Edit playlist: finish [onSubmit](/components/forms/edit-playlist.tsx#L63)
