const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Custom Expo config plugin that adds FLAG_SECURE to Android MainActivity
 * Prevents screenshots and screen recording of the app for security
 * @param {import('expo/config').ExpoConfig} config - Expo config
 * @returns {import('expo/config').ExpoConfig} Modified config
 */

const withFlagSecure = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const rootDir = config.modRequest.projectRoot;

      const mainActivityPath = path.join(
        rootDir,
        "android/app/src/main/java",
        ...config.android.package.split("."),
        "MainActivity.kt"
      );

      if (fs.existsSync(mainActivityPath)) {
        let fileContent = fs.readFileSync(mainActivityPath, "utf8");

        if (!fileContent.includes("import android.view.WindowManager")) {
          fileContent = fileContent.replace(
            "import android.os.Bundle",
            "import android.os.Bundle\nimport android.view.WindowManager"
          );
        }

        if (!fileContent.includes("window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)")) {
          fileContent = fileContent.replace(
            "super.onCreate(null)",
            "super.onCreate(null)\n\t\twindow.addFlags(WindowManager.LayoutParams.FLAG_SECURE)"
          );
        }

        fs.writeFileSync(mainActivityPath, fileContent, "utf8");
        console.log("Successfully injected FLAG_SECURE into MainActivity.kt");
      } else {
        console.warn("Skipping MainActivity.kt file not found.");
      }

      return config;
    },
  ]);
};

module.exports = withFlagSecure;
