use crate::AppInfo;
use napi::Result;

#[cfg(target_os = "windows")]
pub fn get_frontmost_app_info() -> Result<Option<AppInfo>> {
    use winapi::um::winuser::{GetForegroundWindow, GetWindowThreadProcessId, GetWindowTextW};
    
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
    use objc::runtime::Object;
    use objc::{class, msg_send, sel, sel_impl};

    unsafe {
        // [NSWorkspace sharedWorkspace].frontmostApplication
        let workspace: *mut Object = msg_send![class!(NSWorkspace), sharedWorkspace];
        if workspace.is_null() {
            return Ok(None);
        }

        let app: *mut Object = msg_send![workspace, frontmostApplication];
        if app.is_null() {
            return Ok(None);
        }

        // bundleIdentifier -> NSString
        let bundle_id_ns: *mut Object = msg_send![app, bundleIdentifier];
        let bundle_id: String = if bundle_id_ns.is_null() {
            String::new()
        } else {
            let bytes: *const std::os::raw::c_char = msg_send![bundle_id_ns, UTF8String];
            if bytes.is_null() {
                String::new()
            } else {
                std::ffi::CStr::from_ptr(bytes)
                    .to_string_lossy()
                    .into_owned()
            }
        };

        // localizedName -> NSString
        let name_ns: *mut Object = msg_send![app, localizedName];
        let app_name: String = if name_ns.is_null() {
            String::new()
        } else {
            let bytes: *const std::os::raw::c_char = msg_send![name_ns, UTF8String];
            if bytes.is_null() {
                String::new()
            } else {
                std::ffi::CStr::from_ptr(bytes)
                    .to_string_lossy()
                    .into_owned()
            }
        };

        if bundle_id.is_empty() && app_name.is_empty() {
            return Ok(None);
        }

        Ok(Some(AppInfo { bundle_id, app_name }))
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
pub fn get_frontmost_app_info() -> Result<Option<AppInfo>> {
    // Linux/fallback
    Ok(None)
}
