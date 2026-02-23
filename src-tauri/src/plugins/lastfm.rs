/**
 * Last.fm integration plugin
 * Handles authentication and API communication with Last.fm
 */
use log::{error, info};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Runtime, State};
use ts_rs::TS;

use crate::libs::error::{AnyResult, MuseeksError};
use crate::plugins::config::ConfigManager;

// Last.fm API credentials - these are public identifiers for the Museeks app
// Register your app at https://www.last.fm/api/account/create
const API_KEY: &str = "6496d20a201157d8c0c86cde0f2df5db"; // TODO: Replace with actual API key
const API_SECRET: &str = "d4f4b99472e12f395744134fba2c6d27"; // TODO: Replace with actual API secret
const API_ROOT: &str = "https://ws.audioscrobbler.com/2.0/";

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/generated/typings.ts")]
pub struct LastfmAuthUrl {
    pub url: String,
    pub token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/generated/typings.ts")]
pub struct LastfmUser {
    pub username: String,
    pub session_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct LastfmResponse<T> {
    #[serde(flatten)]
    data: Option<T>,
    error: Option<i32>,
    message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct TokenResponse {
    token: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct SessionResponse {
    session: SessionData,
}

#[derive(Debug, Serialize, Deserialize)]
struct SessionData {
    name: String,
    key: String,
}

/**
 * Generate MD5 signature for Last.fm API calls
 * Required for write operations (authentication, scrobbling)
 */
fn generate_signature(params: &HashMap<String, String>) -> String {
    let mut sorted_params: Vec<_> = params.iter().collect();
    sorted_params.sort_by_key(|a| a.0);

    let mut signature_string = String::new();
    for (key, value) in sorted_params {
        signature_string.push_str(key);
        signature_string.push_str(value);
    }
    signature_string.push_str(API_SECRET);

    format!("{:x}", md5::compute(signature_string))
}

/**
 * Step 1: Get an authentication token and URL for the user to authorize
 */
#[tauri::command]
pub async fn lastfm_get_auth_url() -> AnyResult<LastfmAuthUrl> {
    info!("Requesting Last.fm authentication token");

    let client = Client::new();
    let mut params = HashMap::new();
    params.insert("method".to_string(), "auth.getToken".to_string());
    params.insert("api_key".to_string(), API_KEY.to_string());

    let api_sig = generate_signature(&params);
    params.insert("api_sig".to_string(), api_sig);
    params.insert("format".to_string(), "json".to_string());

    let response = client
        .get(API_ROOT)
        .query(&params)
        .send()
        .await
        .map_err(|e| MuseeksError::LastFm(format!("Failed to get auth token: {}", e)))?;

    let json: LastfmResponse<TokenResponse> = response
        .json()
        .await
        .map_err(|e| MuseeksError::LastFm(format!("Failed to parse token response: {}", e)))?;

    if let Some(error_code) = json.error {
        return Err(MuseeksError::LastFm(format!(
            "Last.fm API error {}: {}",
            error_code,
            json.message.unwrap_or_default()
        )));
    }

    let token = json
        .data
        .ok_or_else(|| MuseeksError::LastFm("No token in response".to_string()))?
        .token;

    let auth_url = format!(
        "https://www.last.fm/api/auth/?api_key={}&token={}",
        API_KEY, token
    );

    Ok(LastfmAuthUrl {
        url: auth_url,
        token,
    })
}

/**
 * Step 2: Exchange the authorized token for a session key
 */
#[tauri::command]
pub async fn lastfm_get_session(
    token: String,
    config_manager: State<'_, ConfigManager>,
) -> AnyResult<LastfmUser> {
    info!("Exchanging Last.fm token for session key");

    let client = Client::new();
    let mut params = HashMap::new();
    params.insert("method".to_string(), "auth.getSession".to_string());
    params.insert("api_key".to_string(), API_KEY.to_string());
    params.insert("token".to_string(), token.clone());

    let api_sig = generate_signature(&params);
    params.insert("api_sig".to_string(), api_sig);
    params.insert("format".to_string(), "json".to_string());

    let response = client
        .get(API_ROOT)
        .query(&params)
        .send()
        .await
        .map_err(|e| MuseeksError::LastFm(format!("Failed to get session: {}", e)))?;

    let json: LastfmResponse<SessionResponse> = response
        .json()
        .await
        .map_err(|e| MuseeksError::LastFm(format!("Failed to parse session response: {}", e)))?;

    if let Some(error_code) = json.error {
        return Err(MuseeksError::LastFm(format!(
            "Last.fm API error {}: {}",
            error_code,
            json.message.unwrap_or_default()
        )));
    }

    let session_data = json
        .data
        .ok_or_else(|| MuseeksError::LastFm("No session in response".to_string()))?
        .session;

    // Save to config
    let mut config = config_manager.get()?;
    config.lastfm_enabled = true;
    config.lastfm_session_key = Some(session_data.key.clone());
    config.lastfm_username = Some(session_data.name.clone());
    config_manager.update(config)?;

    info!(
        "Last.fm authentication successful for user: {}",
        session_data.name
    );

    Ok(LastfmUser {
        username: session_data.name,
        session_key: session_data.key,
    })
}

/**
 * Disconnect from Last.fm (clear session)
 */
#[tauri::command]
pub async fn lastfm_disconnect(config_manager: State<'_, ConfigManager>) -> AnyResult<()> {
    info!("Disconnecting from Last.fm");

    let mut config = config_manager.get()?;
    config.lastfm_enabled = false;
    config.lastfm_session_key = None;
    config.lastfm_username = None;
    config_manager.update(config)?;

    Ok(())
}

/**
 * Test the current Last.fm connection
 */
#[tauri::command]
pub async fn lastfm_test_connection(config_manager: State<'_, ConfigManager>) -> AnyResult<bool> {
    let config = config_manager.get()?;

    if !config.lastfm_enabled {
        return Ok(false);
    }

    let session_key = match &config.lastfm_session_key {
        Some(key) => key,
        None => return Ok(false),
    };

    let client = Client::new();
    let mut params = HashMap::new();
    params.insert("method".to_string(), "user.getInfo".to_string());
    params.insert("api_key".to_string(), API_KEY.to_string());
    params.insert("sk".to_string(), session_key.clone());

    let api_sig = generate_signature(&params);
    params.insert("api_sig".to_string(), api_sig);
    params.insert("format".to_string(), "json".to_string());

    let response = client
        .get(API_ROOT)
        .query(&params)
        .send()
        .await
        .map_err(|e| {
            error!("Last.fm connection test failed: {}", e);
            MuseeksError::LastFm(format!("Connection test failed: {}", e))
        })?;

    let json: LastfmResponse<serde_json::Value> = response
        .json()
        .await
        .map_err(|e| MuseeksError::LastFm(format!("Failed to parse response: {}", e)))?;

    Ok(json.error.is_none())
}

/**
 * Update "Now Playing" status on Last.fm
 * Should be called when a track starts playing
 */
#[tauri::command]
pub async fn lastfm_now_playing(
    artist: String,
    track: String,
    album: Option<String>,
    duration: Option<u32>,
    config_manager: State<'_, ConfigManager>,
) -> AnyResult<()> {
    let config = config_manager.get()?;

    if !config.lastfm_enabled {
        return Ok(());
    }

    let session_key = match &config.lastfm_session_key {
        Some(key) => key,
        None => return Ok(()),
    };

    info!("Updating Last.fm Now Playing: {} - {}", artist, track);

    let client = Client::new();
    let mut params = HashMap::new();
    params.insert("method".to_string(), "track.updateNowPlaying".to_string());
    params.insert("api_key".to_string(), API_KEY.to_string());
    params.insert("sk".to_string(), session_key.clone());
    params.insert("artist".to_string(), artist);
    params.insert("track".to_string(), track);

    if let Some(album_name) = album {
        params.insert("album".to_string(), album_name);
    }

    if let Some(dur) = duration {
        params.insert("duration".to_string(), dur.to_string());
    }

    let api_sig = generate_signature(&params);
    params.insert("api_sig".to_string(), api_sig);
    params.insert("format".to_string(), "json".to_string());

    let response = client
        .post(API_ROOT)
        .form(&params)
        .send()
        .await
        .map_err(|e| {
            error!("Failed to update Now Playing: {}", e);
            MuseeksError::LastFm(format!("Failed to update Now Playing: {}", e))
        })?;

    let json: LastfmResponse<serde_json::Value> = response
        .json()
        .await
        .map_err(|e| MuseeksError::LastFm(format!("Failed to parse response: {}", e)))?;

    if let Some(error_code) = json.error {
        error!(
            "Last.fm Now Playing error {}: {}",
            error_code,
            json.message.unwrap_or_default()
        );
    }

    Ok(())
}

/**
 * Scrobble a track to Last.fm
 * Should be called when a track has been played for at least 50% or 4 minutes
 */
#[tauri::command]
pub async fn lastfm_scrobble(
    artist: String,
    track: String,
    timestamp: u64, // Unix timestamp when playback started
    album: Option<String>,
    duration: Option<u32>,
    config_manager: State<'_, ConfigManager>,
) -> AnyResult<()> {
    let config = config_manager.get()?;

    if !config.lastfm_enabled {
        return Ok(());
    }

    let session_key = match &config.lastfm_session_key {
        Some(key) => key,
        None => return Ok(()),
    };

    info!("Scrobbling to Last.fm: {} - {}", artist, track);

    let client = Client::new();
    let mut params = HashMap::new();
    params.insert("method".to_string(), "track.scrobble".to_string());
    params.insert("api_key".to_string(), API_KEY.to_string());
    params.insert("sk".to_string(), session_key.clone());
    params.insert("artist".to_string(), artist);
    params.insert("track".to_string(), track);
    params.insert("timestamp".to_string(), timestamp.to_string());

    if let Some(album_name) = album {
        params.insert("album".to_string(), album_name);
    }

    if let Some(dur) = duration {
        params.insert("duration".to_string(), dur.to_string());
    }

    let api_sig = generate_signature(&params);
    params.insert("api_sig".to_string(), api_sig);
    params.insert("format".to_string(), "json".to_string());

    let response = client
        .post(API_ROOT)
        .form(&params)
        .send()
        .await
        .map_err(|e| {
            error!("Failed to scrobble: {}", e);
            MuseeksError::LastFm(format!("Failed to scrobble: {}", e))
        })?;

    let json: LastfmResponse<serde_json::Value> = response
        .json()
        .await
        .map_err(|e| MuseeksError::LastFm(format!("Failed to parse response: {}", e)))?;

    if let Some(error_code) = json.error {
        let message = json.message.unwrap_or_default();
        error!("Last.fm scrobble error {}: {}", error_code, message);
        return Err(MuseeksError::LastFm(format!(
            "Scrobble failed: {}",
            message
        )));
    }

    info!("Successfully scrobbled track");
    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("lastfm")
        .invoke_handler(tauri::generate_handler![
            lastfm_get_auth_url,
            lastfm_get_session,
            lastfm_disconnect,
            lastfm_test_connection,
            lastfm_now_playing,
            lastfm_scrobble,
        ])
        .build()
}
