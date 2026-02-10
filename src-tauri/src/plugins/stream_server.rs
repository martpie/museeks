/**
 * Local HTTP server for streaming audio files on Linux.
 *
 * WebKitGTK's custom URI scheme handler (used by Tauri's asset protocol)
 * does not properly support media streaming and Range requests, which breaks
 * audio playback. This module provides a local HTTP server that serves audio
 * files with correct Content-Type and Range request support, which GStreamer
 * handles perfectly.
 *
 * See: https://github.com/tauri-apps/tauri/issues/3725
 */
use std::io::SeekFrom;
use std::path::Path;

use axum::extract::Query;
use axum::http::{HeaderMap as AxumHeaderMap, StatusCode, header};
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::Router;
use log::info;
use serde::Deserialize;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;
use tokio::io::{AsyncReadExt, AsyncSeekExt};

#[derive(Deserialize)]
struct StreamParams {
    path: String,
}

fn content_type_for_extension(ext: &str) -> Option<&'static str> {
    match ext {
        "mp3" => Some("audio/mpeg"),
        "flac" => Some("audio/flac"),
        "aac" => Some("audio/aac"),
        "m4a" => Some("audio/mp4"),
        "3gp" => Some("audio/3gpp"),
        "wav" => Some("audio/wav"),
        "ogg" => Some("audio/ogg"),
        "opus" => Some("audio/opus"),
        "weba" => Some("audio/webm"),
        _ => None,
    }
}

/// Parse a Range header value like "bytes=0-1023" or "bytes=1024-"
fn parse_range_header(range: &str, file_size: u64) -> Option<(u64, u64)> {
    let range = range.strip_prefix("bytes=")?;
    let mut parts = range.splitn(2, '-');
    let start_str = parts.next()?;
    let end_str = parts.next()?;

    let start: u64 = start_str.parse().ok()?;
    let end: u64 = if end_str.is_empty() {
        file_size - 1
    } else {
        end_str.parse().ok()?
    };

    if start > end || end >= file_size {
        return None;
    }

    Some((start, end))
}

fn build_response(status: StatusCode, content_type: &str, file_size: u64, body: Vec<u8>, range: Option<(u64, u64)>) -> Response {
    let mut headers = AxumHeaderMap::new();
    headers.insert(header::CONTENT_TYPE, content_type.parse().unwrap());
    headers.insert(header::CONTENT_LENGTH, body.len().to_string().parse().unwrap());
    headers.insert(header::ACCEPT_RANGES, "bytes".parse().unwrap());
    headers.insert(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*".parse().unwrap());
    headers.insert(
        header::ACCESS_CONTROL_EXPOSE_HEADERS,
        "Content-Range, Accept-Ranges, Content-Length".parse().unwrap(),
    );

    if let Some((start, end)) = range {
        headers.insert(
            header::CONTENT_RANGE,
            format!("bytes {}-{}/{}", start, end, file_size).parse().unwrap(),
        );
    }

    (status, headers, body).into_response()
}

async fn stream_handler(Query(params): Query<StreamParams>, headers: AxumHeaderMap) -> Response {
    let path = Path::new(&params.path);

    // Validate file extension
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let content_type = match content_type_for_extension(&ext) {
        Some(ct) => ct,
        None => return StatusCode::UNSUPPORTED_MEDIA_TYPE.into_response(),
    };

    // Open file
    let mut file = match tokio::fs::File::open(&params.path).await {
        Ok(f) => f,
        Err(_) => return StatusCode::NOT_FOUND.into_response(),
    };

    let file_size = match file.metadata().await {
        Ok(m) => m.len(),
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    // Handle Range requests
    if let Some(range_header) = headers.get(header::RANGE) {
        if let Ok(range_str) = range_header.to_str() {
            if let Some((start, end)) = parse_range_header(range_str, file_size) {
                let length = end - start + 1;

                if file.seek(SeekFrom::Start(start)).await.is_err() {
                    return StatusCode::INTERNAL_SERVER_ERROR.into_response();
                }

                let mut buffer = vec![0u8; length as usize];
                if file.read_exact(&mut buffer).await.is_err() {
                    return StatusCode::INTERNAL_SERVER_ERROR.into_response();
                }

                return build_response(
                    StatusCode::PARTIAL_CONTENT,
                    content_type,
                    file_size,
                    buffer,
                    Some((start, end)),
                );
            }
        }
    }

    // Full file response
    let mut buffer = Vec::with_capacity(file_size as usize);
    if file.read_to_end(&mut buffer).await.is_err() {
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    }

    build_response(StatusCode::OK, content_type, file_size, buffer, None)
}

/// Start the HTTP stream server on a background thread and return the port.
pub fn start() -> u16 {
    let (tx, rx) = std::sync::mpsc::channel();

    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new()
            .expect("Failed to create tokio runtime for stream server");

        rt.block_on(async {
            let app = Router::new().route("/stream", get(stream_handler));
            let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
                .await
                .expect("Failed to bind stream server");
            let port = listener.local_addr().unwrap().port();

            info!(
                "[stream_server] Audio stream server started on port {}",
                port
            );
            tx.send(port).unwrap();

            axum::serve(listener, app).await.unwrap();
        });
    });

    rx.recv().expect("Failed to get stream server port")
}

/// Initialize the Tauri plugin, injecting the stream server port into the window.
pub fn init<R: Runtime>(port: u16) -> TauriPlugin<R> {
    let init_script = format!("window.__MUSEEKS_STREAM_SERVER_PORT = {};", port);

    Builder::<R>::new("stream-server")
        .js_init_script(init_script)
        .build()
}
