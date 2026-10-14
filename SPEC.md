# SPEC — Syrus Gemma 4 26B n8n Chat Model

Version: 1.0.0 — 2026-10-14
Status: Implementation specification (API capabilities not yet verified)

## 1. Identification

- Local project directory: `node-syrus-gemma-4-26b`
- npm package: `n8n-nodes-syrus-gemma-4-26b` (verify name availability before publish)
- n8n display name: `Syrus Gemma 4 26B Chat Model`
- Provider: Syrus AI
- Node type: AI language model sub-node, **not** a conventional action node
- Service endpoint: `POST https://gemma-4-26b.syrus.ia.br/generate`
- Header: `syrus-api-key: <stored credential>` and `Content-Type: application/json`
- Source language: TypeScript
- User interface and public documentation: English for n8n verification purposes.

## 2. Goal and constraints

Implement a model provider selectable from n8n AI Agent Chat Model connections and other AI nodes that accept language models. A conventional HTTP request node **does not fulfill** this requirement. Validate the actual n8n extension API and installed n8n versions before committing to a LangChain implementation: custom AI sub-nodes may have dependency/sandbox restrictions, especially for n8n Cloud and verified community nodes. Do not claim verified/Cloud compatibility unless tested and approved. No unrelated provider integrations.

### Acceptance gates for compatibility

1. Package installs in supported self-hosted n8n.
2. Model appears as a `Syrus Gemma 4 26B Chat Model` choice in the Chat Model connector, not merely the ordinary node list.
3. AI Agent can invoke it for a plain question.
4. Multi-turn chat correctly preserves and maps system, user and assistant messages.
5. Test behavior when AI Agent supplies tool definitions and receives function/tool calls. If API cannot perform tool calling, document limitation and restrict relevant agent functionality; never pretend tools ran.
6. Streaming works only if Syrus supports it and the adapter is implemented; otherwise no fake streaming.
7. Verify compatibility with n8n Cloud/verified node sandbox separately; do not assume it.

## 3. API request specification

Example request (dummy text only; never commit keys):

```bash
curl --request POST 'https://gemma-4-26b.syrus.ia.br/generate' \
  --header 'syrus-api-key: YOUR_SYRUS_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "contents": [{"role": "user", "parts": [{"text": "Hello!"}]}],
    "generationConfig": {
      "maxOutputTokens": 8192,
      "temperature": 1,
      "topP": 0.95,
      "topK": 40,
      "stopSequences": []
    }
  }'
```

Assumptions to verify using a disposable key: response JSON shape, safety errors, empty outputs, supported roles, system instructions, tool calls, JSON mode, streaming, API-defined token limits and parameter ranges. The payload format resembles Google GenerateContent but must **not** be assumed to implement all Gemini features.

## 4. n8n node configuration

| UI name | API mapping | Type | Initial value | Validation |
|---|---|---|---|---|
| Max Output Tokens | `generationConfig.maxOutputTokens` | integer | `8192` | >= 1, <= confirmed Syrus maximum |
| Temperature | `generationConfig.temperature` | number | `1` | initially 0–2, verify Syrus range |
| Top P | `generationConfig.topP` | number | `0.95` | > 0 and <= 1 |
| Top K | `generationConfig.topK` | integer | `40` | >= 1 when set; verify model support |
| Stop Sequences | `generationConfig.stopSequences` | array of strings | `[]` | discard blank entries, preserve order, reject invalid values, verify max count |
| Request Timeout | client setting | milliseconds | `60000` | positive; configurable |
| Retries | client setting | integer | `2` | nonnegative, bounded exponential backoff for transient errors only |

Expose stop sequences as repeatable strings if supported by n8n UI (preferred). If the node framework requires a single field, use a JSON-array field with strict parsing and a clear example: `["END", "###"]`; **do not** split on commas because a stop sequence might contain commas. Distinguish `[]` (no stops) from `['']` (invalid).

All fields must have human-friendly descriptions, min/max input hints and examples. Permit omitting optional generation settings so the service defaults are possible (provide default preset and an advanced override mode). For a user-selected `0` temperature, don't accidentally substitute defaults with falsy checks.

## 5. Credentials

Credential identifier: `syrusGemmaApi` (subject to n8n scaffold naming).

