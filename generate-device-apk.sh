#!/bin/bash

set -e

if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
elif [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

KEYSTORE="${KEYSTORE:-pocket-player-release-key.jks}"
KEY_ALIAS="${KEY_ALIAS:-pocket-player-key}"
KEYSTORE_PASS="${KEYSTORE_PASS:-supersecretpass}"
KEY_PASS="${KEY_PASS:-supersecretpass}"
DEVICE_SPEC="${DEVICE_SPEC:-device-spec.json}"
AAB_FILE=$(find . -name "*.aab" | head -n 1)

# 1. Check if .aab exists
if [ -z "$AAB_FILE" ]; then
  echo "❌ No .aab file found in the current directory. Please ensure the build output is available."
  exit 1
fi

echo "✅ Found .aab file: $AAB_FILE"

# 2. Generate keystore if not exists
mkdir -p output

if [ ! -f "output/$KEYSTORE" ]; then
  echo "🔑 Generating keystore..."
  keytool -genkeypair \
    -v \
    -keystore "output/$KEYSTORE" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias "$KEY_ALIAS" \
    -storepass "$KEYSTORE_PASS" \
    -keypass "$KEY_PASS" \
    -dname "CN=Kevin Huffman, OU=Dev, O=Company, L=City, S=State, C=US"
else
  echo "✅ Keystore already exists."
fi

# 3. Validate adb and device connection
if ! command -v adb &> /dev/null; then
  echo "❌ adb is not installed. Please install it via Homebrew or Android Studio."
  exit 1
fi

if ! adb devices | grep -q "device$"; then
  echo "❌ No device is connected. Please connect an Android device or start an emulator."
  exit 1
fi

# 4. Create device spec if not exists
if [ ! -f "$DEVICE_SPEC" ]; then
  echo "📝 Generating device spec from connected device..."
  bundletool get-device-spec --output="$DEVICE_SPEC"
else
  echo "✅ Device spec already exists."
fi

# 5. Exit if bundletool not installed
if ! command -v bundletool &> /dev/null; then
  echo "❌ bundletool is not installed. Install it using:"
  echo "brew install bundletool"
  exit 1
fi

# 6. Build APKS archive
echo "📦 Building optimized .apks..."
bundletool build-apks \
  --bundle="$AAB_FILE" \
  --output=output/output.apks \
  --ks="output/$KEYSTORE" \
  --ks-key-alias="$KEY_ALIAS" \
  --ks-pass=pass:"$KEYSTORE_PASS" \
  --key-pass=pass:"$KEY_PASS" \
  --device-spec="$DEVICE_SPEC"

# 7. Unzip result
rm -rf output/apks && mkdir output/apks
unzip -o output/output.apks -d output/apks

# 8. Optional: install on connected device
read -p "Do you want to install the APK on a connected device? (y/N): " install
if [[ "$install" == "y" || "$install" == "Y" ]]; then
  echo "📲 Installing APK..."
  bundletool install-apks --apks=output.apks
fi

echo "✅ Done. Optimized APKs are in ./apks/"