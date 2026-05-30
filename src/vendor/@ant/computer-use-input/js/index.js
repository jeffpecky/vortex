const path = require("path");

const supportedPlatforms = [
  { platform: "darwin", arch: "arm64" },
  { platform: "darwin", arch: "x64" },
  { platform: "win32", arch: "x64" },
  { platform: "linux", arch: "x64" }
];

const isPlatformSupported = supportedPlatforms.some(
  p => p.platform === process.platform && p.arch === process.arch
);

if (!isPlatformSupported) {
  module.exports = { isSupported: false };
} else {
  // Bundled mode override vs default vendor directory layout.
  // Binaries live at vendor/computer-use-input/<arch>-<platform>/computer-use-input.node
  // Following the audio-capture pattern with fallback paths:
  // 1. From bundled cli.js at root: ./vendor/computer-use-input/...
  // 2. From this file in src/vendor/@ant/computer-use-input/js/: ../../../../../vendor/computer-use-input/...
  const platformDir = `${process.arch}-${process.platform}`;
  const binaryPath = process.env.COMPUTER_USE_INPUT_NODE_PATH ??
    path.resolve(__dirname, `../../../../../vendor/computer-use-input/${platformDir}/computer-use-input.node`);
  
  try {
    const native = require(binaryPath);
    module.exports = { isSupported: true, ...native };
  } catch (err) {
    // Try fallback for bundled mode
    try {
      const fallbackPath = `./vendor/computer-use-input/${platformDir}/computer-use-input.node`;
      const native = require(fallbackPath);
      module.exports = { isSupported: true, ...native };
    } catch {
      module.exports = { isSupported: false, error: err.message };
    }
  }
}
