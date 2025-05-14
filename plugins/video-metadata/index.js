const {
  createRunOncePlugin,
  withMainApplication,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withVideoMetadata = (config) => {
  config = withMainApplication(config, (config) => {
    const { modResults } = config;

    if (
      !modResults.contents.includes(
        "import com.anonymous.pocketplayer.videometadata.VideoMetadataPackage"
      )
    ) {
      modResults.contents = modResults.contents.replace(
        "package com.anonymous.pocketplayer",
        "package com.anonymous.pocketplayer\n\nimport com.anonymous.pocketplayer.videometadata.VideoMetadataPackage"
      );
    }

    if (!modResults.contents.includes("packages.add(VideoMetadataPackage())")) {
      modResults.contents = modResults.contents.replace(
        "val packages = PackageList(this).packages",
        "val packages = PackageList(this).packages\n\t\t\t\t\t\tpackages.add(VideoMetadataPackage())"
      );
    }

    return config;
  });

  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidMain = path.join(projectRoot, "android", "app", "src", "main");
      const javaDir = path.join(
        androidMain,
        "java",
        "com",
        "anonymous",
        "pocketplayer",
        "videometadata"
      );

      fs.mkdirSync(javaDir, { recursive: true });

      // VideoMetadataModule.java
      const videoMetadataModuleSourcePath = path.join(
        projectRoot,
        "plugins",
        "video-metadata",
        "VideoMetadataModule.java"
      );
      const videoMetadataModuleDestPath = path.join(javaDir, "VideoMetadataModule.java");
      const videoMetadataModuleJavaCode = fs.readFileSync(videoMetadataModuleSourcePath, "utf8");
      fs.writeFileSync(videoMetadataModuleDestPath, videoMetadataModuleJavaCode);

      // VideoMetadataPackage.java
      const videoMetadataPackageSourcePath = path.join(
        projectRoot,
        "plugins",
        "video-metadata",
        "VideoMetadataPackage.java"
      );
      const videoMetadataPackageDestPath = path.join(javaDir, "VideoMetadataPackage.java");
      const videoMetadataPackageJavaCode = fs.readFileSync(videoMetadataPackageSourcePath, "utf8");
      fs.writeFileSync(videoMetadataPackageDestPath, videoMetadataPackageJavaCode);

      return config;
    },
  ]);

  return config;
};

module.exports = createRunOncePlugin(withVideoMetadata, "video-metadata-plugin", "1.0.0");
