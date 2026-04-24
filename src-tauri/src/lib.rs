use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[tauri::command]
fn read_root_config() -> Result<String, String> {
    let current_dir = std::env::current_dir().map_err(|error| error.to_string())?;
    let config_path = resolve_config_path(current_dir);

    fs::read_to_string(&config_path).map_err(|error| {
        format!(
            "Failed to read config.json at {}: {}",
            config_path.display(),
            error
        )
    })
}

#[tauri::command]
fn read_tasks(app: AppHandle) -> Result<String, String> {
    let tasks_path = resolve_tasks_path(&app)?;

    if !tasks_path.exists() {
        return Ok("[]".to_string());
    }

    fs::read_to_string(&tasks_path).map_err(|error| {
        format!(
            "Failed to read tasks.json at {}: {}",
            tasks_path.display(),
            error
        )
    })
}

#[tauri::command]
fn write_tasks(app: AppHandle, tasks_json: String) -> Result<(), String> {
    let tasks_path = resolve_tasks_path(&app)?;

    if let Some(parent) = tasks_path.parent() {
        fs::create_dir_all(parent).map_err(|error| {
            format!(
                "Failed to create task storage directory {}: {}",
                parent.display(),
                error
            )
        })?;
    }

    let formatted = serde_json::to_string_pretty(
        &serde_json::from_str::<serde_json::Value>(&tasks_json).map_err(|error| error.to_string())?,
    )
    .map_err(|error| error.to_string())?;

    fs::write(&tasks_path, formatted).map_err(|error| {
        format!(
            "Failed to write tasks.json at {}: {}",
            tasks_path.display(),
            error
        )
    })
}

fn resolve_config_path(current_dir: PathBuf) -> PathBuf {
    let direct = current_dir.join("config.json");
    if direct.exists() {
        return direct;
    }

    direct
}

fn resolve_tasks_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;

    Ok(app_data_dir.join("tasks.json"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_root_config, read_tasks, write_tasks])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
