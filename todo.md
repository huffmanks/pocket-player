# Todos

## UI

- [ ] Watch screens
  - [ ] Add a button or dropdown to go to edit video screen.
- [ ] Playlists and ID view screen
  - [-] On fresh app load if navigating to this route for first time, it flickers empty state at beginning.
  - [ ] View id page doesnt look great when loading.

## Issues

- [-] Watch playlist broken.
- [ ] Coming back from an inactive/closed app state:
  - [ ] Sometimes you have to double swipe right to go back.
  - [ ] Ensure all dropdowns/bottomsheets/combobox/select/alert dialogs auto dismiss.

## New features

- [ ] Add whitelist or ability to scan a folder to auto add videos.
- [ ] Save timestamp of last view of video.
  - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
  - value = `10` (player.currentTime | number | seconds)
- [ ] Move thumbnails to its own directory (thumbs).
  - [ ] Add the ability to `delete all video`s and `delete all thumbs`.
- [ ] File manager
  - [ ] Add video title to file item. (Would require getting from db)

## Future

- [-] security screen/navbar make same black color.
- [-] check for embedded video thumb first and if not exist continue.
