import Foundation

@_cdecl("computer_use_display_get_size")
public func display_get_size(_ displayId: Int32) -> UnsafeMutablePointer<CChar>? {
    let json = ComputerUseSwiftCore.getDisplaySize(displayId)
    return strdup(json)
}

@_cdecl("computer_use_display_list_all")
public func display_list_all() -> UnsafeMutablePointer<CChar>? {
    let json = ComputerUseSwiftCore.listAllDisplays()
    return strdup(json)
}

@_cdecl("computer_use_apps_list_installed")
public func apps_list_installed() -> UnsafeMutablePointer<CChar>? {
    let json = ComputerUseSwiftCore.listInstalledApps()
    return strdup(json)
}

@_cdecl("computer_use_apps_list_running")
public func apps_list_running() -> UnsafeMutablePointer<CChar>? {
    let json = ComputerUseSwiftCore.listRunningApps()
    return strdup(json)
}

@_cdecl("computer_use_apps_open")
public func apps_open(_ bundleId: UnsafePointer<CChar>?) -> Int32 {
    guard let bundleId = bundleId, let bundleStr = String(validatingUTF8: bundleId) else {
        return 0
    }
    return ComputerUseSwiftCore.openApp(bundleStr) ? 1 : 0
}

@_cdecl("computer_use_screenshot_capture_excluding")
public func screenshot_capture_excluding(
    _ allowedBundleIdsJson: UnsafePointer<CChar>?,
    _ quality: Float,
    _ targetW: Int32,
    _ targetH: Int32,
    _ displayId: Int32
) -> UnsafeMutablePointer<CChar>? {
    // Parse allowlist JSON if present, otherwise pass empty array
    var allowedList: [String] = []
    if let cStr = allowedBundleIdsJson,
       let jsonStr = String(validatingUTF8: cStr),
       let data = jsonStr.data(using: .utf8),
       let parsed = try? JSONSerialization.jsonObject(with: data) as? [String] {
        allowedList = parsed
    }
    let json = ComputerUseSwiftCore.captureExcluding(allowedList, quality, targetW, targetH, displayId)
    return strdup(json)
}

@_cdecl("computer_use_free_string")
public func computer_use_free_string(_ ptr: UnsafeMutablePointer<CChar>?) {
    if let ptr = ptr {
        free(ptr)
    }
}
