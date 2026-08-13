# Todos

## UI

- [ ] Watch screens
  - [ ] Add a button or dropdown to go to edit video screen.
- [x] Playlists and ID view screen
  - [x] On fresh app load if navigating to this route for first time, it flickers empty state at beginning.
  - [x] View id page doesnt look great when loading.

## Issues

- [x] Watch playlist broken.
- [x] On upload success/fail clear imports/reset.
- [x] Dismiss dropdown if item triggered an alert dialog dropdown stays open.
- [ ] Coming back from an inactive/closed app state:
  - [ ] Sometimes you have to double swipe right to go back.
  - [x] Ensure all dropdowns/alert dialogs auto dismiss.

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
