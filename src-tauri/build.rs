fn main() {
    // Build the app
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .codegen(tauri_build::CodegenContext::new())
            .plugin(
                "app-menu",
                tauri_build::InlinedPlugin::new().commands(&["toggle"]),
            )
            .plugin(
                "config",
                tauri_build::InlinedPlugin::new().commands(&["get_config", "set_config"]),
            )
            .plugin(
                "cover",
                tauri_build::InlinedPlugin::new().commands(&["get_cover"]),
            )
            .plugin(
                "database",
                tauri_build::InlinedPlugin::new().commands(&[
                    "import_tracks_to_library",
                    "get_all_tracks",
                    "remove_tracks",
                    "get_tracks",
                    "get_all_playlists",
                    "get_playlist",
                    "create_playlist",
                    "rename_playlist",
                    "set_playlist_tracks",
                    "export_playlist",
                    "delete_playlist",
                    "reset",
                ]),
            )
            .plugin(
                "default-view",
                tauri_build::InlinedPlugin::new().commands(&["set"]),
            )
            .plugin(
                "shell-extension",
                tauri_build::InlinedPlugin::new().commands(&["show_item_in_folder"]),
            )
            .plugin(
                "sleepblocker",
                tauri_build::InlinedPlugin::new().commands(&["enable", "disable"]),
            ),
    )
    .expect("Failed to run tauri-build");
}
