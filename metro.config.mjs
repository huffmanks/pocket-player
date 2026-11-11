import { getDefaultConfig } from "expo/metro-config";
import { withNativeWind } from "nativewind/dist/metro/index.js";

const config = getDefaultConfig(import.meta.dirname);
config.resolver.sourceExts.push("sql");

export default withNativeWind(config, { input: "./global.css" });
