# Automatically read version from package.json using Node
APP_VERSION := `node -p "require('./package.json').version"`
APP_NAME := "PocketPlayer"

# Default recipe: list all available commands
default:
    @just --list

# --- AUTH & CREDENTIALS ---

# Interactive browser login to EAS CLI
login:
    pnpm dlx eas-cli login -b

# Fetch and manage project credentials interactively
credentials:
    pnpm dlx eas-cli credentials

# --- DEVICE CONFIGURATION ---

# Extract connected device specs for bundletool optimization
get-device-spec output_path="device-spec2.json":
    @echo "Extracting connected device specifications..."
    adb get-state > /dev/null 2>&1 || (echo "Error: No ADB device connected." && exit 1)
    bundletool get-device-spec --output={{ output_path }}
    @echo "Device spec saved to {{ output_path }}"

# --- BUILDS ---

# Build production/optimized AAB bundle locally
build-aab:
    mkdir -p builds
    pnpm dlx eas-cli build --clear-cache --platform android --profile preview-bundle --local

# 2. Extract Universal APK from AAB with Versioning
extract-universal-apk aab_file:
    mkdir -p builds
    @echo "Extracting Universal APK for {{ APP_NAME }} v{{ APP_VERSION }}..."
    bundletool build-apks --bundle={{ aab_file }} --output=builds/universal.apks --mode=universal --overwrite
    unzip -p builds/universal.apks universal.apk > "builds/{{ APP_NAME }}-v{{ APP_VERSION }}-universal.apk"
    rm builds/universal.apks
    @echo "Created: builds/{{ APP_NAME }}-v{{ APP_VERSION }}-universal.apk"

# 3. Extract arm64-v8a APK from AAB with Versioning
extract-arm64-apk aab_file spec_file="device-spec.json":
    mkdir -p builds
    @echo "Extracting arm64-v8a APK for {{ APP_NAME }} v{{ APP_VERSION }}..."
    bundletool build-apks --bundle={{ aab_file }} --output=builds/arm64.apks --device-spec={{ spec_file }} --overwrite
    unzip -p builds/arm64.apks standalones/standalone-arm64_v8a.apk > "builds/{{ APP_NAME }}-v{{ APP_VERSION }}-arm64-v8a.apk" 2>/dev/null || \
    unzip -p builds/arm64.apks universal.apk > "builds/{{ APP_NAME }}-v{{ APP_VERSION }}-arm64-v8a.apk"
    rm builds/arm64.apks
    @echo "Created: builds/{{ APP_NAME }}-v{{ APP_VERSION }}-arm64-v8a.apk"

# Extract BOTH APKs from an AAB file
extract-all-apks aab_file:
    just extract-universal-apk {{ aab_file }}
    just extract-arm64-apk {{ aab_file }}

# --- DEPLOYMENT & GITHUB RELEASES ---

# Deploy extracted APK directly to connected device via ADB
deploy-apk apk_file:
    @echo "Installing APK to connected device..."
    adb install -r {{ apk_file }}

# Create GitHub Release based on package.json version
# Usage: just release-github path/to/your.aab
release-github aab_file:
    @command -v gh >/dev/null 2>&1 || { echo "Error: GitHub CLI (gh) is not installed."; exit 1; }

    # 1. First extract both APKs from the AAB
    just extract-all-apks {{ aab_file }}

    # 2. Tag and publish to GitHub Releases
    @echo "Creating GitHub Release v{{ APP_VERSION }}..."
    gh release create "v{{ APP_VERSION }}" \
        "builds/{{ APP_NAME }}-v{{ APP_VERSION }}-universal.apk" \
        "builds/{{ APP_NAME }}-v{{ APP_VERSION }}-arm64-v8a.apk" \
        --title "{{ APP_NAME }} v{{ APP_VERSION }}" \
        --notes "Release {{ APP_NAME }} v{{ APP_VERSION }} with Universal and arm64-v8a APKs."