const { withAndroidStyles } = require("expo/config-plugins");

/**
 * Custom Expo config plugin that modifies the Android theme
 * @param {import('expo/config').ExpoConfig} config - Expo config
 * @returns {import('expo/config').ExpoConfig} Modified config
 */

function withCustomAppTheme(config) {
  return withAndroidStyles(config, (config) => {
    const styles = config.modResults;

    let modified = false;

    styles.resources.style.forEach((style) => {
      if (style.$.name === "AppTheme") {
        if (!modified) {
          style.$.parent = "Theme.EdgeToEdge";
          style.item = [
            ...(style.item || []),
            {
              $: { name: "android:colorBackground" },
              _: "@color/activityBackground",
            },
            {
              $: { name: "android:textColor" },
              _: "@color/textColor",
            },
            {
              $: { name: "android:textColorHint" },
              _: "@color/textColorHint",
            },
          ];
          modified = true;
        }
      }
    });

    console.log("Successfully injected EXTRA_THEME_ITEMS into styles.xml");

    return config;
  });
}

module.exports = withCustomAppTheme;
