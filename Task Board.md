# Task Board

## Project Goal

Build a local-first desktop task management tool with one core flow:

1. User enters text or pastes an image.
2. The app sends the input to a configured model provider.
3. The model extracts actionable tasks.
4. The app creates task cards.
5. Each task card contains only:
   - Task name
   - Note
6. Task cards are stored locally on the machine.

## Product Scope

### MVP In Scope

1. Local desktop app.
2. Text input.
3. Image paste input.
4. Model-based task extraction.
5. Task card generation.
6. Inline edit and delete for cards.
7. Local persistence.
8. Error handling for config and model failures.

### Out Of Scope

1. User accounts.
2. Team collaboration.
3. Priority, tags, due dates.
4. Drag-and-drop kanban.
5. Voice input.
6. Advanced search and filtering.

## Confirmed Decisions

1. App form: desktop application.
2. Runtime: local machine.
3. Model integration: cloud API.
4. Image input: paste image.
5. Task persistence: local storage.
6. API key storage: plaintext in root `config.json` is acceptable.

## Root Config

The root directory must contain `config.json`.

### Example

```json
{
  "providers": {
    "openai-main": {
      "name": "OpenAI-Micu",
      "npm": "@ai-sdk/openai",
      "models": {
        "gpt-5.4": {
          "name": "gpt-5.4"
        }
      },
      "options": {
        "apiKey": "my_apikey",
        "imageInputEnabled": true,
        "setCacheKey": true,
        "baseURL": "my_base_url",
        "headers": {}
      }
    }
  },
  "activeProvider": "openai-main",
  "activeModel": "gpt-5.4"
}
```

### Config Rules

1. `activeProvider` must exist in `providers`.
2. `activeModel` must exist in `providers[activeProvider].models`.
3. `options.apiKey` must not be empty.
4. `options.baseURL` must be a valid URL.
5. `imageInputEnabled` controls whether image paste is usable.
6. `headers` is passed through to model requests.
7. `npm` is used as a provider type marker, not for dynamic runtime installs.

## Recommended Tech Stack

1. Desktop shell: `Tauri`
2. Frontend: `React + TypeScript + Vite`
3. Styling: `Tailwind CSS`
4. Validation: `zod`
5. Persistence: local storage for MVP

## Architecture

### Layers

1. Desktop shell
   - Runs the app locally through Tauri.
2. UI layer
   - Input area, image paste area, task card list, error states.
3. Config layer
   - Reads and validates root `config.json`.
   - Resolves active provider and active model.
4. Model adapter layer
   - Converts config into a unified provider call.
5. Extraction layer
   - Builds prompts, validates JSON response, maps output to cards.
6. Local persistence layer
   - Stores tasks on the local machine.

## UI Structure

### Main Regions

1. Header
   - App name
   - Current provider and model
   - Config status
2. Input panel
   - Multi-line text input
   - Paste image zone
   - Image preview
   - Extract button
3. Task area
   - Task card list
   - Empty state
   - Inline edit and delete

### Task Card Fields

Each card only shows:

1. `title`
2. `note`

## Data Model

### Config

```ts
type AppConfig = {
  providers: Record<string, {
    name: string;
    npm: string;
    models: Record<string, {
      name: string;
    }>;
    options: {
      apiKey: string;
      imageInputEnabled?: boolean;
      setCacheKey?: boolean;
      baseURL: string;
      headers?: Record<string, string>;
    };
  }>;
  activeProvider: string;
  activeModel: string;
};
```

### Tasks

```ts
type TaskCard = {
  id: string;
  title: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

type ExtractionInput = {
  text?: string;
  imageDataUrl?: string;
};

type TaskDraft = {
  title: string;
  note: string;
};
```

## Directory Blueprint

```txt
/
  config.json
  Task Board.md
  package.json
  vite.config.ts
  tsconfig.json
  src/
    app/
      App.tsx
      bootstrap.ts
    components/
      AppHeader.tsx
      InputPanel.tsx
      PasteZone.tsx
      TaskList.tsx
      TaskCard.tsx
      EmptyState.tsx
      ErrorBanner.tsx
    config/
      schema.ts
      load-config.ts
      resolve-provider.ts
    features/
      extraction/
        extract-tasks.ts
        prompts.ts
        schema.ts
        map-to-cards.ts
      tasks/
        storage.ts
        task-types.ts
    hooks/
      useImagePaste.ts
      useTasks.ts
    lib/
      ids.ts
      time.ts
      image.ts
    types/
      config.ts
  src-tauri/
    ...
```

