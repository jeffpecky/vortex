mod app;
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

#[napi]
pub fn get_frontmost_app_info() -> Result<Option<AppInfo>> {
    app::get_frontmost_app_info()
}
