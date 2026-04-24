import { ZodError } from "zod";
import type { ResolvedConfig } from "../../types/config";
import { extractionSchema, type TaskDraft } from "./schema";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompts";

type ExtractionInput = {
  imageDataUrl?: string;
  text: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ text?: string; type?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function extractTasks(
  config: ResolvedConfig,
  input: ExtractionInput,
): Promise<TaskDraft[]> {
  if (config.provider.npm !== "@ai-sdk/openai") {
    throw new Error(`当前 provider 暂不支持: ${config.provider.npm}`);
  }

  if (input.imageDataUrl && !config.provider.options.imageInputEnabled) {
    throw new Error("当前 provider 未开启图片输入能力");
  }

  const response = await fetch(buildEndpoint(config.provider.options.baseURL), {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify({
      model: config.model.name,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: buildUserContent(input),
        },
      ],
    }),
  });

  const data = (await response.json()) as ChatCompletionResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `模型请求失败 (${response.status})`);
  }

  const messageContent = data.choices?.[0]?.message?.content;
  const rawText = flattenContent(messageContent);
  if (!rawText) {
    throw new Error("模型没有返回可解析的内容");
  }

  const parsed = parseStructuredJson(rawText);

  try {
    return extractionSchema.parse(parsed).tasks.map((task) => ({
      ...task,
      note: normalizeNote(task.note),
    }));
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.issues.map((issue) => issue.message).join("; "));
    }

    throw new Error("模型返回格式异常");
  }
}

function normalizeNote(note: string) {
  const normalized = note.replaceAll("/n", "\n").replaceAll("\\n", "\n").trim();

  if (!normalized) {
    return "备注：无";
  }

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*•\d.、\s]+/, "").trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "备注：无";
  }

  const keyValueLines = lines.map((line, index) => {
    const existing = line.match(/^([^：:]{1,12})[：:](.+)$/);
    if (existing) {
      return `${existing[1].trim()}：${existing[2].trim()}`;
    }

    return `${index === 0 ? "备注" : `补充${index}`}：${line}`;
  });

  return keyValueLines.join("\n");
}

function buildEndpoint(baseURL: string) {
  const normalized = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  return `${normalized}/chat/completions`;
}

function buildHeaders(config: ResolvedConfig) {
  const headers = new Headers(config.provider.options.headers);
  headers.set("Content-Type", "application/json");

  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${config.provider.options.apiKey}`);
  }

  if (config.provider.options.setCacheKey) {
    headers.set("X-Task-Manager-Cache-Key", `${config.providerKey}:${config.modelKey}`);
  }

  return headers;
}

function buildUserContent(input: ExtractionInput) {
  const prompt = buildUserPrompt(input.text);

  if (!input.imageDataUrl) {
    return prompt;
  }

  return [
    {
      type: "text",
      text: prompt,
    },
    {
      type: "image_url",
      image_url: {
        url: input.imageDataUrl,
      },
    },
  ];
}

function flattenContent(content: string | Array<{ text?: string; type?: string }> | undefined) {
  if (typeof content === "string") {
    return content;
  }

  if (!content) {
    return "";
  }

  return content
    .map((part) => (part.type === "text" ? part.text ?? "" : ""))
    .join("\n")
    .trim();
}

function parseStructuredJson(rawText: string) {
  const trimmed = rawText.trim();

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
      return parseJsonWithRepair(fenced[1]);
    }

    const startIndex = trimmed.indexOf("{");
    const endIndex = trimmed.lastIndexOf("}");

    if (startIndex >= 0 && endIndex > startIndex) {
      return parseJsonWithRepair(trimmed.slice(startIndex, endIndex + 1));
    }

    throw new Error("模型返回格式异常");
  }
}

function parseJsonWithRepair(jsonText: string) {
  try {
    return JSON.parse(jsonText) as unknown;
  } catch {
    return JSON.parse(escapeControlCharactersInJsonStrings(jsonText)) as unknown;
  }
}

function escapeControlCharactersInJsonStrings(input: string) {
  let result = "";
  let inString = false;
  let isEscaped = false;

  for (const char of input) {
    if (inString) {
      if (isEscaped) {
        result += char;
        isEscaped = false;
        continue;
      }

      if (char === "\\") {
        result += char;
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        result += char;
        inString = false;
        continue;
      }

      if (char === "\n") {
        result += "\\n";
        continue;
      }

      if (char === "\r") {
        result += "\\r";
        continue;
      }

      if (char === "\t") {
        result += "\\t";
        continue;
      }

      result += char;
      continue;
    }

    result += char;
    if (char === '"') {
      inString = true;
    }
  }

  return result;
}
