# TODOS

## Changes/Fixes

1. Lock screen:
   - Make passcode faster more responsive. Seems sluggish.
   - Background time isnt triggering lock screen.
2. AppState status background: dismiss all models, toasts and alert dialogs.
3. Video player: Add loop and mute buttons to controls.
4. Settings enable passcode: require creating passcode or disable it until created.
5. Move useMigration to DatabaseProvider. Not sure if it will work.
6. Playlist view:
   - When removing video from playlist data is stale.
   - When playlist videos reorderd update database. Not working.
   - [onRefresh](/components/playlist-sortable.tsx#L39)
   - [handleReorder](/components/playlist-sortable.tsx#L84)
   - [updatePlaylistOrder](/actions/playlist.ts#L42)

## Styles

1. Tabs bar: add padding top.
2. Standardize safe area view and padding for all screens.

## New features

1. Settings modal: create/update passcode.
