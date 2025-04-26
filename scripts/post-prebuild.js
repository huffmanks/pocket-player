const fs = require("fs");
const path = require("path");

const mainActivityPath = path.join(
  __dirname,
  "..",
  "android/app/src/main/java/com/anonymous/videoplayerapp/MainActivity.kt"
);

// Check if MainActivity.kt exists
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

const stylesXml = path.join(__dirname, "..", "android/app/src/main/res/values/styles.xml");

// Check if styles.xml exists
if (fs.existsSync(stylesXml)) {
  let fileContent = fs.readFileSync(stylesXml, "utf8");

  // Update AppTheme to dark
  if (
    !fileContent.includes(`<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">`)
  ) {
    fileContent = fileContent.replace(
      `<style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">`,
      `<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">`
    );
  }

  // Update textColor to white
  if (!fileContent.includes(`name="android:textColor">@android:color/white`)) {
    fileContent = fileContent.replaceAll(
      `name="android:textColor">@android:color/black`,
      `name="android:textColor">@android:color/white`
    );
  }

  fs.writeFileSync(stylesXml, fileContent, "utf8");
  console.log("Successfully updated styles.xml");
} else {
  console.warn("Skipping styles.xml file not found.");
}
