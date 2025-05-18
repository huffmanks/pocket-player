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

### Option 2: Build a device-specific APK

You can generate a smaller, optimized APK for your specific device using the provided `generate-device-apk.sh` script:

1. **Build the AAB with EAS**

   ```sh
   # use --local to build on device.
   eas build -p android --profile preview
   ```

2. **Download the .aab file (if built via expo.dev)**

   - Place it in the root directory. You can skip this step if you built it locally.

3. **Get credentials.json and keystore.jks**

   ```sh
   eas credentials -p android
   ```

4. **Create .env.local**

   - Copy the example .env file and update its values with those from credentials.json.

   ```env
   cp example.env .env.local
   ```

5. **Make script executable**

   ```sh
   chmod +x generate-device-apk.sh
   ```

6. **Run script**

   ```sh
   ./generate-device-apk.sh
   ```

## Roadmap

- [ ] Save timestamp of last view of video.
  - [key = `videoProgress:${videoId}`](lib/store.ts#L453)
  - value = `10` (player.currentTime | number | seconds)

## License

[MIT License](LICENSE)
