# Pocket Player

A simple mobile app to locally upload, store and watch videos.

## Features

- Upload videos from your device.
- Store videos locally on the device.
- Watch videos with a custom video player.
- Lightweight and privacy-friendly (no cloud or network usage).

## Tech Stack

- React Native with Expo.
- Drizzle with SQLite for local storage.
- Video player with custom video controls.
- Thumbnail generation and metadata extraction.

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

## Notes

- This app is intended for local use only. No data leaves your device.
- Works best with dev clients. Expo Go is not supported.

## License

[MIT](LICENSE)
