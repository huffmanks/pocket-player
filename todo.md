# TODOS

## Changes/Fixes

1. Change upload form to upload many videos. Remove titles, etc.
2. Lock screen:
   - Make passcode faster more responsive. Seems sluggish.
   - Background time isnt triggering lock screen.
3. Update error messages and add toasts
   - import { toast } from 'sonner-native';
   - [Sonner native](https://github.com/gunnartorfis/sonner-native)
4. On AppState background dismiss all models, toasts and alert dialogs.
5. Video player: Add loop and mute buttons to controls.
6. Watch screen: remove headerShown false. Add presentation model and title to be video title.
7. Settings toggle enablePasscode isn't working properly.

## Styles

1. Tabs bar: add padding top.
2. Reset data button > delete data
3. Alert dialog delete text-foreground.
4. Settings: add subtitle under video player > Default settings.
5. Passcode create button icon text-foreground. It's white on light.

## New features

1. Settings modal: create/update passcode.
2. Videos screen: add filter and sort.

## New screens

1. Playlist/queue
2. Favorites
3. Edit video form
   - Title
   - Description
   - Tags

"pnpm": {
"peerDependencyRules": {
"overrides": {
"react-native-svg": "15.2.0",
"react-native-safe-area-context": "4.10.1"
}
}
},
