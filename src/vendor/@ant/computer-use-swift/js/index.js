const path = require("path");

if (process.platform !== "darwin") {
  throw new Error("@ant/computer-use-swift is only available on macOS");
}

// COMPUTER_USE_SWIFT_NODE_PATH: escape hatch for bundlers. Bun's --compile
// embeds the .node as an asset, not in a node_modules tree — __dirname is the
// exe dir and ../prebuilds/ doesn't exist. The consuming build bakes this var
// to the embedded asset's path. Unset → normal node_modules layout.
//
// Four methods use `Task { @MainActor in ... }` (captureExcluding,
// captureRegion, apps.listInstalled, resolvePrepareCapture) which enqueue
// onto DispatchQueue.main. Electron drains that queue via CFRunLoop; libuv
// (Node/bun) does not — the promises hang. Consumers running under libuv
// must pump `_drainMainRunLoop` via setInterval while those promises are
// pending. Consumers under Electron don't need to (CFRunLoop drains
// automatically).

// Try environment variable first (for bundled builds)
if (process.env.COMPUTER_USE_SWIFT_NODE_PATH) {
  try {
    const native = require(process.env.COMPUTER_USE_SWIFT_NODE_PATH);
    module.exports = native.computerUse;
  } catch (err) {
    // Fall through to architecture-specific loading
  }
}

// Architecture-specific loading (following audio-capture pattern)
if (!module.exports) {
  const platformDir = `${process.arch}-${process.platform}`;
  const fallbacks = [
    `./vendor/computer-use-swift/${platformDir}/computer_use.node`,
    `../prebuilds/computer_use.node`,
    path.resolve(__dirname, "../prebuilds/computer_use.node"),
  ];
  
  let loaded = false;
  for (const p of fallbacks) {
    try {
      const native = require(p);
      module.exports = native.computerUse;
      loaded = true;
      break;
    } catch (err) {
      // Try next fallback
    }
  }
  
  if (!loaded) {
    throw new Error(
      `Failed to load @ant/computer-use-swift native module. ` +
      `Tried: ${fallbacks.join(", ")}`
    );
  }
}
