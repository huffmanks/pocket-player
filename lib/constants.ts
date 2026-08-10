import { Directory, Paths } from "expo-file-system";

import { SettingId } from "@/components/setting-switch";

export const VIDEOS_DIR = new Directory(Paths.document, "videos");
export const BASE_LOGO = require("@/assets/icons/base_logo.png");
export const VIDEO_PLACEHOLDER = require("@/assets/images/video-placeholder.jpg");

export const ESTIMATED_VIDEO_ITEM_HEIGHT = 157;
export const ESTIMATED_PLAYLIST_HEIGHT = 40;
export const ESTIMATED_PLAYLIST_ITEM_HEIGHT = 80;

export const BOTTOM_TABS_OFFSET = 100;

export const LOCK_INTERVAL_DEFAULT = 15000;
export const ERROR_SHAKE_OFFSET = 20;
export const ERROR_SHAKE_TIME = 80;

export const EXCLUDED_PATHS = ["/settings/passcode", "/lock", "/"];

export const settingsSwitches: { id: SettingId; label: string; description?: string }[] = [
  {
    id: "autoplay",
    label: "Autoplay",
  },
  {
    id: "loop",
    label: "Loop",
  },
  {
    id: "mute",
    label: "Mute",
  },
  {
    id: "isNativeControls",
    label: "Native video controls",
    description: "Use the native video player.",
  },
  {
    id: "overrideOrientation",
    label: "Override orientation",
    description: "Auto-switch to match video orientation.",
  },
];

export const orientationOptions = [
  { label: "Portrait", value: "Portrait" },
  { label: "Landscape", value: "Landscape" },
];

export const lockIntervalOptions = [
  { label: "Immediately", value: "0" },
  { label: "5 seconds", value: "5000" },
  { label: "15 seconds", value: "15000" },
  { label: "30 seconds", value: "30000" },
  { label: "1 minute", value: "60000" },
  { label: "5 minutes", value: "300000" },
];
