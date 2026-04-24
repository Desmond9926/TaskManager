import { invoke } from "@tauri-apps/api/core";
import type { TaskCard } from "./task-types";

const TASKS_STORAGE_KEY = "taskmanager2.tasks";
const TASKS_MIGRATION_KEY = "taskmanager2.tasks.migrated";

export async function loadTasks(): Promise<TaskCard[]> {
  const tauriTasks = await loadTasksFromTauri();
  if (tauriTasks) {
    if (tauriTasks.length > 0) {
      return tauriTasks;
    }

    const migratedTasks = readTasksFromLocalStorage();
    if (migratedTasks.length > 0 && shouldMigrateLocalTasks()) {
      await saveTasksToTauri(migratedTasks);
      markTasksMigrated();
      return migratedTasks;
    }

    return tauriTasks;
  }

  return readTasksFromLocalStorage();
}

export async function saveTasks(tasks: TaskCard[]) {
  const savedToTauri = await saveTasksToTauri(tasks);
  if (!savedToTauri) {
    saveTasksToLocalStorage(tasks);
    return;
  }

  if (typeof window !== "undefined") {
    saveTasksToLocalStorage(tasks);
  }
}

async function loadTasksFromTauri() {
  try {
    const raw = await invoke<string>("read_tasks");
    return parseTasks(raw);
  } catch {
    return null;
  }
}

async function saveTasksToTauri(tasks: TaskCard[]) {
  try {
    await invoke("write_tasks", {
      tasksJson: JSON.stringify(tasks),
    });
    return true;
  } catch {
    return false;
  }
}

function readTasksFromLocalStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
  return parseTasks(raw);
}

function saveTasksToLocalStorage(tasks: TaskCard[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

function parseTasks(raw: string | null) {
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as TaskCard[];
  } catch {
    return [];
  }
}

function shouldMigrateLocalTasks() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(TASKS_MIGRATION_KEY) !== "done";
}

function markTasksMigrated() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TASKS_MIGRATION_KEY, "done");
}
