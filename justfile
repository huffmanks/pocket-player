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

# Build standalone APK locally
build-apk:
    mkdir -p builds
    pnpm dlx eas-cli build --clear-cache --platform android --profile preview --local

# --- DEPLOYMENT ---

# Build APKS from AAB and deploy directly to connected device
# Example usage: just deploy-aab path/to/app.aab
deploy-aab aab_file:
    @echo "Checking ADB connection..."
    adb get-state > /dev/null 2>&1 || (echo "Error: No ADB device connected." && exit 1)
    @echo "Building APKS from {{ aab_file }}..."
    bundletool build-apks --bundle={{ aab_file }} --output=builds/app.apks --connected-device --overwrite
    @echo "Installing APKS to device..."
    bundletool install-apks --apks=builds/app.apks

# Install standard APK directly to connected device
# Example usage: just deploy-apk path/to/app.apk
deploy-apk apk_file:
    @echo "Installing APK to connected device..."
    adb install -r {{ apk_file }}