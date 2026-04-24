# Task Manager 2.0

Local-first desktop task extraction tool built with `Tauri + React + TypeScript`.

Turn free-form text or pasted images into structured task cards with a single prompt-driven workflow.

[中文文档](./README.zh-CN.md) | [English](./README.en.md)

## Overview

Task Manager 2.0 is a lightweight desktop app focused on one job:

1. Paste text or an image
2. Send it to a configured model provider
3. Extract exactly one task
4. Save it locally

The project intentionally keeps the product scope small and pragmatic.

## Highlights

1. Local desktop runtime with `Tauri`
2. Text input and pasted image input
3. Root-level `config.json` provider configuration
4. OpenAI-compatible model integration
5. Single-task extraction per request
6. Structured `note` output in key-value format
7. Dark / light mode toggle
8. Local persistence to `tasks.json`

## UI

1. `Chat`
   Start view with a ChatGPT-style centered input surface.
2. `View Tasks`
   Minimal task list showing only the title by default. Click to expand the note.

## Quick Start

### Requirements

1. Node.js 22+
2. npm 11+
3. Rust
4. Cargo
5. Tauri local build prerequisites

### Install

```bash
npm install
```

### Configure

Create a root `config.json`:

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

### Run

Browser dev mode:

```bash
npm run dev
```

Desktop dev mode:

```bash
npm run tauri:dev
```

Production build:

```bash
npm run build
```

## Example Output

```txt
Title: 提交美国宗教术语整理

Note:
时间：下次上课前
对象：小组作业
背景：教材《美国宗教》章节
要求：整理相关术语并提交
```

## Persistence

Desktop mode stores task data in a local `tasks.json` file under the app data directory.

That means:

1. Tasks survive app restarts
2. Data is local to the machine
3. Existing `localStorage` tasks can be migrated forward

## Docs

1. [中文文档](./README.zh-CN.md)
2. [English documentation](./README.en.md)
3. [Planning notes](./Task%20Board.md)

## Current Scope

1. Exactly one task per extraction
2. OpenAI-compatible providers only
3. Minimal task model: `title` + `note`
4. Local-first desktop experience

## Security Note

`config.json` currently allows plaintext API keys.

Do not commit real secrets to a public repository.
