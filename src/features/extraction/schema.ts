import { z } from "zod";

export const taskDraftSchema = z.object({
  title: z.string().min(1, "任务名称不能为空"),
  note: z.string().default(""),
});

export const extractionSchema = z.object({
  tasks: z.array(taskDraftSchema).length(1, "每次提取必须且只能返回一条任务"),
});

export type TaskDraft = z.infer<typeof taskDraftSchema>;
