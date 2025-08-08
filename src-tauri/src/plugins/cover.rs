use std::path::PathBuf;
use std::str::FromStr;

use base64::prelude::{BASE64_STANDARD, Engine as _};
use lofty::file::TaggedFileExt;
use lofty::picture::{MimeType, PictureType};
use tauri::Runtime;
use tauri::plugin::{Builder, TauriPlugin};

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

    let primary_tag = tagged_file.primary_tag()?;

    let cover = primary_tag
        .get_picture_type(PictureType::CoverFront)
        .or_else(|| primary_tag.get_picture_type(PictureType::Illustration))
        .or_else(|| primary_tag.get_picture_type(PictureType::Other))
        .or_else(|| primary_tag.get_picture_type(PictureType::Icon))
        .or_else(|| primary_tag.get_picture_type(PictureType::OtherIcon))?;

    let format = match cover.mime_type() {
        Some(MimeType::Png) => "png".to_string(),
        Some(MimeType::Jpeg) => "jpg".to_string(),
        Some(MimeType::Tiff) => "tiff".to_string(),
        Some(MimeType::Bmp) => "bmp".to_string(),
        Some(MimeType::Gif) => "gif".to_string(),
        _ => return None,
    };

    let cover_base64 = BASE64_STANDARD.encode(cover.data());
    Some(format!("data:{};base64,{}", format, cover_base64))
}

#[memoize::memoize]
fn get_cover_from_filesystem(path: String) -> Option<String> {
    let dir_path = PathBuf::from_str(&path)
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf();

    scan_dir(&dir_path, &SUPPORTED_COVER_EXTENSIONS)
        .iter()
        .find(|file| {
            let file_stem = file
                .file_stem()
                .unwrap()
                .to_str()
                .unwrap_or("???")
                .to_lowercase();

            SUPPORTED_COVER_NAMES.contains(&file_stem.as_str())
        })
        .map(|path| path.to_str().unwrap().into())
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
