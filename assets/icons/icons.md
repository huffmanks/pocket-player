# App Icons Overview

This document describes the icons used for the app, their styles and how they were generated.

---

## Summary of Settings

| Setting            | Value      |
|--------------------|------------|
| **Base Icon File** | `base-icon.svg` |
| **Theme Color**    | `#14b8a6` |
| **Background Color** | `#09090b` |
| **Padding**        | 20%        |
| **Effects**        | None       |
| **Textures**       | None       |
| **Icon Generation Tool** | [IconKitchen](https://icon.kitchen) |

---

## Base Icon

The base icon used to generate all app icons is `base-icon.svg`. This icon is the source for creating adaptive, masked and themed icons for iOS, Android and web.

### Base Icon Details:
- **File Name**: `base-icon.svg`
- **Padding**: 20%
- **Effects**: None
- **Textures**: None

---

## Theme & Background Colors

- **Theme Color**: `#14b8a6`
- **Background Color**: `#09090b`

These colors were selected to align with the app's branding and to ensure the icon displays clearly across various platforms.

---

## Icon Generation Tool

All of the (adaptive, masked and themed icons for iOS, Android and web) were generated using [IconKitchen](https://icon.kitchen).

---

## Icon Types and Platforms

### 1. **Android Icons (Adaptive)**
Adaptive icons are used for Android devices, ensuring that the icons look great across all screen sizes and configurations.
- **Foreground Image**: Based on the base icon.
- **Background Color**: `#09090b`

### 2. **Web Icons**
For web, icons are used in the manifest to provide the app's icon for users who add it to their home screen or use it in a browser.
- **Icon Sizes**: 192x192, 512x512, 192x192 (maskable), 512x512 (maskable)
- **Background Color**: `#09090b`
- **Purpose**: Standard and maskable icons for PWA support.

### 3. **iOS Icons**
iOS icons are generated in various sizes to support different device resolutions.
- **Icon Sizes**: 1024x1024, 180x180 (apple-touch-icon.png)
- **Background Color**: `#09090b`

---
