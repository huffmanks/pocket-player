#!/usr/bin/env bash
set -euo pipefail

OUTPUT_FILE="build-environment.yaml"
SDK_ROOT="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"

node_version="$(node -v 2>/dev/null | sed 's/^v//' || echo "Not found")"
pnpm_version="$(pnpm -v 2>/dev/null || echo "Not found")"
java_version="$(java -version 2>&1 | head -n1 | sed -E 's/.*"([^"]+)".*/\1/' || echo "Not found")"
eas_version="$(pnpm dlx eas-cli --version 2>/dev/null | sed -E 's|.*eas-cli/([0-9]+\.[0-9]+\.[0-9]+).*|\1|' || echo "Not found")"
bundletool_version="$(bundletool version 2>/dev/null || echo "Not found")"

compile_sdk="$(grep '^android.compileSdkVersion=' android/gradle.properties 2>/dev/null | cut -d= -f2 || true)"
target_sdk="$(grep '^android.targetSdkVersion=' android/gradle.properties 2>/dev/null | cut -d= -f2 || true)"
min_sdk="$(grep '^android.minSdkVersion=' android/gradle.properties 2>/dev/null | cut -d= -f2 || true)"
build_tools="$(grep '^android.buildToolsVersion=' android/gradle.properties 2>/dev/null | cut -d= -f2 || true)"

sdk_platforms="Not found"
sdk_sources="Not found"
cmdline_tools="Not found"
cmake="Not found"
ndk="Not found"

if [[ -n "$SDK_ROOT" && -d "$SDK_ROOT" ]]; then
    [[ -d "$SDK_ROOT/platforms" ]] && sdk_platforms="$(find "$SDK_ROOT/platforms" -mindepth 1 -maxdepth 1 -not -name '.*' -exec basename {} \; | sort | paste -sd ', ' -)"
    [[ -d "$SDK_ROOT/sources" ]] && sdk_sources="$(find "$SDK_ROOT/sources" -mindepth 1 -maxdepth 1 -not -name '.*' -exec basename {} \; | sort | paste -sd ', ' -)"
    [[ -x "$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" ]] && cmdline_tools="$("$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --version 2>&1 | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -n1)"
    [[ -d "$SDK_ROOT/cmake" ]] && cmake="$(find "$SDK_ROOT/cmake" -mindepth 1 -maxdepth 1 -not -name '.*' -exec basename {} \; | sort -V | tail -n1)"
    [[ -d "$SDK_ROOT/ndk" ]] && ndk="$(find "$SDK_ROOT/ndk" -mindepth 1 -maxdepth 1 -not -name '.*' -exec basename {} \; | sort -V | tail -n1)"
fi

platform_tools_revision="Not found"
adb_version="Not found"

if [[ -x "$SDK_ROOT/platform-tools/adb" ]]; then
    adb_raw="$("$SDK_ROOT/platform-tools/adb" --version 2>/dev/null)"
    adb_version="$(echo "$adb_raw" | grep -i 'version' | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1 || echo "Unknown")"

    if [[ -f "$SDK_ROOT/platform-tools/source.properties" ]]; then
        platform_tools_revision="$(grep '^Pkg.Revision=' "$SDK_ROOT/platform-tools/source.properties" 2>/dev/null | cut -d= -f2 || echo "Unknown")"
    else
        platform_tools_revision="$(echo "$adb_raw" | grep -i 'revision' | sed -E 's/.*[Rr]evision[: ]+([^ ]+).*/\1/' || echo "Unknown")"
    fi
fi

emulator_version="Not found"
emulator_build_id="Not found"
installed_avds="None"

if [[ -x "$SDK_ROOT/emulator/emulator" ]]; then
    emu_raw="$("$SDK_ROOT/emulator/emulator" -version 2>/dev/null | head -n1)"
    emulator_version="$(echo "$emu_raw" | grep -oE 'version [0-9]+\.[0-9]+\.[0-9]+(\.[0-9]+)?' | awk '{print $2}' || echo "Unknown")"
    emulator_build_id="$(echo "$emu_raw" | grep -oE 'build_id [0-9]+' | awk '{print $2}' || echo "Unknown")"

    avd_list="$("$SDK_ROOT/emulator/emulator" -list-avds 2>/dev/null | paste -sd ', ' - || true)"
    [[ -n "$avd_list" ]] && installed_avds="$avd_list"
fi

running_avd="None"

if command -v adb &>/dev/null || [[ -x "$SDK_ROOT/platform-tools/adb" ]]; then
    adb_bin="${SDK_ROOT}/platform-tools/adb"
    command -v adb &>/dev/null && adb_bin="adb"

    active_emu="$("$adb_bin" devices -l 2>/dev/null | grep 'emulator-' | awk '{print $1}' | head -n1 || true)"
    if [[ -n "$active_emu" ]]; then
        emu_model="$("$adb_bin" -s "$active_emu" shell getprop ro.product.model 2>/dev/null || echo "Unknown")"
        emu_api="$("$adb_bin" -s "$active_emu" shell getprop ro.build.version.sdk 2>/dev/null || echo "Unknown")"
        running_avd="$active_emu ($emu_model, API $emu_api)"
    fi
fi

android_studio="$(defaults read "/Applications/Android Studio.app/Contents/Info" CFBundleShortVersionString 2>/dev/null || echo "Not found")"

echo "=== BUILD ENVIRONMENT TOOLCHAIN ==="
printf "%-20s %s\n" "Node:" "$node_version"
printf "%-20s %s\n" "pnpm:" "$pnpm_version"
printf "%-20s %s\n" "Java:" "$java_version"
printf "%-20s %s\n" "EAS CLI:" "$eas_version"
printf "%-20s %s\n" "bundletool:" "$bundletool_version"

echo
echo "=== PROJECT SDK & BUILD SETTINGS ==="
printf "%-20s %s\n" "compileSdkVersion:" "$compile_sdk"
printf "%-20s %s\n" "targetSdkVersion:" "$target_sdk"
printf "%-20s %s\n" "minSdkVersion:" "$min_sdk"
printf "%-20s %s\n" "buildToolsVersion:" "$build_tools"

echo
echo "=== ANDROID STUDIO ==="
printf "%-20s %s\n" "Android Studio:" "$android_studio"

echo
echo "=== INSTALLED ANDROID SDK COMPONENTS ==="
printf "%-20s %s\n" "SDK Platforms:" "$sdk_platforms"
printf "%-20s %s\n" "Sources:" "$sdk_sources"
printf "%-20s %s\n" "Platform Tools:"
printf "  %-18s %s\n" "Revision:" "$platform_tools_revision"
printf "  %-18s %s\n" "ADB Version:" "$adb_version"
printf "%-20s %s\n" "Command-line Tools:" "$cmdline_tools"
printf "%-20s %s\n" "Emulator:"
printf "  %-18s %s\n" "Version:" "$emulator_version"
printf "  %-18s %s\n" "Build ID:" "$emulator_build_id"
printf "  %-18s %s\n" "Installed AVDs:" "$installed_avds"
printf "  %-18s %s\n" "Running AVD:" "$running_avd"
printf "%-20s %s\n" "CMake:" "$cmake"
printf "%-20s %s\n" "NDK:" "$ndk"

cat >"$OUTPUT_FILE" <<EOF
toolchain:
    node: "$node_version"
    pnpm: "$pnpm_version"
    java: "$java_version"
    easCli: "$eas_version"
    bundletool: "$bundletool_version"

project:
    compileSdkVersion: "$compile_sdk"
    targetSdkVersion: "$target_sdk"
    minSdkVersion: "$min_sdk"
    buildToolsVersion: "$build_tools"

androidStudio:
    version: "$android_studio"

androidSdk:
    platforms: "$sdk_platforms"
    sources: "$sdk_sources"
    platformTools:
        revision: "$platform_tools_revision"
        adbVersion: "$adb_version"
    commandLineTools: "$cmdline_tools"
    emulator:
        version: "$emulator_version"
        buildId: "$emulator_build_id"
        installedAvds: "$installed_avds"
        runningAvd: "$running_avd"
    cmake: "$cmake"
    ndk: "$ndk"

EOF

echo
echo "Saved build environment to $OUTPUT_FILE"