import { documentDirectory } from "expo-file-system";

import { DefaultTheme, type Theme } from "@react-navigation/native";

import { SettingId } from "@/components/setting-switch";

export const NAV_THEME = {
  light: {
    background: "rgb(255, 255, 255)",
    border: "rgb(227, 227, 235)",
    card: "rgb(239, 239, 240)",
    notification: "rgb(255, 86, 86)",
    primary: "rgb(26, 26, 36)",
    text: "rgb(9, 9, 12)",
    brand: "rgb(13, 150, 139)",
    brandForeground: "rgb(20, 184, 165)",
  },
  dark: {
    background: "rgb(9, 9, 11)",
    border: "rgb(35, 35, 41)",
    card: "rgb(21, 21, 24)",
    notification: "rgb(217, 58, 58)",
    primary: "rgb(250, 250, 250)",
    text: "rgb(250, 250, 250)",
    brand: "rgb(13, 150, 139)",
    brandForeground: "rgb(20, 184, 165)",
  },
};

export const SLIDER_THEME = {
  thumbTintColor: NAV_THEME.dark.brandForeground,
  thumbDisabledTintColor: "rgb(52, 52, 52)",
  minimumTrackTintColor: "rgb(248, 250, 252)",
  maximumTrackTintColor: "rgb(31, 36, 43)",
};

const fontStyle = {
  fontFamily: "Arial",
  fontWeight: "normal" as
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900",
};

const fonts = {
  regular: fontStyle,
  medium: fontStyle,
  bold: fontStyle,
  heavy: fontStyle,
};

export const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: NAV_THEME.light,
  fonts,
};

export const DARK_THEME: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: NAV_THEME.dark,
  fonts,
};

export const VIDEOS_DIR = `${documentDirectory}videos/`;
export const ESTIMATED_VIDEO_ITEM_HEIGHT = 157;
export const ESTIMATED_PLAYLIST_HEIGHT = 40;
export const ESTIMATED_PLAYLIST_ITEM_HEIGHT = 80;

export const BOTTOM_TABS_OFFSET = 100;

export const LOCK_INTERVAL_DEFAULT = 15000;
export const ERROR_SHAKE_OFFSET = 20;
export const ERROR_SHAKE_TIME = 80;

export const EXCLUDED_PATHS = ["/passcode", "/lock", "/"];

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
