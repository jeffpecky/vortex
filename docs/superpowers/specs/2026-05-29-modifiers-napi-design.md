# modifiers-napi Native Addon Implementation

**Date:** 2026-05-29  
**Status:** Design Approved  
**Purpose:** Implement macOS keyboard modifier detection for vortex completeness

## Overview

Implement modifiers-napi as a native Swift addon that detects keyboard modifier keys (Shift, Control, Option, Command, CapsLock, Function) on macOS using CGEventSource API. This matches the pattern used in Claude Code's computer-use-swift package.

## Goals

1. **Completeness** - Make vortex feature-complete with Claude Code's native addons
2. **Industry Standard** - Use Swift + node-addon-api (C++) following best practices
3. **Cross-Architecture** - Support both arm64 and x64 macOS
4. **Developer Friendly** - Clear build workflow and testing strategy

## Architecture

### Directory Structure

```
src/vendor/modifiers-napi-src/
├── src/
│   ├── ModifiersDetector.swift    # Core Swift logic
│   ├── bridge.swift                # Swift-to-C bridge
│   └── addon.cpp                   # N-API C++ wrapper
├── test/
│   ├── unit.test.ts
│   ├── integration.test.ts
│   └── manual.test.ts
├── binding.gyp                     # node-gyp config
├── build.sh                        # Build script
├── build-universal.sh              # Multi-arch build
├── package.json
├── README.md
└── index.ts                        # Loader (existing)

vendor/modifiers-napi/              # Compiled binaries
├── arm64-darwin/
│   └── modifiers.node
└── x64-darwin/
    └── modifiers.node
```

### Components

1. **Swift Core** - Uses CGEventSource.flagsState() for system-wide modifier detection
2. **Swift-to-C Bridge** - Exposes Swift functions with @_cdecl for C interop
3. **N-API C++ Wrapper** - Uses node-addon-api for type-safe Node.js bindings
4. **TypeScript Loader** - Loads correct binary for architecture with fallbacks
5. **Build System** - node-gyp + Swift compilation with output to vendor/

## Implementation Details

### API Surface

```typescript
export function getModifiers(): string[]
export function isModifierPressed(modifier: string): boolean
export function prewarm(): void
```

Supported modifiers: shift, control, option, command, capslock, function

### Swift Implementation

- Uses CGEventSource.flagsState(.combinedSessionState) for system-wide detection
- Maps CGEventFlags to modifier names
- Case-insensitive modifier matching
- Returns empty array when no modifiers pressed

### N-API Bindings

- node-addon-api (C++) for industry-standard wrapper
- RAII memory management (no leaks)
- Proper error handling and type checking
- Direct array construction (no JSON parsing)

### Loader Pattern

Follows audio-capture-src pattern:
- Env var support for bundled mode (MODIFIERS_NODE_PATH)
- Fallback paths for bundled and dev modes
- Graceful fallback on non-macOS platforms
- Returns empty/false when binary unavailable

### Build System

- Swift compilation: swiftc with -emit-library
- C++ compilation: node-gyp with node-addon-api
- Links CoreGraphics and Foundation frameworks
- Outputs to vendor/modifiers-napi/{arch}-darwin/
- Supports both arm64 and x64 architectures

## Developer Workflow

1. **Update source:** Edit files in src/vendor/modifiers-napi-src/src/
2. **Build:** Run ./build.sh (current arch) or ./build-universal.sh (both)
3. **Test:** Run bun test for automated tests, bun test:manual for interactive
4. **Commit:** Commit updated binaries in vendor/modifiers-napi/
5. **Distribute:** Other developers pull pre-compiled binaries (no compilation needed)

## Testing Strategy

### Automated Tests
- Unit tests: API contract, error handling, edge cases
- Integration tests: Platform detection, all modifiers, fallback behavior
- Run with: bun test

### Manual Testing
- Interactive test script shows real-time modifier detection
- Verify all 6 modifiers work correctly
- Test on both arm64 and x64 (if available)
- Run with: bun test:manual

### Verification Checklist
- Platform detection (macOS vs non-macOS)
- Architecture support (arm64 and x64)
- All modifiers detected correctly
- Case-insensitive modifier names
- Graceful fallback when binary missing
- No memory leaks (extended manual test)
- Real-time detection accuracy

## Key Design Decisions

1. **Swift over Rust** - macOS-only addon, matches computer-use-swift pattern
2. **CGEventSource API** - System-wide detection, works for CLI tools
3. **node-addon-api** - Industry standard, type-safe, RAII memory management
4. **Pre-compiled binaries** - Checked into git, no user compilation required
5. **Source in src/vendor/** - Matches Anthropic pattern, self-contained with loader
6. **Remove modifiers-napi wrapper** - Import directly from modifiers-napi-src

## Future Considerations

- Could add Windows/Linux support if needed (would require Rust rewrite)
- Could add more modifier detection (NumLock, ScrollLock on other platforms)
- Could add modifier event callbacks (not just polling)
- Build automation via CI/CD for multi-arch compilation

## References

- computer-use-swift: src/vendor/@ant/computer-use-swift/
- audio-capture-src: src/vendor/audio-capture-src/
- CGEventSource docs: Apple Core Graphics documentation
- node-addon-api: https://github.com/nodejs/node-addon-api
