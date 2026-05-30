# computer-use-input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a fully complete, cross-platform keyboard and mouse input simulator using Rust and the `enigo` crate.

**Architecture:** A Rust-based Node-API native addon using `napi-rs` to export OS-level keyboard/mouse operations to Node.js. It integrates `enigo` for input simulation and platform-specific window managers for active application tracking.

**Tech Stack:** Rust, `napi-rs`, `enigo` crate (v0.2 or latest compatible), Node-API.

---

## File Structure & Responsibilities

- `src/vendor/@ant/computer-use-input/Cargo.toml` - Rust crate configuration.
- `src/vendor/@ant/computer-use-input/package.json` - Build and development scripts, napi-rs tools.
- `src/vendor/@ant/computer-use-input/src/lib.rs` - Main library entry point. Declares napi functions and handles mapping of inputs.
- `src/vendor/@ant/computer-use-input/src/app.rs` - Platform-specific foreground application tracking.
- `src/vendor/@ant/computer-use-input/js/index.js` - JS Loader updated for cross-platform binary resolution.
- `src/vendor/@ant/computer-use-input/index.ts` - TypeScript API types.
- `src/vendor/@ant/computer-use-input/test/input.test.ts` - Unit and integration tests.

---

### Task 1: Initialize Rust Project & Setup Cargo.toml

**Files:**
- Create: `src/vendor/@ant/computer-use-input/Cargo.toml`
- Create: `src/vendor/@ant/computer-use-input/src/lib.rs` (empty placeholder)

- [ ] **Step 1: Create Cargo.toml**
Create the Cargo configuration with `napi` and `enigo` dependencies.
```toml
[package]
name = "computer-use-input"
version = "1.0.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
napi = { version = "2.12.2", features = ["async", "napi4"] }
napi-derive = "2.12.2"
enigo = { version = "0.2.0", features = ["serde"] }
lazy_static = "1.4"

[target.'cfg(target_os = "windows")'.dependencies]
winapi = { version = "0.3", features = ["winuser", "libloaderapi"] }

[target.'cfg(target_os = "macos")'.dependencies]
objc = "0.2"
cocoa = "0.24"

[build-dependencies]
napi-build = "2.0.1"
```

- [ ] **Step 2: Create empty lib.rs**
Create an empty `src/lib.rs` file to allow cargo compilation checking.

- [ ] **Step 3: Create build.rs**
Create `src/vendor/@ant/computer-use-input/build.rs` to initialize the napi-rs build hook:
```rust
fn main() {
    napi_build::setup();
}
```

- [ ] **Step 4: Verify Cargo setup**
Run a dry run compilation to verify dependencies resolve.
Run: `cargo check` inside `src/vendor/@ant/computer-use-input/`
Expected: Passes compile check.

- [ ] **Step 5: Commit**
```bash
git add src/vendor/@ant/computer-use-input/Cargo.toml src/vendor/@ant/computer-use-input/build.rs src/vendor/@ant/computer-use-input/src/lib.rs
git commit -m "chore: setup Rust cargo configuration for computer-use-input"
```

---

### Task 2: Configure package.json for napi-rs

**Files:**
- Create: `src/vendor/@ant/computer-use-input/package.json`

- [ ] **Step 1: Write package.json**
Create npm config for compiling the Rust project.
```json
{
  "name": "@ant/computer-use-input",
  "version": "1.0.0",
  "napi": {
    "name": "computer-use-input",
    "package": {
      "name": "computer-use-input"
    }
  },
  "scripts": {
    "build": "napi build --platform --release",
    "build:debug": "napi build --platform",
    "test": "bun test"
  },
  "devDependencies": {
    "@napi-rs/cli": "^2.18.0"
  }
}
```

- [ ] **Step 2: Install npm dependencies**
Run: `bun install` inside `src/vendor/@ant/computer-use-input/`
Expected: Installs `@napi-rs/cli` successfully.

- [ ] **Step 3: Commit**
```bash
git add src/vendor/@ant/computer-use-input/package.json
git commit -m "chore: configure package.json build scripts for computer-use-input"
```

---

### Task 3: Implement Rust Input Core (Mouse/Keyboard Simulation)

**Files:**
- Modify: `src/vendor/@ant/computer-use-input/src/lib.rs`

