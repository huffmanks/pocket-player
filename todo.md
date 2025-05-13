# TODOS

## Issues

1. Cleanup:
   - add [react-native-boost](https://github.com/kuatsu/react-native-boost)
   - Add app screenshots to repo
2. [VideoThumbPicker](components/video-thumb-picker-next.tsx):
   - Make this an input and slider.
3. [FormDatePicker](components/ui/form.tsx#L182):
   - Make this an input and datepicker. User can do it either way.
4. [Upload videos](components/forms/upload-video.tsx#L115):
   - Test adding creationDate ffmpeg to see if video metadata is available.

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
   - value = `10` (player.currentTime | number | seconds)
