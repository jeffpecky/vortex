# Design Spec: Computer-Use Native Addons

**Date:** 2026-05-29  
**Status:** Approved  
**Topic:** Complete implementation of `computer-use-input` (Rust/enigo) and `computer-use-swift` (Swift/AppKit/ScreenCaptureKit) to replace existing stubs.

---

## 1. Goal

Implement full, production-grade native addons for the `@ant/computer-use-input` and `@ant/computer-use-swift` packages. These packages enable terminal-driven OS automation (keyboard/mouse simulation, screen capture, application management) for Claude Code's computer-use mode.

- **`computer-use-input`**: Cross-platform (Windows, macOS, Linux) input simulator and active app tracker using Rust and the `enigo` crate.
- **`computer-use-swift`**: macOS-specific screen capture, application listing/manipulation, and TCC permissions resolver using Swift.

---

## 2. Architecture & Directory Layout

We follow the established pre-compiled binary distribution pattern (similar to `audio-capture` and `modifiers-napi`):

1. **Source Code**: Sits in `src/vendor/@ant/computer-use-input/` and `src/vendor/@ant/computer-use-swift/`.
2. **TypeScript Loaders**: Sit in the same directories, serving as the package entry points that load the compiled binaries.
3. **Pre-compiled Binaries**: Checked into git at `vendor/@ant/computer-use-input/` and `vendor/@ant/computer-use-swift/` sorted by platform and architecture.

```
src/vendor/@ant/computer-use-input/
  ├── src/                    # Rust source code (lib.rs, input.rs, app.rs)
  ├── Cargo.toml              # Rust configuration
  ├── package.json            # npm package dependencies (napi-rs, typescript)
  ├── js/index.js             # JavaScript loader (cross-platform)
  ├── index.ts                # TypeScript types
  ├── build.sh                # Local build script
  └── test/                   # Unit & integration tests

src/vendor/@ant/computer-use-swift/
  ├── src/                    # Swift + C++ sources (addon.cpp, bridge.swift, Core.swift)
  ├── binding.gyp             # node-gyp configuration
  ├── package.json            # npm package dependencies (node-addon-api)
  ├── js/index.js             # JavaScript loader
  ├── index.ts                # TypeScript types
  ├── build.sh                # Local build script
  ├── build-universal.sh      # Universal macOS build script
  └── test/                   # Swift and TS tests

vendor/@ant/computer-use-input/
  ├── win32-x64/computer-use-input.node
  ├── darwin-arm64/computer-use-input.node
  ├── darwin-x64/computer-use-input.node
  └── linux-x64/computer-use-input.node

vendor/@ant/computer-use-swift/
  ├── darwin-arm64/computer_use.node
  └── darwin-x64/computer_use.node
```

---

## 3. Detailed Design: `computer-use-input` (Rust)

`computer-use-input` is implemented using Rust's `napi-rs` framework for Node-API bindings, and the `enigo` crate for simulating mouse/keyboard events.

### 3.1 APIs Exposed to Node-API

```rust
// Mouse control
pub async fn move_mouse(x: i32, y: i32, animated: bool) -> Result<()>
pub async fn mouse_location() -> Result<MousePosition>
pub async fn mouse_button(button: String, action: String, count: Option<u32>) -> Result<()>
pub async fn mouse_scroll(delta: i32, direction: String) -> Result<()>

// Keyboard control
pub async fn key(key: String, action: String) -> Result<()>
pub async fn keys(keys: Vec<String>) -> Result<()>
pub async fn type_text(text: String) -> Result<()>

// Application Tracking
pub fn get_frontmost_app_info() -> Result<Option<AppInfo>>
```

### 3.2 Implementation Strategy

1. **Input Simulation (`enigo`)**:
   - Instantiate a global or thread-local `Enigo` simulator.
   - Map JavaScript string key names (e.g. `"shift"`, `"control"`, `"command"`, `"a"`, `"enter"`) to Enigo's `Key` enum values.
   - Handle platform-specific mappings (e.g., `"command"` maps to `Key::Meta` on macOS/Windows/Linux).
   - Implement smooth animated mouse moves (if `animated == true`) using linear interpolation over a short duration.

2. **Frontmost Application Detection**:
   - **macOS**: Use `Cocoa` / `AppKit` APIs (`NSWorkspace.shared.frontmostApplication`) via Rust objc bindings or raw Objective-C wrapper.
   - **Windows**: Use `winapi` crate to call `GetForegroundWindow` -> `GetWindowThreadProcessId` -> `GetModuleFileNameExW`/`QueryFullProcessImageNameW`.
   - **Linux**: Query X11 `_NET_ACTIVE_WINDOW` using the `x11` crate (fallback to Wayland protocols if active, but X11/XTest is primary for Enigo).

3. **CFRunLoop Pumping on macOS**:
   - Key/mouse events on macOS must run on AppKit's main run loop to register correctly in target apps.
   - Use `dispatch2::run_on_main` (or a similar GCD utility) to submit mouse/keyboard events to `DispatchQueue.main` on macOS, while Windows/Linux operations can run on thread-pool tasks.

---

## 4. Detailed Design: `computer-use-swift` (macOS Swift)

