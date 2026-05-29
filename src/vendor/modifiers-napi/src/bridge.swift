import Foundation

@_cdecl("ModifiersDetector_getActiveModifiersJson")
public func ModifiersDetector_getActiveModifiersJson() -> UnsafeMutablePointer<CChar>? {
    let json = ModifiersDetector.detectModifiersJson()
    let cString = strdup(json)
    return cString
}

@_cdecl("ModifiersDetector_freeString")
public func ModifiersDetector_freeString(_ ptr: UnsafeMutablePointer<CChar>?) {
    if let ptr = ptr {
        free(ptr)
    }
}
