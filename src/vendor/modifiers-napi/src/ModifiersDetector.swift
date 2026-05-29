import Foundation
import CoreGraphics

public class ModifiersDetector {
    public static func currentModifierFlags() -> UInt64 {
        let flags = CGEventSource.flagsState(.combinedSessionState)
        return flags.rawValue
    }

    public static func isModifierPressed(_ flag: UInt64) -> Bool {
        let flags = currentModifierFlags()
        return (flags & flag) != 0
    }

    public static func getActiveModifiers() -> [String: Bool] {
        return [
            "shift": isModifierPressed(CGEventFlags.maskShift.rawValue),
            "control": isModifierPressed(CGEventFlags.maskControl.rawValue),
            "option": isModifierPressed(CGEventFlags.maskAlternate.rawValue),
            "command": isModifierPressed(CGEventFlags.maskCommand.rawValue),
            "capsLock": isModifierPressed(CGEventFlags.maskAlphaShift.rawValue),
            "function": isModifierPressed(CGEventFlags.maskSecondaryFn.rawValue),
        ]
    }

    public static func detectModifiersJson() -> String {
        let modifiers = getActiveModifiers()
        do {
            let data = try JSONSerialization.data(withJSONObject: modifiers, options: [])
            return String(data: data, encoding: .utf8) ?? "{}"
        } catch {
            return "{}"
        }
    }
}
