# Automatically load environment variables from .env
set dotenv-load

# Automatically read version from package.json using Node
APP_VERSION := `node -p "require('./package.json').version"`
APP_NAME := "PocketPlayer"

# Default recipe: list all available commands
default:
    @just --list

# --- AUTH & CREDENTIALS ---

# Interactive browser login to EAS CLI
login:
    pnpx eas-cli login -b

# Fetch and manage project credentials interactively
credentials:
    pnpx eas-cli credentials

# --- ENVIRONMENT & DEVICE CONFIGURATION ---

# Print exact toolchain, SDKs and runtime versions driving current builds
doctor:
    sh ./build-environment.sh

# Bump package.json version, app.json expo.version, and increment expo.android.versionCode by 1
bump version:
    @node -e '\
      const fs = require("fs"); \
      \
      const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")); \
      pkg.version = "{{version}}"; \
      fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n"); \
      \
      const app = JSON.parse(fs.readFileSync("app.json", "utf8")); \
      app.expo = app.expo || {}; \
      app.expo.android = app.expo.android || {}; \
      app.expo.version = "{{version}}"; \
      app.expo.android.versionCode = (app.expo.android.versionCode || 0) + 1; \
      fs.writeFileSync("app.json", JSON.stringify(app, null, 2) + "\n"); \
      \
      console.log(`Updated version to {{version}} and versionCode to ${app.expo.android.versionCode}`); \
    '

# --- BUILDS ---

# Build production/optimized AAB bundle locally
build-aab:
    mkdir -p builds
    pnpx eas-cli build --clear-cache --platform android --profile preview-bundle --local --output="builds/{{ APP_NAME }}-v{{ APP_VERSION }}.aab"

# Extract Universal APK from AAB with Versioning
extract-universal-apk aab_file:
    mkdir -p builds
    @echo "Extracting Universal APK for {{ APP_NAME }} v{{ APP_VERSION }}..."

    bundletool build-apks --bundle={{ aab_file }} --output=builds/universal.apks --mode=universal --overwrite \
        --ks=$KEYSTORE --ks-pass=pass:$KEYSTORE_PASS --ks-key-alias=$KEY_ALIAS --key-pass=pass:$KEY_PASS

    unzip -q -o builds/universal.apks universal.apk -d builds

    mv "builds/universal.apk" "builds/{{ APP_NAME }}-v{{ APP_VERSION }}-universal.apk"

    rm builds/universal.apks
    @echo "Created: builds/{{ APP_NAME }}-v{{ APP_VERSION }}-universal.apk"

# Extract Device-Specific APK set from AAB (requires connected ADB device)
extract-device-apks aab_file:
    mkdir -p builds
    @echo "Extracting device-specific APKS for {{ APP_NAME }} v{{ APP_VERSION }}..."

    bundletool build-apks --connected-device --bundle={{ aab_file }} --output=builds/device.apks --overwrite \
        --ks=$KEYSTORE --ks-pass=pass:$KEYSTORE_PASS --ks-key-alias=$KEY_ALIAS --key-pass=pass:$KEY_PASS

    @echo "Created: builds/device.apks"

# Build AAB and automatically extract APKs
build-and-extract:
    just build-aab
    just extract-universal-apk "builds/{{ APP_NAME }}-v{{ APP_VERSION }}.aab"
    just extract-device-apks "builds/{{ APP_NAME }}-v{{ APP_VERSION }}.aab"

# --- DEPLOYMENT & GITHUB RELEASES ---

# Deploy Universal APK directly
deploy-universal:
    @echo "Deploying universal APK to connected ADB device..."
    adb install -r "builds/{{ APP_NAME }}-v{{ APP_VERSION }}-universal.apk"

# Deploy Device-Specific APK set via bundletool
deploy-device:
    @echo "Deploying device-specific APKS to connected ADB device..."
    bundletool install-apks --apks=builds/device.apks

# Create GitHub Release based on package.json version
# Usage: just release-github
release-github:
    #!/usr/bin/env bash
    set -euo pipefail

    command -v gh >/dev/null 2>&1 || { echo "Error: GitHub CLI (gh) is not installed."; exit 1; }

    echo "Creating GitHub Release v{{ APP_VERSION }}..."

    PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || true)

    if [[ -n "$PREV_TAG" ]]; then
        git log "$PREV_TAG..HEAD" --oneline > release-notes.txt
    else
        git log -n 10 --oneline > release-notes.txt
    fi

    gh release create "v{{ APP_VERSION }}" \
        "builds/{{ APP_NAME }}-v{{ APP_VERSION }}-universal.apk" \
        "builds/{{ APP_NAME }}-v{{ APP_VERSION }}.aab" \
        --title "{{ APP_NAME }} v{{ APP_VERSION }}" \
        --notes-file release-notes.txt

    rm release-notes.txt