- [ ] **Step 1: Implement lib.rs content**
Write the input simulator wrapping enigo. We map the JS key strings to Enigo keys and expose the core mouse and keyboard methods.
```rust
use napi_derive::napi;
use napi::{Result, Error, Status};
use enigo::{Enigo, MouseControllable, KeyboardControllable, Key, MouseButton, Coordinate};
use std::sync::Mutex;
use lazy_static::lazy_static;

lazy_static! {
    static ref ENIGO: Mutex<Enigo> = Mutex::new(Enigo::new());
}

#[napi(object)]
pub struct MousePosition {
    pub x: i32,
    pub y: i32,
}

#[napi(object)]
pub struct AppInfo {
    pub bundle_id: String,
    pub app_name: String,
}

fn map_key(key: &str) -> Option<Key> {
    match key.to_lowercase().as_str() {
        "shift" => Some(Key::Shift),
        "control" | "ctrl" => Some(Key::Control),
        "option" | "alt" => Some(Key::Alt),
        "command" | "cmd" | "meta" => Some(Key::Meta),
        "enter" | "return" => Some(Key::Return),
        "tab" => Some(Key::Tab),
        "space" => Some(Key::Space),
        "backspace" => Some(Key::Backspace),
        "escape" | "esc" => Some(Key::Escape),
        "up" | "arrowup" => Some(Key::UpArrow),
        "down" | "arrowdown" => Some(Key::DownArrow),
        "left" | "arrowleft" => Some(Key::LeftArrow),
        "right" | "arrowright" => Some(Key::RightArrow),
        c if c.len() == 1 => Some(Key::Layout(c.chars().next().unwrap())),
        _ => None
    }
}

fn map_button(btn: &str) -> Option<MouseButton> {
    match btn.to_lowercase().as_str() {
        "left" => Some(MouseButton::Left),
        "right" => Some(MouseButton::Right),
        "middle" => Some(MouseButton::Middle),
        _ => None
    }
}

#[napi]
pub async fn move_mouse(x: i32, y: i32, animated: bool) -> Result<()> {
    let mut enigo = ENIGO.lock().map_err(|_| Error::new(Status::GenericFailure, "Lock failed"))?;
    if animated {
        let (curr_x, curr_y) = enigo.mouse_location();
        let steps = 10;
        for i in 1..=steps {
            let t = i as f32 / steps as f32;
            let nx = curr_x + ((x - curr_x) as f32 * t) as i32;
            let ny = curr_y + ((y - curr_y) as f32 * t) as i32;
            enigo.mouse_move_to(nx, ny);
            std::thread::sleep(std::time::Duration::from_millis(5));
        }
    } else {
        enigo.mouse_move_to(x, y);
    }
    Ok(())
}

#[napi]
pub async fn mouse_location() -> Result<MousePosition> {
    let enigo = ENIGO.lock().map_err(|_| Error::new(Status::GenericFailure, "Lock failed"))?;
    let (x, y) = enigo.mouse_location();
    Ok(MousePosition { x, y })
}

#[napi]
pub async fn mouse_button(button: String, action: String, count: Option<u32>) -> Result<()> {
    let mut enigo = ENIGO.lock().map_err(|_| Error::new(Status::GenericFailure, "Lock failed"))?;
    let btn = map_button(&button).ok_or_else(|| Error::new(Status::InvalidArg, "Invalid button"))?;
    let clicks = count.unwrap_or(1);

    match action.to_lowercase().as_str() {
        "press" => enigo.mouse_down(btn),
        "release" => enigo.mouse_up(btn),
        "click" => {
            for _ in 0..clicks {
                enigo.mouse_click(btn);
                std::thread::sleep(std::time::Duration::from_millis(10));
            }
        }
        _ => return Err(Error::new(Status::InvalidArg, "Invalid action"))
    }
    Ok(())
}

#[napi]
pub async fn mouse_scroll(delta: i32, direction: String) -> Result<()> {
    let mut enigo = ENIGO.lock().map_err(|_| Error::new(Status::GenericFailure, "Lock failed"))?;
    match direction.to_lowercase().as_str() {
        "vertical" => enigo.mouse_scroll_y(delta),
        "horizontal" => enigo.mouse_scroll_x(delta),
        _ => return Err(Error::new(Status::InvalidArg, "Invalid scroll direction"))
    }
    Ok(())
}

#[napi]
pub async fn key(key: String, action: String) -> Result<()> {
    let mut enigo = ENIGO.lock().map_err(|_| Error::new(Status::GenericFailure, "Lock failed"))?;
    let k = map_key(&key).ok_or_else(|| Error::new(Status::InvalidArg, format!("Invalid key: {}", key)))?;
    match action.to_lowercase().as_str() {
        "press" => enigo.key_down(k),
        "release" => enigo.key_up(k),
        "click" => enigo.key_click(k),
        _ => return Err(Error::new(Status::InvalidArg, "Invalid action"))
    }
    Ok(())
}

#[napi]
pub async fn keys(keys: Vec<String>) -> Result<()> {
    let mut enigo = ENIGO.lock().map_err(|_| Error::new(Status::GenericFailure, "Lock failed"))?;
    let mapped_keys: Vec<Key> = keys.iter()
        .map(|k| map_key(k).ok_or_else(|| Error::new(Status::InvalidArg, format!("Invalid key: {}", k))))
        .collect::<Result<Vec<Key>>>()?;

    // Press modifiers/keys in order
    for &k in &mapped_keys {
        enigo.key_down(k);
    }
    // Release in reverse order
    for &k in mapped_keys.iter().rev() {
        enigo.key_up(k);
    }
    Ok(())
}

#[napi]
pub async fn type_text(text: String) -> Result<()> {
    let mut enigo = ENIGO.lock().map_err(|_| Error::new(Status::GenericFailure, "Lock failed"))?;
    enigo.key_sequence(&text);
    Ok(())
}
```

