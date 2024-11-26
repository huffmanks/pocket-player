# TODOS

## Changes/Fixes

1. Video player custom controls:
   - exit video, XIcon top left
   - mute, loop, volume, chromecast
   - play/pause
   - skip/rewind 15s
2. Stale data:
   - When playlist videos reorderd update database. Not working.
   - [handleReorder](/components/playlist-sortable.tsx#L86)
3. Generated video thumbnail should take into account if is portrait or landscape.
4. Add auto full-screen to settings.

## Features

1. Add video scrubber to replace thumbnail
2. Calendar for edit video form [React Native Flash Calendar](https://github.com/MarceloPrado/flash-calendar)
3. Add cast. Not currently working with new arch. [react-native-google-cast](https://react-native-google-cast.github.io/docs/components/CastButton)
