const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withAndroidSecurityConfig = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const rootDir = config.modRequest.projectRoot;

      // Update MainActivity.kt
      const mainActivityPath = path.join(
        rootDir,
        "android/app/src/main/java",
        ...config.android.package.split("."),
        "MainActivity.kt"
      );

      if (fs.existsSync(mainActivityPath)) {
        let fileContent = fs.readFileSync(mainActivityPath, "utf8");

        // Check if the import for WindowManager exists
        if (!fileContent.includes("import android.view.WindowManager")) {
          fileContent = fileContent.replace(
            "import android.os.Bundle",
            "import android.os.Bundle\nimport android.view.WindowManager"
          );
        }

        // Add FLAG_SECURE line if it doesn't exist
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

      // Update styles.xml
      const stylesXml = path.join(rootDir, "android/app/src/main/res/values/styles.xml");

      if (fs.existsSync(stylesXml)) {
        let fileContent = fs.readFileSync(stylesXml, "utf8");

        // Update AppTheme to dark and add android:colorBackground
        if (
          !fileContent.includes(
            `<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">`
          )
        ) {
          fileContent = fileContent.replace(
            `<style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">`,
            `<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">\n\t<item name="android:colorBackground">@color/activityBackground</item>`
          );
        }

        // Update textColor to dynamic color
        if (!fileContent.includes(`<item name="android:textColor">@color/textColor</item>`)) {
          fileContent = fileContent.replaceAll(
            `<item name="android:textColor">@android:color/black</item>`,
            `<item name="android:textColor">@color/textColor</item>`
          );
        }

        // Update statusBarColor
        if (
          !fileContent.includes(
            `<item name="android:statusBarColor">@color/navigationBarColor</item>`
          )
        ) {
          fileContent = fileContent.replace(
            `<item name="android:statusBarColor">#09090b</item>`,
            `<item name="android:statusBarColor">@color/navigationBarColor</item>`
          );
        }

        // Update textColorHint
        if (
          !fileContent.includes(`<item name="android:textColorHint">@color/textColorHint</item>`)
        ) {
          fileContent = fileContent.replace(
            `<item name="android:textColorHint">#c8c8c8</item>`,
            `<item name="android:textColorHint">@color/textColorHint</item>`
          );
        }

        fs.writeFileSync(stylesXml, fileContent, "utf8");
        console.log("Successfully updated styles.xml");
      } else {
        console.warn("Skipping styles.xml file not found.");
      }

      // Update values/colors.xml
      const colorsXml = path.join(rootDir, "android/app/src/main/res/values/colors.xml");

      if (fs.existsSync(colorsXml)) {
        let fileContent = fs.readFileSync(colorsXml, "utf8");

        // Add textColor
        if (!fileContent.includes(`<color name="textColor">#fafafa</color>`)) {
          fileContent = fileContent.replace(
            `</resources>`,
            `\t<color name="textColor">#fafafa</color>\n</resources>`
          );
        }

        // Add textColorHint
        if (!fileContent.includes(`<color name="textColorHint">#a1a1aa</color>`)) {
          fileContent = fileContent.replace(
            `</resources>`,
            `\t<color name="textColorHint">#a1a1aa</color>\n</resources>`
          );
        }

        fs.writeFileSync(colorsXml, fileContent, "utf8");
        console.log("Successfully updated values/colors.xml");
      } else {
        console.warn("Skipping values/colors.xml file not found.");
      }

      return config;
    },
  ]);
};

module.exports = withAndroidSecurityConfig;
