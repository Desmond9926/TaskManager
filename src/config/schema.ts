import { z } from "zod";

const providerModelSchema = z.object({
  name: z.string().min(1),
});

const providerSchema = z.object({
  name: z.string().min(1),
  npm: z.string().min(1),
  models: z.record(providerModelSchema),
  options: z.object({
    apiKey: z.string().min(1, "config.json options.apiKey 不能为空"),
    imageInputEnabled: z.boolean().default(false),
    setCacheKey: z.boolean().optional(),
    baseURL: z.string().url("config.json options.baseURL 必须是合法 URL"),
    headers: z.record(z.string()).default({}),
  }),
});

export const appConfigSchema = z
  .object({
    providers: z.record(providerSchema),
    activeProvider: z.string().min(1),
    activeModel: z.string().min(1),
  })
  .superRefine((config, context) => {
    const provider = config.providers[config.activeProvider];

    if (!provider) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `activeProvider \"${config.activeProvider}\" does not exist`,
        path: ["activeProvider"],
      });
      return;
    }

    if (!provider.models[config.activeModel]) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `activeModel \"${config.activeModel}\" does not exist in provider \"${config.activeProvider}\"`,
        path: ["activeModel"],
      });
    }
  });

export type AppConfig = z.infer<typeof appConfigSchema>;
