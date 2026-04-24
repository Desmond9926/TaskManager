import type { AppConfig } from "../config/schema";

export type ResolvedConfig = {
  providerKey: string;
  modelKey: string;
  provider: AppConfig["providers"][string];
  model: AppConfig["providers"][string]["models"][string];
};
