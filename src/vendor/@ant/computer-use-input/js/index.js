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
  // Bundled mode override vs default vendor directory layout
  const binaryPath = process.env.COMPUTER_USE_INPUT_NODE_PATH ??
    path.resolve(__dirname, `../../../../vendor/@ant/computer-use-input/${process.platform}-${process.arch}/computer-use-input.node`);
  
  try {
    const native = require(binaryPath);
    module.exports = { isSupported: true, ...native };
  } catch (err) {
    module.exports = { isSupported: false, error: err.message };
  }
}
