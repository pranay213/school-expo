// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const fs = require("fs");
const path = require("path");

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  // Add this hook
  hooks: {
    postExpoPrebuilds: async ({ platform, projectRoot }) => {
      if (platform === "ios") {
        const podfilePath = path.join(projectRoot, "ios", "Podfile");

        if (fs.existsSync(podfilePath)) {
          let podfileContent = fs.readFileSync(podfilePath, "utf8");

          // Add use_modular_headers! if it doesn't already exist
          if (!podfileContent.includes("use_modular_headers!")) {
            podfileContent = podfileContent.replace(
              /platform :ios[^\n]*\n/,
              "$&use_modular_headers!\n"
            );

            fs.writeFileSync(podfilePath, podfileContent);
            console.log("Added use_modular_headers! to Podfile");
          }
        }
      }
    },
  },
};
