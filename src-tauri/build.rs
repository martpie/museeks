fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .codegen(tauri_build::CodegenContext::new())
            .plugin(
                "config",
                tauri_build::InlinedPlugin::new().commands(&["get_config", "set_config"]),
            )
            .plugin(
                "database",
                tauri_build::InlinedPlugin::new().commands(&[
                    "import_tracks_to_library",
                    "get_all_tracks",
                    "get_tracks",
                    "get_all_playlists",
                    "get_playlist",
                    "create_playlist",
                    "rename_playlist",
                    "delete_playlist",
                    "get_cover",
                    "reset",
                ]),
            )
            .plugin(
                "default-view",
                tauri_build::InlinedPlugin::new().commands(&["set"]),
            )
            .plugin(
                "sleepblocker",
                tauri_build::InlinedPlugin::new().commands(&["enable", "disable"]),
            ),
    )
    .expect("Failed to run tauri-build");
}
