use tauri::Manager;

/**
 * List of Tauri commands related to window management
 */

#[tauri::command]
pub async fn show_main_window(window: tauri::Window) {
    window.get_webview_window("main").unwrap().show().unwrap();
}