## Core Flows

### App Startup

1. Read root `config.json`.
2. Validate with schema.
3. Resolve active provider.
4. Resolve active model.
5. Check image support.
6. Load saved local tasks.
7. Render app.

### Text Extraction

1. User enters text.
2. User clicks extract.
3. App resolves provider and model from config.
4. App builds extraction prompt.
5. App sends request to the model.
6. App parses JSON response.
7. App validates response shape.
8. App maps valid items into task cards.
9. App saves tasks locally.

### Image Extraction

1. User pastes an image.
2. App reads clipboard image as data URL.
3. App checks `imageInputEnabled`.
4. If disabled, show a clear error.
5. If enabled, send the image to the model.
6. Parse and validate the JSON response.
7. Save generated task cards locally.

## Provider Strategy

### MVP Rule

Only one provider path is implemented first:

1. `@ai-sdk/openai`

### Implementation Notes

1. Keep the `npm` field in config.
2. Do not dynamically install or import arbitrary providers at runtime.
3. Use a small internal mapping based on `npm`.
4. If `npm === "@ai-sdk/openai"`, use the OpenAI-compatible adapter.
5. Add more provider adapters later if needed.

## Prompt Strategy

### System Prompt

```txt
You are a task extraction assistant.
Extract clear and actionable tasks from the user's text or image input.
You must output JSON only.
Do not output explanations.

Each task must contain only:
- title
- note

Requirements:
1. Output in Chinese.
2. Do not invent tasks.
3. Merge duplicates.
4. title must be concise and task-like.
5. note should contain context, time, constraints, or supporting details.
6. Output must strictly match:
{
  "tasks": [
    {
      "title": "任务名称",
      "note": "备注"
    }
  ]
}
```

### User Prompt Cases

Text only:

```txt
请从以下内容中提取任务：

{{text}}
```

Image only:

```txt
请识别这张图片中的待办事项、行动项或任务描述，并提取为任务列表。
```

Text and image:

```txt
请结合以下文本和图片内容一起提取任务，避免重复：

文本：
{{text}}
```

## Response Validation

Model output must be schema-validated before creating cards.

```ts
const ExtractionSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().min(1),
      note: z.string().default(""),
    })
  )
});
```

### Failure Behavior

1. Do not write invalid tasks.
2. Keep current input intact.
3. Show a clear error such as `模型返回格式异常`.

## Persistence Strategy

### Separate Responsibilities

1. Root `config.json` stores model provider configuration.
2. App local storage stores task data.

### Saved Data

1. Task cards
2. Optional input draft

## Error States

The app must explicitly handle:

1. Missing `config.json`
2. Invalid JSON in `config.json`
3. Missing `activeProvider`
4. Missing `activeModel`
5. Empty `apiKey`
6. Invalid `baseURL`
7. Image extraction disabled by config
8. Request failure or timeout
9. Invalid model response JSON

## Delivery Order

1. Initialize `Tauri + React + TypeScript + Tailwind`.
2. Implement root config schema and loader.
3. Show current provider and model in the UI.
4. Build text input and static task card UI.
5. Add local task persistence.
6. Implement text extraction through the OpenAI-compatible adapter.
7. Add image paste and preview.
8. Gate image extraction with `imageInputEnabled`.
9. Add error handling and empty states.
10. Verify local packaging and startup.

## Acceptance Criteria

1. The desktop app starts locally.
2. The app reads root `config.json` successfully.
3. The app resolves `activeProvider` and `activeModel`.
4. Text input can generate task cards.
5. Pasted image can generate task cards when enabled.
6. Each card contains only task name and note in the UI.
7. Cards can be edited and deleted.
8. Task data persists after restart.
9. Config and model failures are shown clearly without crashing the app.

## Immediate Next Build Steps

1. Create project scaffold in the root directory.
2. Add root `config.json` support.
3. Implement the base desktop UI.
4. Wire text extraction before image extraction.
5. Finish local persistence and error handling.
