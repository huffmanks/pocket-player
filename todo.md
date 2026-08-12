# Todos

## UI

- [ ] File manager
  - [ ] Refresh files should show `<ActivityIndicator />.
  - [ ] Add video title to file item.
- [ ] Playlist view screen
  - [ ] Reordering causes items to flicker when released/dropped.
- [ ] Videos screen
  - [ ] On fresh app load if navigating to this route for first time, it flickers empty state at beginning.

## Refactors

- [ ] Move thumbnails to its own directory (thumbs).
  - [ ] Add the ability to `delete all video`s and `delete all thumbs`.

## Issues

- [-] Watch playlist broken.
- [ ] Coming back from an inactive/closed app state:
  - [ ] Sometimes you have to double swipe right to go back.
  - [ ] Ensure all alert dialogs/dropdowns auto dismiss.
- [ ] Verify `index` route is not being tracked or saved as lastVisitedPath.

## New features

- [ ] Add whitelist or ability to scan a folder to auto add videos.
- [ ] Save timestamp of last view of video.
  - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
  - value = `10` (player.currentTime | number | seconds)

## Future

- [-] security screen/navbar make same black color.
- [-] check for embedded video thumb first and if not exist continue.
