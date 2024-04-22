use std::path::PathBuf;
use std::str::FromStr;

use base64::prelude::*;
use lofty::picture::{MimeType, PictureType};
use lofty::prelude::*;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

use crate::libs::error::AnyResult;
use crate::libs::utils::scan_dir;

const SUPPORTED_COVER_EXTENSIONS: [&str; 5] = ["png", "jpg", "jpeg", "bmp", "gif"];
const SUPPORTED_COVER_NAMES: [&str; 5] = ["album", "albumart", "folder", "cover", "front"];

#[memoize::memoize]
fn get_cover_from_id3(path: String) -> Option<String> {
    let tagged_file = match lofty::read_from_path(path) {
        Ok(tagged_file) => tagged_file,
        Err(_) => return None,
    };

    let primary_tag = match tagged_file.primary_tag() {
        Some(tag) => tag,
        None => return None,
    };

    let cover = match primary_tag.get_picture_type(PictureType::CoverFront) {
        Some(cover) => cover,
        None => return None,
    };

    let format = match cover.mime_type() {
        Some(MimeType::Png) => "png".to_string(),
        Some(MimeType::Jpeg) => "jpg".to_string(),
        Some(MimeType::Tiff) => "tiff".to_string(),
        Some(MimeType::Bmp) => "bmp".to_string(),
        Some(MimeType::Gif) => "gif".to_string(),
        _ => return None,
    };

    let cover_base64 = BASE64_STANDARD.encode(&cover.data());
    Some(format!("data:{};base64,{}", format, cover_base64))
}

#[memoize::memoize]
fn get_cover_from_filesystem<'a>(path: String) -> Option<String> {
    let dir_path = PathBuf::from_str(&path)
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf();

    match scan_dir(&dir_path, &SUPPORTED_COVER_EXTENSIONS)
        .iter()
        .find(|file| {
            let file_stem = file
                .file_stem()
                .unwrap()
                .to_str()
                .unwrap_or("???")
                .to_lowercase();

            SUPPORTED_COVER_NAMES.contains(&file_stem.as_str())
        }) {
        // Ideally, the file URL would be converted to asset.localhost
        // here, but I could not find the equivalent on convertFileSrc
        // for the back-end;
        Some(path) => Some(path.to_str().unwrap().into()),
        None => None,
    }
}

#[tauri::command]
pub async fn get_cover(path: String) -> AnyResult<Option<String>> {
    // 1. Try to get the Cover from the ID3 tag
    match get_cover_from_id3(path.clone()) {
        Some(path) => Ok(Some(path)),
        // 2. Cover was not found, so let's fallback to scanning the directory
        // for a valid cover file
        None => Ok(get_cover_from_filesystem(path)),
    }
}

/**
 * Module in charge of assisting the UI with cover retrieval
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("cover")
        .invoke_handler(tauri::generate_handler![get_cover])
        .build()
}
