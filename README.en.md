# Task Manager 2.0

A local-first desktop task extraction tool built with `Tauri + React + TypeScript`.

The app is designed to do one thing well: convert free-form text or pasted images into structured task cards.

[中文文档](./README.zh-CN.md) | [Repository Home](./README.md)
![Homepage](./homepage.png)
## Introduction

Task Manager 2.0 follows a very small and focused workflow:

1. Enter text or paste an image
2. Send it to the model provider configured in root `config.json`
3. Extract a task
4. Generate a task card
5. Save it locally

The current product scope is intentionally minimal. It is a task extractor, not a full project management suite.

## Features

1. Local desktop runtime with `Tauri`
2. Text input support
3. Pasted image input support
4. Root-level `config.json` provider configuration
5. OpenAI-compatible model integration
6. Exactly one task extracted per request
7. `note` output formatted as key-value lines, for example:

```txt
Time: Next Tuesday
Location: Room 318
Requirement: Bring printed materials
```

8. Light / dark theme toggle
9. Local task persistence in `tasks.json`

## UI

The current UI contains two primary views:

1. `Chat`
   - Default startup view
   - ChatGPT-style centered input surface
   - Supports text input and pasted images

2. `View Tasks`
   - Shows only task titles by default
   - Click an item to expand the `note`
   - Supports task deletion

## Tech Stack

1. `Tauri`
2. `React`
3. `TypeScript`
4. `Vite`
5. `Tailwind CSS`
6. `zod`

## Project Structure

```txt
.
├─ config.json
├─ README.md
├─ README.zh-CN.md
├─ README.en.md
├─ Task Board.md
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ config/
│  ├─ features/
│  │  ├─ extraction/
│  │  └─ tasks/
│  ├─ hooks/
│  └─ types/
└─ src-tauri/
```

## Requirements

Before running the project, make sure your machine has:

1. Node.js 22+
2. npm 11+
3. Rust
4. Cargo
5. Local Tauri build prerequisites

## Install

```bash
npm install
```

## Configuration

The project requires a root `config.json` file.

Example:

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
        "apiKey": "YOUR_API_KEY",
        "imageInputEnabled": true,
        "setCacheKey": true,
        "baseURL": "https://your-openai-compatible-endpoint/v1",
        "headers": {
          "Authorization": "Bearer YOUR_API_KEY"
        }
      }
    }
  },
  "activeProvider": "openai-main",
  "activeModel": "gpt-5.4"
}
```

### Config Rules

1. `activeProvider` must exist in `providers`
2. `activeModel` must exist in `providers[activeProvider].models`
3. `apiKey` must not be empty
4. `baseURL` must be a valid URL
5. The current implementation supports only `npm: "@ai-sdk/openai"`
6. `imageInputEnabled` controls whether image input is allowed

## Run

Browser dev mode:

```bash
npm run dev
```

Desktop dev mode:

```bash
npm run tauri:dev
```

Frontend build:

```bash
npm run build
```

Desktop build:

```bash
npm run tauri:build
```

## Extraction Rules

The current extraction logic enforces these constraints:

1. Exactly one task per input
2. Multiple tasks are not allowed
3. If the input contains multiple actions, the model must merge them into one primary task
4. `note` should be formatted as multi-line key-value text
5. Output must be valid JSON

## Example Output

```txt
Title: Submit the American Religion terminology summary

Note:
Time: Before next class
Scope: Group assignment
Context: “American Religion” chapter
Requirement: Organize and submit the terminology list
```

## Persistence

In desktop mode, tasks are not stored only in browser `localStorage`.

The current implementation:

1. Writes tasks into `tasks.json` under the local app data directory
2. Keeps tasks after the app is closed
3. Restores tasks on restart
4. Tries to migrate older `localStorage` task data into `tasks.json`

## Known Limitations

1. Only single-task extraction is supported right now
2. Only OpenAI-compatible providers are supported
3. The task model currently contains only `title` and `note`
4. `View Tasks` currently supports expand and delete, not full editing
5. Some model gateways may still require additional compatibility handling for non-standard JSON output

## Troubleshooting

### 1. `Failed to load config.json`

Check:

1. Whether `config.json` exists in the project root
2. Whether the JSON format is valid
3. Whether `baseURL` is a valid URL

### 2. JSON parsing errors during extraction

Possible causes:

1. The model did not return strict JSON
2. The gateway response format is only partially compatible

The project already includes one layer of JSON repair logic, but some providers may still need extra compatibility work.

### 3. Tasks disappear after closing the app

The current version uses Tauri-backed local file persistence.

If tasks still disappear, check:

1. Whether you are running the desktop app with `npm run tauri:dev`
2. Whether the local app data directory is writable

## Roadmap

Possible future improvements:

1. SQLite persistence
2. Full task editing
3. Export `tasks.json`
4. More provider adapters
5. Local model support
6. Batch image import

## Security Note

1. Root `config.json` currently allows plaintext API keys
2. Do not commit real secrets to a public repository
3. For public releases, use placeholders or add environment-variable overrides later