- Required: Syrus API Key, masked/secret.
- Fixed default endpoint for MVP; no arbitrary endpoint switching unless explicitly validated.
- Add authentication header only in network transport; never put the key in node parameters, output or error logs.
- Credential test should be low cost and explicit about its limitations; if no health endpoint exists, use a short test generation only when user requests credential test.
- TLS verification enabled; block plain HTTP fallback and redirects to unrelated hosts.
- Clear differentiation of invalid credentials (401/403), invalid request (400/422), throttling (429), upstream faults (5xx), timeout and DNS/TLS errors.

## 6. Prompt and response mapping

Map compatible input messages and history to `contents`:

- human/user → `{role:'user', parts:[{text:...}]}`
- assistant/AI → `{role:'model', parts:[{text:...}]}` **only if Syrus accepts Gemini-style `model` role**; confirm empirically.
- system instructions → `systemInstruction` only if endpoint supports it; otherwise provide a documented, tested safe fallback or return a clear unsupported-feature error.
- tools, image/audio parts, structured output, multimodal, token usage → implement **only after contract tests**.

Normalize responses to the n8n-compatible language-model return type, preserve provider errors, and do not make assumptions about response candidates. Preserve multi-turn ordering. Don't expose unverified function-calling or JSON-schema options in v1.

## 7. Logo and visuals

Use the **latest official Syrus AI logo**, supplied by the brand owner or obtained from an explicitly authorized, verifiable official asset. Do not invent a logo, use a favicon as a replacement without confirmation, scrape a copyrighted third-party variant, or claim current branding without checking. Asset locations:

- `nodes/SyrusGemma4/syrus.svg` (preferred n8n node SVG)
- `assets/syrus-logo.svg` (official source)

Preserve aspect ratio, correct color treatment, SVG security (no scripts or external resources), crispness at small size, and adequate contrast in light/dark themes. If the authentic current asset is unavailable, ship a clearly labeled placeholder only to local development and **block release** until official logo is supplied.

## 8. Proposed tree

```text
node-syrus-gemma-4-26b/
├── README.md
├── SPEC.md
├── PRD.md
├── PROMPT.md
├── LICENSE
├── package.json
├── package-lock.json
├── tsconfig.json
├── eslint.config.mjs
├── .gitignore
├── .npmignore
├── .github/workflows/{ci,publish}.yml
├── assets/syrus-logo.svg
├── credentials/SyrusGemmaApi.credentials.ts
├── nodes/SyrusGemma4/SyrusGemma4.node.ts
├── nodes/SyrusGemma4/syrus.svg
├── nodes/SyrusGemma4/transport.ts
├── nodes/SyrusGemma4/messageMapper.ts
├── nodes/SyrusGemma4/responseMapper.ts
├── test/{credentials,parameters,messages,response,agent}.test.ts
└── examples/agent-basic-workflow.json
```

Adjust paths and scaffolding to the **current official n8n-node CLI**, rather than forcing obsolete filenames/interfaces.

## 9. Quality and security

- Minimum supported n8n/Node.js versions chosen after reproducing tests, recorded in `README.md`.
- TypeScript strict, ESLint, build, unit tests, integration tests, `npm pack --dry-run`, n8n community package scanner.
- No unreviewed production runtime packages; review verified-node rule for external runtime dependencies.
- Test injection, oversized prompt, Unicode/PT-BR/PT-PT, empty reply, 401, 429, 500, malformed JSON, cancellation/timeout.
- Never leak API keys in logs, workflows, traces, responses or artifacts.
- Lock package dependencies, supply-chain checks, least-privilege GitHub Actions.
- README.md **must** ship inside npm tarball.

## 10. Publishing

Use `n8n-nodes-` prefix and `n8n-community-node-package` keyword. Register node(s) and credentials in `package.json` `n8n` entry with build-output paths. Public GitHub repository, MIT license, author/homepage/bugs/repository metadata, npm package discoverability, semantic versioning. Publish from GitHub Actions with npm provenance (required for n8n verification submissions after 2026-05-01). Prefer npm Trusted Publishing/OIDC where supported. A successful npm publication is **not** equivalent to official n8n verification.

Reference links:
- https://github.com/n8n-io/n8n-nodes-starter
- https://github.com/n8n-io/n8n-docs/blob/main/docs/connect/create-nodes/build-your-node/reference/verification-guidelines.md
- https://ai.google.dev/api/generate-content