`computer-use-swift` is macOS-only, implementing system-wide actions using Swift's AppKit, ScreenCaptureKit, and NSWorkspace, with a C++ `node-addon-api` wrapper that links statically to the Swift library.

### 4.1 C++ Addon Interface (`addon.cpp`)

The C++ addon exposes a single exports object containing the `computerUse` namespace:

```cpp
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    Napi::Object computerUseObj = Napi::Object::New(env);
    
    // Display namespace
    Napi::Object displayObj = Napi::Object::New(env);
    displayObj.Set("getSize", Napi::Function::New(env, DisplayGetSize));
    displayObj.Set("listAll", Napi::Function::New(env, DisplayListAll));
    computerUseObj.Set("display", displayObj);

    // Screenshot namespace
    Napi::Object screenshotObj = Napi::Object::New(env);
    screenshotObj.Set("captureExcluding", Napi::Function::New(env, CaptureExcluding));
    screenshotObj.Set("captureRegion", Napi::Function::New(env, CaptureRegion));
    computerUseObj.Set("screenshot", screenshotObj);

    // Apps namespace
    Napi::Object appsObj = Napi::Object::New(env);
    appsObj.Set("prepareDisplay", Napi::Function::New(env, AppsPrepareDisplay));
    appsObj.Set("previewHideSet", Napi::Function::New(env, AppsPreviewHideSet));
    appsObj.Set("findWindowDisplays", Napi::Function::New(env, AppsFindWindowDisplays));
    appsObj.Set("appUnderPoint", Napi::Function::New(env, AppsAppUnderPoint));
    appsObj.Set("listInstalled", Napi::Function::New(env, AppsListInstalled));
    appsObj.Set("iconDataUrl", Napi::Function::New(env, AppsIconDataUrl));
    appsObj.Set("listRunning", Napi::Function::New(env, AppsListRunning));
    appsObj.Set("open", Napi::Function::New(env, AppsOpen));
    computerUseObj.Set("apps", appsObj);

    // Top-level
    computerUseObj.Set("resolvePrepareCapture", Napi::Function::New(env, ResolvePrepareCapture));

    exports.Set("computerUse", computerUseObj);
    return exports;
}
```

### 4.2 Swift-C Bridge (`bridge.swift` & `Core.swift`)

1. **Screen Capture**:
   - Use `ScreenCaptureKit` (introduced in macOS 12.3) for screenshot capturing.
   - `captureExcluding`: Build a `SCContentFilter` excluding specific bundle IDs (like the terminal surrogate host) and capture the screen image using `SCScreenshotManager.captureImage`.
   - Compress the resulting `CGImage` into JPEG format using `CGImageDestination` with `SCREENSHOT_JPEG_QUALITY`.
   - Convert binary data to base64 string and return to C++ bridge.

2. **App Management**:
   - Use `NSWorkspace.shared` APIs.
   - `listInstalled`: Crawl `/Applications`, `/System/Applications`, and user applications. Parse `.app` packages for Info.plist to get bundle ID and display name.
   - `iconDataUrl`: Use `NSWorkspace.shared.icon(forFile:)` to retrieve an `NSImage`, convert it to PNG/JPEG bitmap, base64 encode it, and wrap in a `data:image/png;base64,...` URL.
   - `listRunning`: Use `NSWorkspace.shared.runningApplications` to get running apps with valid bundle IDs.
   - `open`: Use `NSWorkspace.shared.openApplication(at:configuration:completionHandler:)` to activate/launch apps.

3. **Window Management & Hiding**:
   - Use CoreGraphics Window Server APIs (`CGWindowListCopyWindowInfo`) to inspect window layering and identify bounding rectangles for apps.
   - Hide specific apps (non-allowlisted apps) using AppKit functions like `runningApp.hide()`.

---

## 5. TypeScript Loader Integration

We update `js/index.js` loaders to dynamically discover and load the compiled `.node` binaries from the target path:

### 5.1 `computer-use-input` Loader (`js/index.js`)

```javascript
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
```

---

## 6. Testing Strategy

1. **Rust Tests (`computer-use-input/test/`)**:
   - TS unit tests using Bun `describe`/`it` blocks verifying exports exist.
   - Local validation of mouse/keyboard input simulation where possible (or asserting no crash on simulated inputs).
   - Validation that `get_frontmost_app_info` returns the active IDE/terminal bundle name.

2. **Swift Tests (`computer-use-swift/test/`)**:
   - Unit tests for screenshooting and app discovery using mock targets.
   - Validate that screen geometries return valid dimensions (e.g. width > 0, height > 0).
   - Validate that installed apps lists at least Safari/Finder.

---

## 7. Review Checklist & Safety Gates

1. **Main Thread Deadlocks**: Ensure C++ N-API callbacks do not block the V8 thread while waiting for Swift GCD dispatches. Pumping must be handled properly using asynchronous Promises.
2. **Permission Prompts**: Screen capture and input simulation trigger macOS TCC prompts (Screen Recording, Accessibility). The code must fail gracefully with descriptive error messages (e.g. "Screen recording permission denied") instead of crashing if permissions are absent.
3. **No Stuck Modifiers**: All keyboard functions must include a robust `finally` or destructor block that releases any pressed modifiers (shift, control, option, command) in case of unexpected execution failures.
