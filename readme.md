# Pocket Player

Android app to locally store and watch videos.

## Features

- Import videos directly from your device.
- Store and watch videos entirely offline.
- Custom video player with enhanced controls.
- Thumbnail generation and metadata extraction.
- Lightweight and privacy-friendly — no cloud or network access.

## Previews

![Pocket player app screenshot, video player](/previews/1.png)

![Pocket player app screenshot, light/dark theme](/previews/2.png)

![Pocket player app screenshot, playlists and settings](/previews/3.png)

## Tech Stack

- [React Native](https://github.com/facebook/react-native)/[Expo](https://github.com/expo/expo)
- DB: [Drizzle ORM with SQLite](https://github.com/drizzle-team/drizzle-orm)
- State and storage: [Zustand](https://github.com/pmndrs/zustand) + [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- UI libraries: [RN Primitives](https://github.com/roninoss/rn-primitives), [RN Reusables](https://github.com/mrzachnugent/react-native-reusables), [Nativewind](https://github.com/nativewind/nativewind)

## Notes

- This app is intended for local use only. No data leaves your device.
- Requires expo-dev-client; not compatible with Expo Go.
- See the [app design overview](design.md) for themes, logos, and asset generation details.

## Install

### Option 1: Download prebuilt universal APK

Download the latest APK from the [Releases](https://github.com/huffmanks/pocket-player/releases) page and install it on your Android device.

### Option 2: Build and deploy locally

1. **Clone the repository**

   ```sh
   git clone https://github.com/huffmanks/pocket-player.git
   cd pocket-player
   ```

2. **Create your environment file**

   ```sh
   cp example.env .env
   ```

3. **Log in to EAS (if needed)**

   ```sh
   just login
   ```

4. **Configure Android credentials (if needed)**

   ```sh
   just credentials
   ```

5. **Build the app and extract APKs**

   ```sh
   just build-and-extract
   ```

6. **Install the APK**

   Install the optimized device-specific APK:

   ```sh
   just deploy-deploy-device
   ```

   Or install the universal APK instead:

   ```sh
   just deploy-universal
   ```

## Roadmap

- [ ] Save timestamp of last view of video.
  - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
  - value = `10` (player.currentTime | number | seconds)

## License

[MIT License](LICENSE)
