# TODOS

## Features

1. Save timestamp of last view of video.
   - Use zustand and mmkv.
   - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
   - value = `10` (player.currentTime | number | seconds)
2. Finalize:
   - Add app screenshots to repo
   - Finish refactor to edit video form, moved update thumbnail up.
