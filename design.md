# App Design Overview

This document outlines the app’s design, including themes, logos and asset generation.

---

## Summary of Settings

| Setting            | Value      |
|--------------------|------------|
| **Base Logo File** | `base_logo_.svg` |
| **Theme Color**    | `#14b8a6` |
| **Background Color** | `#09090b` |
| **Padding**        | 20%        |
| **Effects**        | None       |
| **Textures**       | None       |
| **Logo Generation Tool** | [IconKitchen](https://icon.kitchen) |

---

## Base Logo

The base logo used to generate all app logos is `base_logo.svg`. This logo is the source for creating adaptive, masked and themed logos for iOS, Android and web.

### Base Logo Details:
- **File Name**: `base_logo_.svg`
- **Padding**: 20%
- **Effects**: None
- **Textures**: None

---

## Theme & Background Colors

- **Theme Color**: `#14b8a6`
- **Background Color**: `#09090b`

These colors were selected to align with the app's branding and to ensure the logo displays clearly across various platforms.

---

## Logo Generation Tool

All of the (adaptive, masked and themed logos for iOS, Android and web) were generated using [IconKitchen](https://icon.kitchen).

---

## Logo Types and Platforms

### 1. **Android Icons (Adaptive)**
Adaptive icons are used for Android devices, ensuring that the icons look great across all screen sizes and configurations.
- **Foreground Image**: Based on the base logo.
- **Background Color**: `#09090b`

### 2. **Web Icons**
For web, icons are used in the manifest to provide the app's icon for users who add it to their home screen or use it in a browser.
- **Logo Sizes**: 192x192, 512x512, 192x192 (maskable), 512x512 (maskable)
- **Background Color**: `#09090b`
- **Purpose**: Standard and maskable icons for PWA support.

### 3. **iOS Icons**
iOS icons are generated in various sizes to support different device resolutions.
- **Logo Sizes**: 1024x1024, 180x180 (ios_app_logo_marketing.png, web_apple_touch_logo.png)
- **Background Color**: `#09090b`

---

## App Screenshot Generation
All app screenshots were made using [Progressier](https://progressier.com/pwa-screenshots-generator).