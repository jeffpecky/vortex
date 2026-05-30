import Foundation
import AppKit
import ScreenCaptureKit
import CoreGraphics

public class ComputerUseSwiftCore {
    // ── Display ──────────────────────────────────────────────────────────
    public static func getDisplaySize(_ displayId: Int32) -> String {
        // Return JSON with width, height, scaleFactor for target display
        let screens = NSScreen.screens
        let screen = screens.first // Simplification: return primary screen size
        let width = screen?.frame.width ?? 1920
        let height = screen?.frame.height ?? 1080
        let scaleFactor = screen?.backingScaleFactor ?? 1.0
        return "{\"width\":\(width),\"height\":\(height),\"scaleFactor\":\(scaleFactor)}"
    }

    public static func listAllDisplays() -> String {
        let screens = NSScreen.screens
        var results: [String] = []
        for (i, screen) in screens.enumerated() {
            let width = screen.frame.width
            let height = screen.frame.height
            let scaleFactor = screen.backingScaleFactor
            results.append("{\"id\":\(i),\"width\":\(width),\"height\":\(height),\"scaleFactor\":\(scaleFactor)}")
        }
        return "[\(results.joined(separator: ","))]"
    }

    // ── App Management ───────────────────────────────────────────────────
    public static func listInstalledApps() -> String {
        let fileManager = FileManager.default
        let appDirs = ["/Applications", "/System/Applications"]
        var apps: [String] = []
        for dir in appDirs {
            do {
                let contents = try fileManager.contentsOfDirectory(atPath: dir)
                for item in contents where item.hasSuffix(".app") {
                    let path = "\(dir)/\(item)"
                    let appName = item.replacingOccurrences(of: ".app", with: "")
                    // Try to resolve bundle ID
                    if let bundle = Bundle(path: path), let bundleId = bundle.bundleIdentifier {
                        apps.append("{\"bundleId\":\"\(bundleId)\",\"displayName\":\"\(appName)\",\"path\":\"\(path)\"}")
                    }
                }
            } catch {}
        }
        return "[\(apps.joined(separator: ","))]"
    }

    public static func listRunningApps() -> String {
        let running = NSWorkspace.shared.runningApplications
        var results: [String] = []
        for app in running where app.activationPolicy == .regular {
            if let bundleId = app.bundleIdentifier, let appName = app.localizedName {
                results.append("{\"bundleId\":\"\(bundleId)\",\"displayName\":\"\(appName)\"}")
            }
        }
        return "[\(results.joined(separator: ","))]"
    }

    public static func openApp(_ bundleId: String) -> Bool {
        if let appUrl = NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundleId) {
            NSWorkspace.shared.open(appUrl)
            return true
        }
        return false
    }

    // ── Screenshot ────────────────────────────────────────────────────────
    public static func captureExcluding(_ allowedBundleIds: [String], _ quality: Float, _ targetW: Int32, _ targetH: Int32, _ displayId: Int32) -> String {
        // Return dummy base64 string for local stubs (ScreenCaptureKit is async, requires MainActor dispatcher)
        // Production: Captures ScreenCaptureKit frame, encodes to JPEG, converts to base64
        return "{\"base64\":\"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=\",\"width\":\(targetW),\"height\":\(targetH)}"
    }
}
