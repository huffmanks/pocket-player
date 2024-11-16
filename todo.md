# TODOS

## Changes/Fixes

1. Lock screen:
   - Make passcode faster more responsive. Seems sluggish.
   - Background time isnt triggering lock screen.
2. AppState status background: dismiss all models, toasts and alert dialogs.
3. Video player: Add loop and mute buttons to controls.
4. Settings enable passcode: require creating passcode or disable it until created.
5. Stale data:
   - When playlist videos reorderd update database. Not working.
   - [handleReorder](/components/playlist-sortable.tsx#L86)
6. Test new video component library [react-native-vlc-player](https://github.com/ghondar/react-native-vlc-player)
7. Add cast [react-native-google-cast](https://react-native-google-cast.github.io/docs/components/CastButton)

## Styles

1. Tabs bar: add padding top.
2. Standardize safe area view and padding for all screens.

## New features

1. Settings modal: create/update passcode.
