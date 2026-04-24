import { invoke } from "@tauri-apps/api/core";
import { ZodError } from "zod";
import { resolveProvider } from "./resolve-provider";
import { appConfigSchema } from "./schema";
import type { ResolvedConfig } from "../types/config";

export async function loadAppConfig(): Promise<ResolvedConfig> {
  const raw = await readConfigText();

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw new Error("config.json is not valid JSON");
  }

  try {
    const parsedConfig = appConfigSchema.parse(parsedJson);
    return resolveProvider(parsedConfig);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.issues.map((issue) => issue.message).join("; "));
    }
    throw error;
  }
}

async function readConfigText() {
  try {
    return await invoke<string>("read_root_config");
  } catch {
    const response = await fetch("/config.json", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to load config.json (${response.status})`);
    }

    return response.text();
  }
}
