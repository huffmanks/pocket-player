#!/bin/bash

set -e

if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
elif [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

KEYSTORE="${KEYSTORE:-keystore.jks}"
KEY_ALIAS="${KEY_ALIAS:-GET_FROM_EAS_CREDENTIALS}"
KEYSTORE_PASS="${KEYSTORE_PASS:-GET_FROM_EAS_CREDENTIALS}"
KEY_PASS="${KEY_PASS:-GET_FROM_EAS_CREDENTIALS}"
DEVICE_SPEC="${DEVICE_SPEC:-device-spec.json}"
AAB_FILE=$(find . -name "*.aab" | head -n 1)

# Check if output.apks exists and delete it
if [ -f "output/output.apks" ]; then
  echo "Deleting output.apks..."
  rm -f output/output.apks
fi

# Check if apks directory exists and delete it
if [ -d "output/apks" ]; then
  echo "Deleting apks directory..."
  rm -rf output/apks
fi

# 1. Check if .aab exists
if [ -z "$AAB_FILE" ]; then
  echo "❌ No .aab file found in the current directory. Please ensure the build output is available."
  exit 1
fi

echo "✅ Found .aab file: $AAB_FILE"

# 2. Validate adb and device connection
if ! command -v adb &> /dev/null; then
  echo "❌ adb is not installed. Please install it via Homebrew or Android Studio."
  exit 1
fi

if ! adb devices | grep -q "device$"; then
  echo "❌ No device is connected. Please connect an Android device or start an emulator."
  exit 1
fi

# 3. Exit if bundletool not installed
if ! command -v bundletool &> /dev/null; then
  echo "❌ bundletool is not installed."
  read -p "Install bundletool using homebrew? (y/N): " installBundletool
  if [[ "$installBundletool" == "y" || "$installBundletool" == "Y" ]]; then
    brew install bundletool
  else
    exit 1
  fi
fi

# 4. Create device spec if not exists
if [ ! -f "$DEVICE_SPEC" ]; then
  echo "📝 Generating device spec from connected device..."
  bundletool get-device-spec --output="$DEVICE_SPEC"
else
  echo "✅ Device spec already exists."
fi

# 5. Build APKS
if [ ! -f "credentials/android/$KEYSTORE" ]; then
  echo "❌ Keystore file credentials/android/$KEYSTORE not found."
  exit 1
fi

echo "📦 Building optimized .apks..."
if ! bundletool build-apks \
  --bundle="$AAB_FILE" \
  --output=output/output.apks \
  --ks="credentials/android/$KEYSTORE" \
  --ks-key-alias="$KEY_ALIAS" \
  --ks-pass=pass:"$KEYSTORE_PASS" \
  --key-pass=pass:"$KEY_PASS" \
  --device-spec="$DEVICE_SPEC"; then
  echo "❌ bundletool failed to build .apks"
  exit 1
fi

# 6. Unzip result
rm -rf output/apks && mkdir output/apks
unzip -o output/output.apks -d output/apks

# 7. Optional: install on connected device
read -p "Do you want to install the APK on a connected device? (y/N): " installApk
if [[ "$installApk" == "y" || "$installApk" == "Y" ]]; then
  echo "📲 Installing APK..."
  bundletool install-apks --apks=output/output.apks
fi

echo "✅ Done. Optimized APKs are in ./apks/"