export const NAV_THEME = {
  light: {
    background: "#ffffff",
    border: "#e3e3eb",
    card: "#efeff0",
    notification: "#ff5656",
    primary: "#1a1a24",
    text: "#09090c",
    brand: "#0d968b",
    brandForeground: "#14b8a5",
  },
  dark: {
    background: "#09090b",
    border: "#232329",
    card: "#151518",
    notification: "#d93a3a",
    primary: "#fafafa",
    text: "#fafafa",
    brand: "#0d968b",
    brandForeground: "#14b8a5",
  },
};

export const SLIDER_THEME = {
  thumbTintColor: NAV_THEME.dark.brandForeground,
  thumbDisabledTintColor: "#343434",
  minimumTrackTintColor: "#f8fafc",
  maximumTrackTintColor: "#1f242b",
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
