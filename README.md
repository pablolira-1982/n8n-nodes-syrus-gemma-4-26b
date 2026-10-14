# Syrus Gemma 4 26B Chat Model for n8n

<p align="center">
  <img src="assets/syrus-logo.svg" alt="Syrus AI Logo" width="120" height="120" />
</p>

<p align="center">
  <strong>Official community AI Chat Model sub-node for Syrus Gemma 4 26B on n8n.</strong>
</p>

---

## Overview

- **npm package:** `n8n-nodes-syrus-gemma-4-26b`
- **n8n display name:** `Syrus Gemma 4 26B Chat Model`
- **Sub-node connection type:** `ai_languageModel` (attaches directly to the **Chat Model** input of n8n's **AI Agent** node).
- **Service Endpoint:** `POST https://gemma-4-26b.syrus.ia.br/generate`
- **Authentication:** `syrus-api-key` header (securely managed via n8n credentials).
- **Repository:** https://github.com/pablolira-1982/n8n-nodes-syrus-gemma-4-26b

---

## Features

- **Genuine AI Language Model Sub-node:** Appears directly under the **AI Agent** `Chat Model` connection picker in self-hosted n8n.
- **Multi-turn History:** Maintains full conversation context mapping human and AI interactions to the Gemma `contents` array (`role: 'user'` and `role: 'model'`).
- **System Instructions Support:** Automatically translates system prompts into structured context guidelines for the model.
- **Granular Generation Controls:** Independently configure `maxOutputTokens`, `temperature`, `topP`, `topK`, and `stopSequences`.
- **Zero Secret Exposure:** Credentials are fully encrypted by n8n and isolated from execution parameters, outputs, and log streams.

---

## Capability & Verification Matrix

| Feature | Support Status | Notes |
|---|---|---|
| AI Agent Chat Model Connection | Supported | True `ai_languageModel` sub-node |
| Text Generation | Supported | Native `POST /generate` mapping |
| Multi-turn Chat Conversation | Supported | Preserves ordered message history |
| System Prompts | Supported | Formatted as instruction context |
| Stop Sequences | Supported | Passed as JSON string array to `generationConfig` |
| Streaming | Not Supported / Unverified | Syrus batch completion mode |
| Function / Tool Calling | Implemented in adapter; requires Syrus endpoint support | Sends Gemini-style `functionDeclarations` and maps `functionCall`/`functionResponse`; verify against the deployed Syrus API |
| n8n Self-Hosted | Tested | Node.js >= 20.x, n8n >= 1.0.0 |
| n8n Cloud | Unverified | Community node sandbox restrictions may apply |

---

## Installation

### Via n8n Community Nodes (Recommended)
1. In your self-hosted n8n instance, navigate to **Settings** > **Community Nodes**.
2. Select **Install a community node**.
3. Enter the package name:
   ```text
   n8n-nodes-syrus-gemma-4-26b
   ```
4. Agree to the risks of installing third-party community code and click **Install**.

### Manual Installation (Self-Hosted Docker or Bare Metal)
From within your n8n custom nodes directory:
```bash
npm install n8n-nodes-syrus-gemma-4-26b
```
Restart your n8n container or instance to load the node.

---

## Credentials Setup

1. In n8n, navigate to **Credentials** > **New Credential**.
2. Search for **Syrus Gemma API** (`syrusGemmaApi`).
3. Enter your private **Syrus API Key**.
4. Save the credential.

> **Security Note:** Never check in, log, or export workflows containing plain-text keys. The node injects the key into the HTTP transport header `syrus-api-key` during runtime execution.

---

## Model Settings & Tuning Guide

| Parameter | Type | Default | Description & Recommended Values |
|---|---|---:|---|
| **Max Output Tokens** | Number | `8192` | Upper bound capacity for token generation. Use `512`–`2048` for concise responses, up to `8192` for long outputs. |
| **Temperature** | Number | `1.0` | Controls randomness. Lower values (`0.0`–`0.3`) produce repeatable, structured answers. Higher values (`0.7`–`1.0`) encourage creativity. |
| **Top P** | Number | `0.95` | Nucleus sampling threshold (cumulative probability mass). Keep between `0.8` and `0.95`. |
| **Top K** | Number | `40` | Limits next-token pool to the K most likely candidates. Standard starting point is `20`–`40`. |
| **Stop Sequences** | JSON Array | `[]` | Literal substrings where generation will halt immediately (e.g. `["END", "###"]`). |
| **Request Timeout** | Number (ms) | `60000` | Abort request if Syrus does not respond within this timeframe. |

### Stop Sequences Explained
Stop sequences must be entered as a **valid JSON array of strings**, for example:
```json
["END", "###", "</answer>"]
```
- **Literal Matching:** Stop sequences match exact character sequences, not regex patterns.
- **Do not use commas as plain text:** Comma-separated strings are rejected to avoid splitting delimiters that contain commas.

---

## Quickstart: Connecting to n8n AI Agent

1. Add an **AI Agent** node to your workflow.
2. In the canvas, find the bottom connection labeled **Chat Model**.
3. Drag a connection and search for **Syrus Gemma 4 26B Chat Model**.
4. Select your **Syrus Gemma API** credential.
5. In the node options, adjust **Temperature** or **Max Output Tokens** if needed.
6. Connect a trigger (such as **Manual Trigger** or **Chat Trigger**) and test!

An example exported workflow is provided in [`examples/agent-basic-workflow.json`](examples/agent-basic-workflow.json).

---

## Troubleshooting

- **401 / 403 Unauthorized:** Verify that your Syrus API key is active and correctly pasted into the n8n credential.
- **429 Rate Limit Exceeded:** The upstream service has throttled requests. Reduce concurrent executions or introduce delay nodes.
- **500 / 502 / 503 Server Error:** Transient upstream issue. The node will retry with bounded backoff before reporting a failure.
- **Connection Timed Out:** Check if your server has unrestricted outbound HTTPS access to `https://gemma-4-26b.syrus.ia.br`.
- **Node not visible in Chat Model picker:** Verify that you are running a supported self-hosted version of n8n with LangChain integration enabled.

---

## Development & Testing

```bash
# Clone and install dependencies
npm install

# Build TypeScript to dist/
npm run build

# Run unit tests
npm run test

# Dry-run package contents for npm
npm pack --dry-run
```

### Tool-calling compatibility

The adapter exposes LangChain's `bindTools()` contract required by n8n's Tools Agent. It serializes tools using Gemini-style `tools[].functionDeclarations[]` and maps returned `functionCall` parts to LangChain tool calls. The deployed Syrus `/generate` service must accept this contract; a successful package build does not prove upstream tool-calling support. Test one real tool invocation before production use.

## Changelog

### 1.0.1

- Implemented the `bindTools()` Chat Model contract required by n8n Tools Agent.
- Added Gemini-style tool declaration, function-call response, and tool-result mapping.
- Added unit coverage for tool-calling message and response conversion.

---

## License

[MIT](LICENSE) © 2026 Syrus AI.
