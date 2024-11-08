import { documentDirectory } from "expo-file-system";

import { type Theme } from "@react-navigation/native";

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

export const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};

export const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

export const VIDEOS_DIR = `${documentDirectory}videos/`;
export const ESTIMATED_VIDEO_ITEM_HEIGHT = 157;
export const ESTIMATED_PLAYLIST_HEIGHT = 40;

export const DB_TABLES = ["videos"];

export const LOCK_SCREEN_TIMEOUT = 15000;
export const ERROR_SHAKE_OFFSET = 20;
export const ERROR_SHAKE_TIME = 80;

export const settingsSwitches = [
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
