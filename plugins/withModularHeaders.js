// plugins/withModularHeaders.js
const fs = require("fs");
const path = require("path");

module.exports = function withModularHeaders(config) {
  return {
    ...config,
    hooks: {
      postExpoPlugins: async (config) => {
        // Add a prebuild hook
        const originalMod = config.mods?.ios?.podfile || [];
        config.mods = {
          ...config.mods,
          ios: {
            ...config.mods?.ios,
            podfile: [
              ...originalMod,
              {
                // Add use_modular_headers! to the Podfile
                src: `use_modular_headers!`,
                lineSelector: /platform :ios.*/,
                prepend: true,
              },
            ],
          },
        };
        return config;
      },
    },
  };
};
