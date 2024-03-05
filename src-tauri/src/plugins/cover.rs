use base64::prelude::*;
use lofty::{MimeType, TaggedFileExt};
use log::debug;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

use crate::libs::error::AnyResult;

const SUPPORTED_COVER_EXTENSIONS: [&'static str; 5] = [".png", ".jpg", ".jpeg", ".bmp", ".gif"];
const SUPPORTED_COVER_NAMES: [&'static str; 5] = ["album", "albumart", "folder", "cover", "front"];

#[tauri::command]
fn get_cover(path: String) -> AnyResult<Option<String>> {
    // 1. Try to get the Cover from the ID3 tag
    let cover_path: Option<String> = match lofty::read_from_path(path)?.primary_tag() {
        Some(tag) => match tag.pictures().first() {
            Some(cover) => {
                let maybe_format = match cover.mime_type() {
                    Some(MimeType::Png) => Some("png".to_string()),
                    Some(MimeType::Jpeg) => Some("jpg".to_string()),
                    Some(MimeType::Tiff) => Some("tiff".to_string()),
                    Some(MimeType::Bmp) => Some("bmp".to_string()),
                    Some(MimeType::Gif) => Some("gif".to_string()),
                    _ => None,
                };

                match maybe_format {
                    Some(format) => {
                        let cover_base64 = BASE64_STANDARD.encode(&cover.data());
                        Some(format!("data:{};base64,{}", format, cover_base64))
                    }
                    None => None,
                }
            }
            None => None,
        },
        // TODO: how to match err here?
        None => None,
    };

    if cover_path.is_some() {
        return Ok(Some(cover_path.unwrap()));
    }

    // 2. Cover was not found, so let's fallback to scanning the directory
    // for a valid cover file
    Ok(None)
}

/**
 * Module in charge of assisting the UI with cover retrieval
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("cover")
        .invoke_handler(tauri::generate_handler![get_cover,])
        .build()
}
