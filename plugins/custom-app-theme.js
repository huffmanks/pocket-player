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

    styles.resources.style = styles.resources.style || [];

    const hasEdgeToEdge = styles.resources.style.some(s => s.$.name === "Theme.EdgeToEdge");
    if (!hasEdgeToEdge) {
      styles.resources.style.push({
        $: {
          name: "Theme.EdgeToEdge",
          parent: "Theme.AppCompat.DayNight.NoActionBar"
        },
        item: [
          { $: { name: "android:navigationBarColor" }, _: "@android:color/transparent" },
          { $: { name: "android:statusBarColor" }, _: "@android:color/transparent" },
          { $: { name: "android:windowDrawsSystemBarBackgrounds" }, _: "true" }
        ]
      });
    }

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
