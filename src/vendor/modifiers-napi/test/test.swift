import Foundation
import CoreGraphics

// Include the source directly for testing
// To compile and run:
//   swiftc -o /tmp/test_modifiers test/test.swift src/ModifiersDetector.swift src/bridge.swift
//   /tmp/test_modifiers

func testModifiersDetector() {
    // Test 1: currentModifierFlags() returns UInt64
    let flags = ModifiersDetector.currentModifierFlags()
    assert(type(of: flags) == UInt64.self, "currentModifierFlags should return UInt64")
    print("PASS: currentModifierFlags() returns UInt64: \(flags)")

    // Test 2: getActiveModifiers() returns dict with all 6 keys
    let modifiers = ModifiersDetector.getActiveModifiers()
    assert(modifiers.count == 6, "Should have 6 modifier keys")
    assert(modifiers["shift"] != nil, "Should have shift")
    assert(modifiers["control"] != nil, "Should have control")
    assert(modifiers["option"] != nil, "Should have option")
    assert(modifiers["command"] != nil, "Should have command")
    assert(modifiers["capsLock"] != nil, "Should have capsLock")
    assert(modifiers["function"] != nil, "Should have function")
    print("PASS: getActiveModifiers() returns all 6 keys: \(modifiers)")

    // Test 3: detectModifiersJson() returns valid JSON
    let json = ModifiersDetector.detectModifiersJson()
    assert(json.hasPrefix("{"), "Should be JSON object")
    assert(json.hasSuffix("}"), "Should be JSON object")
    print("PASS: detectModifiersJson() returns JSON: \(json)")

    // Test 4: Bridge functions work
    let cstr = ModifiersDetector_getActiveModifiersJson()
    assert(cstr != nil, "Bridge should return non-nil C string")
    let swiftStr = String(cString: cstr!)
    assert(swiftStr.hasPrefix("{"), "Bridge JSON should be valid")
    print("PASS: Bridge returns valid JSON: \(swiftStr)")
    ModifiersDetector_freeString(cstr)
    print("PASS: Bridge freeString works")

    print("\nAll tests passed!")
}

testModifiersDetector()
