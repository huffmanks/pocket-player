const { withAndroidColors } = require("expo/config-plugins");

/**
 * Custom Expo config plugin that adds custom colors to colors.xml
 * @param {import('expo/config').ExpoConfig} config - Expo config
 * @returns {import('expo/config').ExpoConfig} Modified config
 */

function withCustomColors(config) {
  return withAndroidColors(config, (config) => {
    const colors = config.modResults;

    const customColors = [
      {
        $: { name: "textColor" },
        _: "#fafafa",
      },
      {
        $: { name: "textColorHint" },
        _: "#a1a1aa",
      },
    ];

    customColors.forEach((color) => {
      const existingColorIndex = colors.resources.color.findIndex(
        (c) => c.$ && c.$.name === color.$.name
      );

      if (existingColorIndex !== -1) {
        colors.resources.color[existingColorIndex] = color;
      } else {
        colors.resources.color.push(color);
      }
    });

    console.log("Successfully injected CUSTOM_COLORS into colors.xml");

    return config;
  });
}

module.exports = withCustomColors;
