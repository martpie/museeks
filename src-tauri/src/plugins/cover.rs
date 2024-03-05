use base64::prelude::*;
use lofty::{MimeType, TaggedFileExt};
use log::debug;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

use crate::libs::error::AnyResult;

#[tauri::command]
fn get_cover(path: String) -> AnyResult<Option<String>> {
    // TODO: if None, scan folder for cover.jpg/png instead
    let tagged_file = lofty::read_from_path(path);

    if tagged_file.is_err() {
        return Ok(None);
    }

    let binding = tagged_file.unwrap();
    let tag = binding.primary_tag();

    let (format, data) = match tag {
        Some(tag) => {
            let maybe_cover = tag.pictures().first();
            match maybe_cover {
                Some(cover) => {
                    let format = match cover.mime_type() {
                        Some(MimeType::Png) => Some("png".to_string()),
                        Some(MimeType::Jpeg) => Some("jpg".to_string()),
                        Some(MimeType::Tiff) => Some("tiff".to_string()),
                        Some(MimeType::Bmp) => Some("bmp".to_string()),
                        Some(MimeType::Gif) => Some("gif".to_string()),
                        _ => None,
                    };
                    (format, BASE64_STANDARD.encode(&cover.data()))
                }
                None => return Ok(None),
            }
        }
        None => return Ok(None),
    };

    if format.is_none() {
        debug!("Cover has no format");
        return Ok(None);
    }

    debug!("Cover was found (base 64)");
    Ok(Some(format!("data:{};base64,{}", format.unwrap(), data)))
}

/**
 * Module in charge of assisting the UI with cover retrieval
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("cover")
        .invoke_handler(tauri::generate_handler![get_cover,])
        .build()
}
