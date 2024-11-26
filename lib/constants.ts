import { documentDirectory } from "expo-file-system";

import { type Theme } from "@react-navigation/native";

import { SettingId } from "@/components/setting-switch";

export const NAV_THEME = {
  light: {
    background: "hsl(0 0% 100%)",
    border: "hsl(240 5.9% 90%)",
    card: "hsl(0 0% 100%)",
    notification: "hsl(0 84.2% 60.2%)",
    primary: "hsl(240 5.9% 10%)",
    text: "hsl(240 10% 3.9%)",
  },
  dark: {
    background: "hsl(240 10% 3.9%)",
    border: "hsl(240 3.7% 15.9%)",
    card: "hsl(240 10% 3.9%)",
    notification: "hsl(0 72% 51%)",
    primary: "hsl(0 0% 98%)",
    text: "hsl(0 0% 98%)",
  },
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
  dark: false,
  colors: NAV_THEME.light,
  fonts,
};

export const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
  fonts,
};

export const VIDEOS_DIR = `${documentDirectory}videos/`;
export const ESTIMATED_VIDEO_ITEM_HEIGHT = 157;
export const ESTIMATED_PLAYLIST_HEIGHT = 40;
export const ESTIMATED_PLAYLIST_ITEM_HEIGHT = 80;

export const LOCK_SCREEN_TIMEOUT = 15000;
export const ERROR_SHAKE_OFFSET = 20;
export const ERROR_SHAKE_TIME = 80;

export const settingsSwitches: { id: SettingId; label: string }[] = [
  {
    id: "mute",
    label: "Mute",
  },
  {
    id: "loop",
    label: "Loop",
  },
  {
    id: "autoplay",
    label: "Autoplay",
  },
];

export const orientationOptions = [
  { label: "Portrait", value: "Portrait" },
  { label: "PortraitUpsideDown", value: "PortraitUpsideDown" },
  { label: "Landscape", value: "Landscape" },
  { label: "LandscapeRight", value: "LandscapeRight" },
  { label: "LandscapeLeft", value: "LandscapeLeft" },
];
