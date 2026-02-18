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
use std::net::TcpListener as StdTcpListener;
use std::path::Path;

use axum::Router;
use axum::extract::{Query, State};
use axum::http::{HeaderMap as AxumHeaderMap, StatusCode, header};
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use serde::Deserialize;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{AppHandle, Manager, Runtime};
use tokio::io::{AsyncReadExt, AsyncSeekExt};

use crate::libs::database::content_type_for_extension;
use crate::plugins::db::DBState;

const STREAM_SERVER_HOST: &str = "127.0.0.1";

#[derive(Deserialize)]
struct StreamParams {
    track_id: String,
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

fn build_response(
    status: StatusCode,
    content_type: &str,
    file_size: u64,
    body: Vec<u8>,
    range: Option<(u64, u64)>,
) -> Response {
    let mut headers = AxumHeaderMap::new();
    headers.insert(header::CONTENT_TYPE, content_type.parse().unwrap());
    headers.insert(
        header::CONTENT_LENGTH,
        body.len().to_string().parse().unwrap(),
    );
    headers.insert(header::ACCEPT_RANGES, "bytes".parse().unwrap());

    if let Some((start, end)) = range {
        headers.insert(
            header::CONTENT_RANGE,
            format!("bytes {}-{}/{}", start, end, file_size)
                .parse()
                .unwrap(),
        );
    }

    (status, headers, body).into_response()
}

async fn stream_handler<R: Runtime>(
    State(app_handle): State<AppHandle<R>>,
    Query(params): Query<StreamParams>,
    headers: AxumHeaderMap,
) -> Response {
    let db_state = app_handle.state::<DBState>();

    let track = match db_state.get_lock().await.get_track(&params.track_id).await {
        Ok(Some(track)) => track,
        Ok(None) => return StatusCode::NOT_FOUND.into_response(),
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    let path = Path::new(&track.path);

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
    let mut file = match tokio::fs::File::open(&track.path).await {
        Ok(f) => f,
        Err(_) => return StatusCode::NOT_FOUND.into_response(),
    };

    let file_size = match file.metadata().await {
        Ok(m) => m.len(),
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    // Handle Range requests
    if let Some(range_header) = headers.get(header::RANGE) {
        let range_str = match range_header.to_str() {
            Ok(s) => s,
            Err(_) => return StatusCode::RANGE_NOT_SATISFIABLE.into_response(),
        };

        let (start, end) = match parse_range_header(range_str, file_size) {
            Some(range) => range,
            None => return StatusCode::RANGE_NOT_SATISFIABLE.into_response(),
        };

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

    // Full file response
    let mut buffer = Vec::with_capacity(file_size as usize);
    if file.read_to_end(&mut buffer).await.is_err() {
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    }

    build_response(StatusCode::OK, content_type, file_size, buffer, None)
}

/// Initialize the Tauri plugin: starts the HTTP server and injects the port
/// into the window so the frontend can use it.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    // Bind synchronously to get the port before building the plugin, so it can
    // be injected into the JS init script. The listener is handed off to the
    // async server that starts inside `setup`.
    let std_listener = StdTcpListener::bind(format!("{}:0", STREAM_SERVER_HOST))
        .expect("Failed to bind stream server");
    std_listener
        .set_nonblocking(true)
        .expect("Failed to set stream server listener to non-blocking");
    let port = std_listener.local_addr().unwrap().port();

    // Inject the base URL into the window so the frontend can construct stream URLs
    let init_script = format!(
        "window.__MUSEEKS_STREAM_SERVER_URL = \"http://{}:{}\";",
        STREAM_SERVER_HOST, port
    );

    Builder::<R>::new("stream-server")
        .setup(move |app_handle, _api| {
            let app_handle = app_handle.clone();

            tauri::async_runtime::spawn(async move {
                let listener = tokio::net::TcpListener::from_std(std_listener)
                    .expect("Failed to convert stream server listener");

                println!(
                    "[stream_server] Audio stream server started on port {}",
                    port
                );

                let router = Router::new()
                    .route("/stream", get(stream_handler))
                    .with_state(app_handle);

                axum::serve(listener, router).await.unwrap();
            });

            Ok(())
        })
        .js_init_script(init_script)
        .build()
}
