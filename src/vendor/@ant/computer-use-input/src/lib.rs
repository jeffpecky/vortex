mod app;

use enigo::{Enigo, Key, Button, Direction, Settings, Coordinate, Axis, Keyboard, Mouse};
use napi_derive::napi;
use napi::{Result, Error, Status};

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
        c if c.len() == 1 => Some(Key::Unicode(c.chars().next().unwrap())),
        _ => None
    }
}

fn map_button(btn: &str) -> Option<Button> {
    match btn.to_lowercase().as_str() {
        "left" => Some(Button::Left),
        "right" => Some(Button::Right),
        "middle" => Some(Button::Middle),
        _ => None
    }
}

#[napi]
pub async fn move_mouse(x: i32, y: i32, animated: bool) -> Result<()> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| Error::new(Status::GenericFailure, format!("Enigo error: {:?}", e)))?;
    if animated {
        let (curr_x, curr_y) = enigo.location().map_err(|e| Error::new(Status::GenericFailure, format!("Failed to get location: {:?}", e)))?;
        let steps = 10;
        for i in 1..=steps {
            let t = i as f32 / steps as f32;
            let nx = curr_x + ((x - curr_x) as f32 * t) as i32;
            let ny = curr_y + ((y - curr_y) as f32 * t) as i32;
            enigo.move_mouse(nx, ny, Coordinate::Abs).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to move mouse: {:?}", e)))?;
            std::thread::sleep(std::time::Duration::from_millis(5));
        }
    } else {
        enigo.move_mouse(x, y, Coordinate::Abs).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to move mouse: {:?}", e)))?;
    }
    Ok(())
}

#[napi]
pub async fn mouse_location() -> Result<MousePosition> {
    let enigo = Enigo::new(&Settings::default()).map_err(|e| Error::new(Status::GenericFailure, format!("Enigo error: {:?}", e)))?;
    let (x, y) = enigo.location().map_err(|e| Error::new(Status::GenericFailure, format!("Failed to get location: {:?}", e)))?;
    Ok(MousePosition { x, y })
}

#[napi]
pub async fn mouse_button(button: String, action: String, count: Option<u32>) -> Result<()> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| Error::new(Status::GenericFailure, format!("Enigo error: {:?}", e)))?;
    let btn = map_button(&button).ok_or_else(|| Error::new(Status::InvalidArg, "Invalid button"))?;
    let clicks = count.unwrap_or(1);

    match action.to_lowercase().as_str() {
        "press" => enigo.button(btn, Direction::Press).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to press button: {:?}", e)))?,
        "release" => enigo.button(btn, Direction::Release).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to release button: {:?}", e)))?,
        "click" => {
            for _ in 0..clicks {
                enigo.button(btn, Direction::Click).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to click button: {:?}", e)))?;
                std::thread::sleep(std::time::Duration::from_millis(10));
            }
        }
        _ => return Err(Error::new(Status::InvalidArg, "Invalid action"))
    }
    Ok(())
}

#[napi]
pub async fn mouse_scroll(delta: i32, direction: String) -> Result<()> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| Error::new(Status::GenericFailure, format!("Enigo error: {:?}", e)))?;
    match direction.to_lowercase().as_str() {
        "vertical" => enigo.scroll(delta, Axis::Vertical).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to scroll: {:?}", e)))?,
        "horizontal" => enigo.scroll(delta, Axis::Horizontal).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to scroll: {:?}", e)))?,
        _ => return Err(Error::new(Status::InvalidArg, "Invalid scroll direction"))
    }
    Ok(())
}

#[napi]
pub async fn key(key: String, action: String) -> Result<()> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| Error::new(Status::GenericFailure, format!("Enigo error: {:?}", e)))?;
    let k = map_key(&key).ok_or_else(|| Error::new(Status::InvalidArg, format!("Invalid key: {}", key)))?;
    match action.to_lowercase().as_str() {
        "press" => enigo.key(k, Direction::Press).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to press key: {:?}", e)))?,
        "release" => enigo.key(k, Direction::Release).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to release key: {:?}", e)))?,
        "click" => enigo.key(k, Direction::Click).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to click key: {:?}", e)))?,
        _ => return Err(Error::new(Status::InvalidArg, "Invalid action"))
    }
    Ok(())
}

#[napi]
pub async fn keys(keys: Vec<String>) -> Result<()> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| Error::new(Status::GenericFailure, format!("Enigo error: {:?}", e)))?;
    let mapped_keys: Vec<Key> = keys.iter()
        .map(|k| map_key(k).ok_or_else(|| Error::new(Status::InvalidArg, format!("Invalid key: {}", k))))
        .collect::<Result<Vec<Key>>>()?;

    // Press modifiers/keys in order
    for &k in &mapped_keys {
        enigo.key(k, Direction::Press).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to press key: {:?}", e)))?;
    }
    // Release in reverse order
    for &k in mapped_keys.iter().rev() {
        enigo.key(k, Direction::Release).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to release key: {:?}", e)))?;
    }
    Ok(())
}

#[napi]
pub async fn type_text(text: String) -> Result<()> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| Error::new(Status::GenericFailure, format!("Enigo error: {:?}", e)))?;
    enigo.text(&text).map_err(|e| Error::new(Status::GenericFailure, format!("Failed to type text: {:?}", e)))?;
    Ok(())
}

#[napi]
pub fn get_frontmost_app_info() -> Result<Option<AppInfo>> {
    app::get_frontmost_app_info()
}
