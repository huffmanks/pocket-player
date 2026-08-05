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
    "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900",
};

const fonts = {
  regular: fontStyle,
  medium: fontStyle,
  bold: fontStyle,
  heavy: fontStyle,
};

export const LIGHT_THEME = {
  dark: false,
  colors: NAV_THEME.light,
  fonts,
};

export const DARK_THEME = {
  dark: true,
  colors: NAV_THEME.dark,
  fonts,
};
