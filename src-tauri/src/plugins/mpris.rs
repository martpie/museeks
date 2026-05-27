use std::sync::{Arc, Mutex};

use log::{error, info};
use mpris_server::{
    zbus::{self, fdo},
    LoopStatus, Metadata, PlaybackStatus, PlayerInterface, Property, RootInterface, Server, Signal,
    Time, TrackId,
};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Emitter, Manager, Runtime, State};

use crate::libs::error::AnyResult;
use crate::libs::events::IPCEvent;

/// Internal state shared between the MPRIS server and Tauri commands.
struct MprisInner {
    playback_status: Mutex<PlaybackStatus>,
    metadata: Mutex<Metadata>,
    volume: Mutex<f64>,
    shuffle: Mutex<bool>,
    loop_status: Mutex<LoopStatus>,
    position: Mutex<Time>,
}

/// The MPRIS implementation that handles D-Bus interface methods.
/// Methods like play/pause/next are forwarded to the frontend via Tauri events.
struct MprisImpl {
    inner: Arc<MprisInner>,
    app_handle: Mutex<Option<Box<dyn EmitAll>>>,
}

/// Trait object wrapper for AppHandle emission (needed because AppHandle is generic over Runtime).
trait EmitAll: Send + Sync {
    fn emit_event(&self, event: &str, payload: ());
    fn emit_f64(&self, event: &str, payload: f64);
    fn emit_bool(&self, event: &str, payload: bool);
    fn emit_string(&self, event: &str, payload: String);
}

struct TauriEmitter<R: Runtime> {
    handle: tauri::AppHandle<R>,
}

impl<R: Runtime> EmitAll for TauriEmitter<R> {
    fn emit_event(&self, event: &str, payload: ()) {
        let _ = self.handle.emit(event, payload);
    }
    fn emit_f64(&self, event: &str, payload: f64) {
        let _ = self.handle.emit(event, payload);
    }
    fn emit_bool(&self, event: &str, payload: bool) {
        let _ = self.handle.emit(event, payload);
    }
    fn emit_string(&self, event: &str, payload: String) {
        let _ = self.handle.emit(event, payload);
    }
}

impl RootInterface for MprisImpl {
    async fn raise(&self) -> fdo::Result<()> {
        Ok(())
    }

    async fn quit(&self) -> fdo::Result<()> {
        Ok(())
    }

    async fn can_quit(&self) -> fdo::Result<bool> {
        Ok(false)
    }

    async fn fullscreen(&self) -> fdo::Result<bool> {
        Ok(false)
    }

    async fn set_fullscreen(&self, _fullscreen: bool) -> zbus::Result<()> {
        Ok(())
    }

    async fn can_set_fullscreen(&self) -> fdo::Result<bool> {
        Ok(false)
    }

    async fn can_raise(&self) -> fdo::Result<bool> {
        Ok(false)
    }

    async fn has_track_list(&self) -> fdo::Result<bool> {
        Ok(false)
    }

    async fn identity(&self) -> fdo::Result<String> {
        Ok("Museeks".to_string())
    }

    async fn desktop_entry(&self) -> fdo::Result<String> {
        Ok("museeks".to_string())
    }

    async fn supported_uri_schemes(&self) -> fdo::Result<Vec<String>> {
        Ok(vec!["file".to_string()])
    }

    async fn supported_mime_types(&self) -> fdo::Result<Vec<String>> {
        Ok(crate::libs::database::SUPPORTED_AUDIO_FORMATS
            .iter()
            .map(|(_, mime)| (*mime).to_string())
            .collect())
    }
}

impl PlayerInterface for MprisImpl {
    async fn next(&self) -> fdo::Result<()> {
        if let Some(emitter) = self.app_handle.lock().unwrap().as_ref() {
            emitter.emit_event(IPCEvent::PlaybackNext.as_ref(), ());
        }
        Ok(())
    }

    async fn previous(&self) -> fdo::Result<()> {
        if let Some(emitter) = self.app_handle.lock().unwrap().as_ref() {
            emitter.emit_event(IPCEvent::PlaybackPrevious.as_ref(), ());
        }
        Ok(())
    }

    async fn pause(&self) -> fdo::Result<()> {
        if let Some(emitter) = self.app_handle.lock().unwrap().as_ref() {
            emitter.emit_event(IPCEvent::PlaybackPause.as_ref(), ());
        }
        Ok(())
    }

