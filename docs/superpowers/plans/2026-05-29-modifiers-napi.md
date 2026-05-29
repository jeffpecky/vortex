# modifiers-napi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Implement macOS keyboard modifier detection native addon using Swift + N-API

**Architecture:** Swift core calls CGEventSource API, Swift-to-C bridge exposes functions, C++ N-API wrapper binds to Node.js, TypeScript loader selects correct binary

**Tech Stack:** Swift 5.5+, node-addon-api, node-gyp, CGEventSource API, Bun test framework

---

## File Structure

**Create:**
- src/vendor/modifiers-napi-src/src/ModifiersDetector.swift
- src/vendor/modifiers-napi-src/src/bridge.swift  
- src/vendor/modifiers-napi-src/src/addon.cpp
- src/vendor/modifiers-napi-src/binding.gyp
- src/vendor/modifiers-napi-src/build.sh
- src/vendor/modifiers-napi-src/build-universal.sh
- src/vendor/modifiers-napi-src/package.json
- src/vendor/modifiers-napi-src/README.md
- src/vendor/modifiers-napi-src/test/unit.test.ts
- src/vendor/modifiers-napi-src/test/integration.test.ts
- src/vendor/modifiers-napi-src/test/manual.test.ts

**Modify:**
- src/vendor/modifiers-napi-src/index.ts

**Remove:**
- src/vendor/modifiers-napi/ (redundant wrapper)

---

## Task 1: Setup Directory Structure

**Files:**
- Create: src/vendor/modifiers-napi-src/src/
- Create: src/vendor/modifiers-napi-src/test/

- [ ] **Step 1: Create source directory**

Run: mkdir -p src/vendor/modifiers-napi-src/src

- [ ] **Step 2: Create test directory**

Run: mkdir -p src/vendor/modifiers-napi-src/test

- [ ] **Step 3: Remove redundant wrapper**

Run: rm -rf src/vendor/modifiers-napi

- [ ] **Step 4: Commit structure**

Run: git add src/vendor/modifiers-napi-src/ && git commit -m "chore: setup modifiers-napi directory structure"

---

## Task 2: Create package.json and Dependencies

**Files:**
- Create: src/vendor/modifiers-napi-src/package.json

- [ ] **Step 1: Create package.json**

Content: See spec for full package.json with node-addon-api dependency

- [ ] **Step 2: Install dependencies**

Run: cd src/vendor/modifiers-napi-src && npm install

- [ ] **Step 3: Commit**

Run: git add package.json package-lock.json && git commit -m "chore: add modifiers-napi dependencies"

---

## Task 3: Implement Swift Core (ModifiersDetector)

**Files:**
- Create: src/vendor/modifiers-napi-src/src/ModifiersDetector.swift

- [ ] **Step 1: Create Swift core implementation**

Implement ModifiersDetector class with CGEventSource.flagsState() - see spec section 2

- [ ] **Step 2: Verify Swift syntax**

Run: swiftc -parse src/ModifiersDetector.swift

- [ ] **Step 3: Commit**

Run: git add src/ModifiersDetector.swift && git commit -m "feat: add Swift modifier detection core"

---

## Task 4: Implement Swift-to-C Bridge

**Files:**
- Create: src/vendor/modifiers-napi-src/src/bridge.swift

- [ ] **Step 1: Create bridge with @_cdecl exports**

Implement bridge functions - see spec section 3

- [ ] **Step 2: Verify Swift syntax**

Run: swiftc -parse src/bridge.swift src/ModifiersDetector.swift

- [ ] **Step 3: Commit**

Run: git add src/bridge.swift && git commit -m "feat: add Swift-to-C bridge layer"

---

## Task 5: Implement N-API C++ Wrapper

**Files:**
- Create: src/vendor/modifiers-napi-src/src/addon.cpp

- [ ] **Step 1: Create C++ N-API wrapper**

Implement using node-addon-api - see spec section 3

- [ ] **Step 2: Commit**