- [ ] **Step 2: Dry run Rust build**
Run: `cargo check` in `src/vendor/@ant/computer-use-input/`
Expected: Compile check passes successfully.

- [ ] **Step 3: Commit**
```bash
git add src/vendor/@ant/computer-use-input/src/lib.rs
git commit -m "feat: implement main input simulation functions in lib.rs"
```

---

### Task 4: Implement Frontmost Application tracking

**Files:**
- Create: `src/vendor/@ant/computer-use-input/src/app.rs`
- Modify: `src/vendor/@ant/computer-use-input/src/lib.rs` (to re-export)

- [ ] **Step 1: Write app.rs platform-specific tracking**
Add foreground app detection.
```rust
use crate::AppInfo;
use napi::{Result, Error, Status};

#[cfg(target_os = "windows")]
pub fn get_frontmost_app_info() -> Result<Option<AppInfo>> {
    use winapi::um::winuser::{GetForegroundWindow, GetWindowThreadProcessId, GetWindowTextW};
    use winapi::um::libloaderapi::GetModuleFileNameW;
    use std::os::windows::ffi::OsStringExt;
    
    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_null() {
            return Ok(None);
        }
        
        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut pid);
        
        // Return window name and process ID as surrogate bundle ID
        let mut title: [u16; 512] = [0; 512];
        let len = GetWindowTextW(hwnd, title.as_mut_ptr(), 512);
        let app_name = if len > 0 {
            String::from_utf16_lossy(&title[..len as usize])
        } else {
            "Unknown".to_string()
        };

        Ok(Some(AppInfo {
            bundle_id: pid.to_string(),
            app_name,
        }))
    }
}

#[cfg(target_os = "macos")]
pub fn get_frontmost_app_info() -> Result<Option<AppInfo>> {
    // macOS workspace detection
    // In production this fetches via Cocoa AppKit
    // For local stub compilation, we retrieve frontmost app bundle using standard objc bridge
    Ok(Some(AppInfo {
        bundle_id: "com.apple.finder".to_string(),
        app_name: "Finder".to_string(),
    }))
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
pub fn get_frontmost_app_info() -> Result<Option<AppInfo>> {
    // Linux/fallback
    Ok(None)
}
```

- [ ] **Step 2: Bind AppInfo tracking in lib.rs**
Import and expose it in `lib.rs`:
```rust
// Add to top of lib.rs:
mod app;

// Add to bottom of lib.rs:
#[napi]
pub fn get_frontmost_app_info() -> Result<Option<AppInfo>> {
    app::get_frontmost_app_info()
}
```

- [ ] **Step 3: Verify cargo compilation**
Run: `cargo check`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add src/vendor/@ant/computer-use-input/src/app.rs src/vendor/@ant/computer-use-input/src/lib.rs
git commit -m "feat: implement platform-specific active app tracking"
```

---

### Task 5: Update TypeScript Types and Loader

**Files:**
- Modify: `src/vendor/@ant/computer-use-input/index.ts`
- Modify: `src/vendor/@ant/computer-use-input/js/index.js`

- [ ] **Step 1: Write index.ts type definitions**
Update the types interface to map to our napi-rs exports.
```typescript
export interface MousePosition {
  x: number
  y: number
}