    async fn play_pause(&self) -> fdo::Result<()> {
        if let Some(emitter) = self.app_handle.lock().unwrap().as_ref() {
            emitter.emit_event(IPCEvent::PlaybackPlayPause.as_ref(), ());
        }
        Ok(())
    }

    async fn stop(&self) -> fdo::Result<()> {
        if let Some(emitter) = self.app_handle.lock().unwrap().as_ref() {
            emitter.emit_event(IPCEvent::PlaybackStop.as_ref(), ());
        }
        Ok(())
    }

    async fn play(&self) -> fdo::Result<()> {
        if let Some(emitter) = self.app_handle.lock().unwrap().as_ref() {
            emitter.emit_event(IPCEvent::PlaybackPlay.as_ref(), ());
        }
        Ok(())
    }

    async fn seek(&self, offset: Time) -> fdo::Result<()> {
        if let Some(emitter) = self.app_handle.lock().unwrap().as_ref() {
            // Relative seek: send offset in seconds, frontend applies it to its own currentTime
            let offset_secs = offset.as_micros() as f64 / 1_000_000.0;
            emitter.emit_f64(IPCEvent::PlaybackSeekBy.as_ref(), offset_secs);
        }
        Ok(())
    }

    async fn set_position(&self, _track_id: TrackId, position: Time) -> fdo::Result<()> {
        if let Some(emitter) = self.app_handle.lock().unwrap().as_ref() {
            // Convert position from microseconds to seconds
            let position_secs = position.as_micros() as f64 / 1_000_000.0;
            emitter.emit_f64(IPCEvent::PlaybackSeekTo.as_ref(), position_secs);
        }
        Ok(())
    }

    async fn open_uri(&self, _uri: String) -> fdo::Result<()> {
        Ok(())
    }

    async fn playback_status(&self) -> fdo::Result<PlaybackStatus> {
        Ok(*self.inner.playback_status.lock().unwrap())
    }

    async fn loop_status(&self) -> fdo::Result<LoopStatus> {
        Ok(*self.inner.loop_status.lock().unwrap())
    }

    async fn set_loop_status(&self, loop_status: LoopStatus) -> zbus::Result<()> {
        *self.inner.loop_status.lock().unwrap() = loop_status;
        if let Some(emitter) = self.app_handle.lock().unwrap().as_ref() {
            let repeat = match loop_status {
                LoopStatus::None => "None",
                LoopStatus::Track => "One",
                LoopStatus::Playlist => "All",
            };
            emitter.emit_string(
                IPCEvent::PlaybackSetRepeat.as_ref(),
                repeat.to_string(),
            );
        }
        Ok(())
    }

    async fn rate(&self) -> fdo::Result<f64> {
        Ok(1.0)
    }

    async fn set_rate(&self, _rate: f64) -> zbus::Result<()> {
        Ok(())
    }

    async fn shuffle(&self) -> fdo::Result<bool> {
        Ok(*self.inner.shuffle.lock().unwrap())
    }

    async fn set_shuffle(&self, shuffle: bool) -> zbus::Result<()> {
        *self.inner.shuffle.lock().unwrap() = shuffle;
        if let Some(emitter) = self.app_handle.lock().unwrap().as_ref() {
            emitter.emit_bool(IPCEvent::PlaybackSetShuffle.as_ref(), shuffle);
        }
        Ok(())
    }

    async fn metadata(&self) -> fdo::Result<Metadata> {
        Ok(self.inner.metadata.lock().unwrap().clone())
    }

    async fn volume(&self) -> fdo::Result<f64> {
        Ok(*self.inner.volume.lock().unwrap())
    }

    async fn set_volume(&self, volume: f64) -> zbus::Result<()> {
        *self.inner.volume.lock().unwrap() = volume;
        if let Some(emitter) = self.app_handle.lock().unwrap().as_ref() {
            emitter.emit_f64(IPCEvent::PlaybackSetVolume.as_ref(), volume);
        }
        Ok(())
    }

    async fn position(&self) -> fdo::Result<Time> {
        Ok(*self.inner.position.lock().unwrap())
    }

    async fn minimum_rate(&self) -> fdo::Result<f64> {
        Ok(1.0)
    }

    async fn maximum_rate(&self) -> fdo::Result<f64> {
        Ok(1.0)
    }

    async fn can_go_next(&self) -> fdo::Result<bool> {
        Ok(true)
    }