Run: git add src/addon.cpp && git commit -m "feat: add N-API C++ wrapper"

---

## Task 6: Create Build Configuration

**Files:**
- Create: src/vendor/modifiers-napi-src/binding.gyp

- [ ] **Step 1: Create binding.gyp**

Configure node-gyp with Swift linking - see spec section 5

- [ ] **Step 2: Commit**

Run: git add binding.gyp && git commit -m "chore: add node-gyp build configuration"

---

## Task 7: Create Build Scripts

**Files:**
- Create: src/vendor/modifiers-napi-src/build.sh
- Create: src/vendor/modifiers-napi-src/build-universal.sh
- Create: src/vendor/modifiers-napi-src/README.md

- [ ] **Step 1: Create build.sh**

See spec section 5 for build script

- [ ] **Step 2: Create build-universal.sh**

Cross-arch build wrapper

- [ ] **Step 3: Make scripts executable**

Run: chmod +x build.sh build-universal.sh

- [ ] **Step 4: Create README**

Build instructions for developers

- [ ] **Step 5: Commit**

Run: git add build.sh build-universal.sh README.md && git commit -m "chore: add build scripts and documentation"

---

## Task 8: Update Loader

**Files:**
- Modify: src/vendor/modifiers-napi-src/index.ts

- [ ] **Step 1: Update loader with correct paths**

Update fallback paths to load from vendor/modifiers-napi/ - see spec section 4

- [ ] **Step 2: Commit**

Run: git add index.ts && git commit -m "fix: update loader paths for vendor directory"

---

## Task 9: Write Tests

**Files:**
- Create: src/vendor/modifiers-napi-src/test/unit.test.ts
- Create: src/vendor/modifiers-napi-src/test/integration.test.ts
- Create: src/vendor/modifiers-napi-src/test/manual.test.ts

- [ ] **Step 1: Write unit tests**

See spec section 6 for test implementation

- [ ] **Step 2: Write integration tests**

Platform detection and modifier tests

- [ ] **Step 3: Write manual test helper**

Interactive modifier detection test

- [ ] **Step 4: Commit**

Run: git add test/ && git commit -m "test: add modifiers-napi test suite"

---

## Task 10: Build Binaries

**Files:**
- Create: vendor/modifiers-napi/arm64-darwin/modifiers.node
- Create: vendor/modifiers-napi/x64-darwin/modifiers.node

- [ ] **Step 1: Build for current architecture**

Run: cd src/vendor/modifiers-napi-src && ./build.sh

Expected: Binary created at vendor/modifiers-napi/{arch}-darwin/modifiers.node

- [ ] **Step 2: Test binary loads**

Run: cd ../../.. && bun test src/vendor/modifiers-napi-src/test/unit.test.ts

Expected: Tests pass

- [ ] **Step 3: Build for other architecture (if available)**

Run: cd src/vendor/modifiers-napi-src && ./build-universal.sh

- [ ] **Step 4: Commit binaries**

Run: git add vendor/modifiers-napi/ && git commit -m "feat: add compiled modifiers-napi binaries"

---

## Task 11: Final Verification

- [ ] **Step 1: Run all tests**

Run: cd src/vendor/modifiers-napi-src && bun test

Expected: All tests pass

- [ ] **Step 2: Run manual test**

Run: bun test/manual.test.ts

Expected: Real-time modifier detection works

- [ ] **Step 3: Test in vortex CLI**

Run: cd ../../.. && bun run build && bun dist/cli.js

Expected: CLI runs without errors

- [ ] **Step 4: Final commit**

Run: git add -A && git commit -m "feat: complete modifiers-napi implementation"

---

## Success Criteria

- All automated tests pass
- Manual test shows real-time modifier detection
- Binaries exist for both arm64 and x64
- Loader correctly selects architecture
- Graceful fallback on non-macOS platforms
- No memory leaks in extended manual test
- vortex CLI builds and runs successfully
