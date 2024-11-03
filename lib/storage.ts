import { MMKV } from "react-native-mmkv";

export const themeStorage = new MMKV({ id: "themeStorage" });
export const lockScreenStorage = new MMKV({ id: "lockScreenStorage" });
export const settingsStorage = new MMKV({ id: "settingsStorage" });