    async fn can_go_previous(&self) -> fdo::Result<bool> {
        Ok(true)
    }

    async fn can_play(&self) -> fdo::Result<bool> {
        Ok(true)
    }

    async fn can_pause(&self) -> fdo::Result<bool> {
        Ok(true)
    }

    async fn can_seek(&self) -> fdo::Result<bool> {
        Ok(true)
    }

    async fn can_control(&self) -> fdo::Result<bool> {
        Ok(true)
    }
}

/// Managed state that holds the MPRIS server.
pub struct MprisState {
    server: Server<MprisImpl>,
    inner: Arc<MprisInner>,
}

// --------------------------------------------------------------------------
// Tauri commands
// --------------------------------------------------------------------------

#[tauri::command]
pub async fn update_playback_status(
    state: State<'_, MprisState>,
    playing: bool,
) -> AnyResult<()> {
    let status = if playing {
        PlaybackStatus::Playing
    } else {
        PlaybackStatus::Paused
    };
    *state.inner.playback_status.lock().unwrap() = status;
    state
        .server
        .properties_changed([Property::PlaybackStatus(status)])
        .await
        .map_err(|e| anyhow::anyhow!("MPRIS error: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn update_track_metadata(
    state: State<'_, MprisState>,
    title: String,
    artists: Vec<String>,
    album: String,
    duration_secs: u32,
    cover_path: Option<String>,
    track_no: Option<u32>,
    track_id: String,
) -> AnyResult<()> {
    let mut metadata = Metadata::builder()
        .title(title)
        .artist(artists)
        .album(album)
        .length(Time::from_secs(duration_secs as i64));

    // Set track ID as a D-Bus object path
    let track_path = format!("/org/museeks/track/{}", track_id.replace('-', "_"));
    if let Ok(tid) = TrackId::try_from(track_path.as_str()) {
        metadata = metadata.trackid(tid);
    }

    if let Some(track_no) = track_no {
        metadata = metadata.track_number(track_no as i32);
    }

    if let Some(cover) = cover_path {
        if let Some(art_url) = resolve_cover_art(&cover) {
            metadata = metadata.art_url(art_url);
        }
    }

    let metadata = metadata.build();
    *state.inner.metadata.lock().unwrap() = metadata.clone();
    state
        .server
        .properties_changed([Property::Metadata(metadata)])
        .await
        .map_err(|e| anyhow::anyhow!("MPRIS error: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn update_volume(state: State<'_, MprisState>, volume: f64) -> AnyResult<()> {
    *state.inner.volume.lock().unwrap() = volume;
    state
        .server
        .properties_changed([Property::Volume(volume)])
        .await
        .map_err(|e| anyhow::anyhow!("MPRIS error: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn update_shuffle(state: State<'_, MprisState>, shuffle: bool) -> AnyResult<()> {
    *state.inner.shuffle.lock().unwrap() = shuffle;
    state
        .server
        .properties_changed([Property::Shuffle(shuffle)])
        .await
        .map_err(|e| anyhow::anyhow!("MPRIS error: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn update_repeat(state: State<'_, MprisState>, repeat: String) -> AnyResult<()> {
    let loop_status = match repeat.as_str() {
        "All" => LoopStatus::Playlist,
        "One" => LoopStatus::Track,
        _ => LoopStatus::None,
    };
    *state.inner.loop_status.lock().unwrap() = loop_status;
    state
        .server
        .properties_changed([Property::LoopStatus(loop_status)])
        .await
        .map_err(|e| anyhow::anyhow!("MPRIS error: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn update_position(
    state: State<'_, MprisState>,
    position_secs: f64,
    seeked: Option<bool>,
) -> AnyResult<()> {
    let position = Time::from_micros((position_secs * 1_000_000.0) as i64);
    *state.inner.position.lock().unwrap() = position;
    // Only emit Seeked signal on actual seeks, not periodic position syncs
    if seeked.unwrap_or(false) {
        state
            .server
            .emit(Signal::Seeked { position })
            .await
            .map_err(|e| anyhow::anyhow!("MPRIS error: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn clear_metadata(state: State<'_, MprisState>) -> AnyResult<()> {
    *state.inner.playback_status.lock().unwrap() = PlaybackStatus::Stopped;
    *state.inner.metadata.lock().unwrap() = Metadata::new();
    *state.inner.position.lock().unwrap() = Time::ZERO;
    state
        .server
        .properties_changed([
            Property::PlaybackStatus(PlaybackStatus::Stopped),
            Property::Metadata(Metadata::new()),
        ])
        .await
        .map_err(|e| anyhow::anyhow!("MPRIS error: {}", e))?;
    Ok(())
}

// --------------------------------------------------------------------------
// Cover art helpers
// --------------------------------------------------------------------------

/// Simple percent-decode for URL paths.
fn percent_decode(input: &str) -> String {
    let mut result = Vec::with_capacity(input.len());
    let bytes = input.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            if let Ok(byte) = u8::from_str_radix(
                std::str::from_utf8(&bytes[i + 1..i + 3]).unwrap_or(""),
                16,
            ) {
                result.push(byte);
                i += 3;
                continue;
            }
        }
        result.push(bytes[i]);
        i += 1;
    }
    String::from_utf8(result).unwrap_or_else(|_| input.to_string())
}

/// Convert a cover path from the frontend to a file:// URI for MPRIS.
fn resolve_cover_art(cover: &str) -> Option<String> {
    if cover.starts_with("data:") {
        // Decode base64 data URL and write to temp file
        write_cover_from_data_url(cover)
    } else if cover.starts_with("http://") || cover.starts_with("https://") {
        // Asset protocol URLs — pass through
        Some(cover.to_string())
    } else if cover.starts_with("asset://") {
        // Tauri asset protocol — extract the path and percent-decode it
        let path = cover.strip_prefix("asset://localhost")?;
        let decoded = percent_decode(path);
        Some(format!("file://{}", decoded))
    } else {
        // Assume file path
        Some(format!("file://{}", cover))
    }
}

/// Decode a data: URL and write the image to a temp file.
fn write_cover_from_data_url(data_url: &str) -> Option<String> {
    use base64::Engine;
    use std::fs;

    // Parse: data:image/png;base64,<data>
    let after_comma = data_url.find(',')? + 1;
    let base64_data = &data_url[after_comma..];

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(base64_data)
        .ok()?;

    let temp_path = std::env::temp_dir().join("museeks-cover.png");
    fs::write(&temp_path, &bytes).ok()?;
    Some(format!("file://{}", temp_path.display()))
}

// --------------------------------------------------------------------------
// Plugin initialization
// --------------------------------------------------------------------------

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("mpris")
        .invoke_handler(tauri::generate_handler![
            update_playback_status,
            update_track_metadata,
            update_volume,
            update_shuffle,
            update_repeat,
            update_position,
            clear_metadata,
        ])
        .setup(|app_handle, _api| {
            let inner = Arc::new(MprisInner {
                playback_status: Mutex::new(PlaybackStatus::Stopped),
                metadata: Mutex::new(Metadata::new()),
                volume: Mutex::new(1.0),
                shuffle: Mutex::new(false),
                loop_status: Mutex::new(LoopStatus::None),
                position: Mutex::new(Time::ZERO),
            });

            let mpris_impl = MprisImpl {
                inner: Arc::clone(&inner),
                app_handle: Mutex::new(Some(Box::new(TauriEmitter {
                    handle: app_handle.clone(),
                }))),
            };

            // Create the MPRIS server on a background thread (zbus needs its own async runtime)
            let (tx, rx) = std::sync::mpsc::channel();
            let inner_clone = Arc::clone(&inner);

            std::thread::spawn(move || {
                let rt = tokio::runtime::Builder::new_current_thread()
                    .enable_all()
                    .build()
                    .expect("Failed to build tokio runtime for MPRIS");

                rt.block_on(async {
                    match Server::new("museeks", mpris_impl).await {
                        Ok(server) => {
                            info!("MPRIS server started as org.mpris.MediaPlayer2.museeks");
                            let state = MprisState {
                                server,
                                inner: inner_clone,
                            };
                            tx.send(Ok(state)).unwrap();
                            // Keep the runtime alive so the D-Bus connection stays open
                            std::future::pending::<()>().await;
                        }
                        Err(e) => {
                            error!("Failed to start MPRIS server: {}", e);
                            tx.send(Err(anyhow::anyhow!("Failed to start MPRIS server: {}", e)))
                                .unwrap();
                        }
                    }
                });
            });

            let state = rx
                .recv()
                .map_err(|e| anyhow::anyhow!("MPRIS channel error: {}", e))??;

            app_handle.manage(state);
            info!("MPRIS plugin initialized");
            Ok(())
        })
        .build()
}