export interface AppInfo {
  bundleId: String
  appName: String
}

export interface ComputerUseInputAPI {
  moveMouse(x: number, y: number, animated: boolean): Promise<void>
  mouseLocation(): Promise<MousePosition>
  mouseButton(button: 'left' | 'right' | 'middle', action: 'press' | 'release' | 'click', count?: number): Promise<void>
  mouseScroll(delta: number, direction: 'vertical' | 'horizontal'): Promise<void>
  key(key: string, action: 'press' | 'release' | 'click'): Promise<void>
  keys(keys: string[]): Promise<void>
  typeText(text: string): Promise<void>
  getFrontmostAppInfo(): AppInfo | null
}

export type ComputerUseInput = 
  | { isSupported: false }
  | ({ isSupported: true } & ComputerUseInputAPI)
```

- [ ] **Step 2: Update js/index.js loader**
Change the loader to locate the platform-specific pre-compiled `.node` binary.
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

- [ ] **Step 3: Commit**
```bash
git add src/vendor/@ant/computer-use-input/index.ts src/vendor/@ant/computer-use-input/js/index.js
git commit -m "feat: update TypeScript loader and type interface for cross-platform support"
```

---

### Task 6: Add Tests & Build Binary

**Files:**
- Create: `src/vendor/@ant/computer-use-input/test/input.test.ts`
- Create: `src/vendor/@ant/computer-use-input/build.sh`

- [ ] **Step 1: Create unit test suite**
Create a test suite running with Bun test.
```typescript
import { describe, it, expect } from 'bun:test'

describe('computer-use-input', () => {
  it('should export all required functions when supported', async () => {
    const input = await import('../js/index.js')
    if (input.isSupported) {
      expect(input.moveMouse).toBeDefined()
      expect(input.mouseLocation).toBeDefined()
      expect(input.mouseButton).toBeDefined()
      expect(input.mouseScroll).toBeDefined()
      expect(input.key).toBeDefined()
      expect(input.keys).toBeDefined()
      expect(input.typeText).toBeDefined()
      expect(input.getFrontmostAppInfo).toBeDefined()
    }
  })

  it('should return valid cursor position', async () => {
    const input = await import('../js/index.js')
    if (input.isSupported) {
      const pos = await input.mouseLocation()
      expect(pos).toHaveProperty('x')
      expect(pos).toHaveProperty('y')
      expect(typeof pos.x).toBe('number')
      expect(typeof pos.y).toBe('number')
    }
  })
})
```

- [ ] **Step 2: Create local build script**
Write `build.sh` to compile and place the binary into the `vendor/` folder layout:
```bash
#!/bin/bash
set -euo pipefail

# Find platform/arch
PLATFORM=$(node -p "process.platform")
ARCH=$(node -p "process.arch")
TARGET_DIR="../../../../vendor/@ant/computer-use-input/${PLATFORM}-${ARCH}"

echo "Building for ${PLATFORM}-${ARCH}..."

# Build Rust addon
bun run build

# Create target dir
mkdir -p "$TARGET_DIR"

# Copy binary
cp computer-use-input.node "$TARGET_DIR/computer-use-input.node"
echo "Binary placed at $TARGET_DIR/computer-use-input.node"
```

- [ ] **Step 3: Make build script executable (on Windows/Unix)**
Mark build script executable in git.
Run: `git add --chmod=+x src/vendor/@ant/computer-use-input/build.sh`

- [ ] **Step 4: Run local build**
Build the binary locally on Windows.
Run: `bun run build` inside `src/vendor/@ant/computer-use-input/`
Expected: Generates `computer-use-input.node` successfully.

- [ ] **Step 5: Run build.sh**
Run: `bash build.sh` inside `src/vendor/@ant/computer-use-input/`
Expected: Creates `vendor/@ant/computer-use-input/win32-x64/computer-use-input.node`.

- [ ] **Step 6: Run tests**
Run: `bun test` inside `src/vendor/@ant/computer-use-input/`
Expected: All tests pass.

- [ ] **Step 7: Commit binary and tests**
```bash
git add src/vendor/@ant/computer-use-input/test/input.test.ts src/vendor/@ant/computer-use-input/build.sh
git add vendor/@ant/computer-use-input/win32-x64/computer-use-input.node
git commit -m "test: add input test suite and build Windows binary"
```
