import type { AppConfig } from "./schema";
import type { ResolvedConfig } from "../types/config";

export function resolveProvider(config: AppConfig): ResolvedConfig {
  const provider = config.providers[config.activeProvider];
  const model = provider.models[config.activeModel];

  return {
    providerKey: config.activeProvider,
    modelKey: config.activeModel,
    provider,
    model,
  };
}
