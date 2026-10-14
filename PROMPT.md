# IMPLEMENTATION PROMPT — Syrus Gemma 4 26B n8n Community Chat Model

You are a senior TypeScript engineer specialized in n8n Community Nodes, AI Language Model sub-nodes, package publishing, credential handling and API adapters.

## Mission

Implement a complete, production-quality project in the current folder, named `node-syrus-gemma-4-26b`, targeting the npm package `n8n-nodes-syrus-gemma-4-26b`. Read `SPEC.md` and `PRD.md` fully and honor all acceptance criteria. Do not merely build an HTTP action node: the goal is to have `Syrus Gemma 4 26B Chat Model` **visible and selectable from the AI Agent Chat Model connection** on a documented, tested n8n self-hosted version.

## Critical rules

1. Start by inspecting the latest official n8n node starter, community node verification rules, custom language-model support, relevant available n8n versions and restrictions in verified/cloud environments. Confirm whether the selected approach genuinely exposes an AI Language Model. If it is infeasible with the chosen runtime, state the blocker and demonstrate the nearest compliant solution without claiming the original requirement works.
2. Research/obtain the CURRENT OFFICIAL Syrus logo through an approved official source or asset provided by the owner. Preserve its brand design and install as sanitized SVG in the node. Never invent a replacement or release without confirmed asset.
3. Do not copy, echo, log, save or publish any API key appearing in the user's sample cURL. Treat that sample credential as compromised. Use only secure n8n credential storage and a disposable replacement key for tests.
4. Implement a POST request to `https://gemma-4-26b.syrus.ia.br/generate`, using header `syrus-api-key` from credentials and `Content-Type: application/json`.
5. Use a `contents` array with `{role, parts:[{text}]}` and `generationConfig` with `maxOutputTokens`, `temperature`, `topP`, `topK`, `stopSequences`. Handle multi-turn history and response mapping; **first inspect real API response JSON** (the user supplied only a request, no response).
6. Defaults: `8192`, `1`, `.95`, `40`, `[]`. Each option must be editable independently, validated, documented, serialized without null/undefined mistakes. `stopSequences` is an array of literal strings, not comma-separated parsing. Include a readable helper/description.
7. Implement the correct Chat Model integration, not a fake mock UI. Test real AI Agent invocation. Determine whether Syrus implements system instructions, tool calls and streaming. If not, clearly document functional limits; do not fabricate outputs.
8. Use current official n8n CLI scaffold and TypeScript, strong types, clear separation of transport/message mapping/response parsing, proper error types, safe timeouts/retries and mock-based unit tests.
9. Public interface strings, code comments intended for documentation, README and package metadata must be English to align with official n8n verification guidance.
10. Include LICENSE (MIT, correct rights holder), README.md, SPEC.md, PRD.md, package metadata, test fixtures, sample exported workflow, GitHub Actions CI and publish workflow using npm provenance and (where possible) OIDC trusted publisher.
11. Do not add unrelated providers, hidden analytics, arbitrary outbound domains or unnecessary runtime dependencies. Review all node restrictions.
12. Run `npm ci`, lint, build, test, npm pack dry run, community package scanner and a real n8n local integration test. Report actual success/failure without inventing results. Show installed n8n and Node.js version matrix.

## README.md mandatory sections

- Logo and full project/product name
- Short introduction with compatibility limitations
- Features and verified vs unverified capability matrix
- Prerequisites and tested n8n/Node.js versions
- Installation through n8n Community Nodes and alternate self-hosted manual install
- Credentials creation using `syrus-api-key` (no real secrets)
- Endpoint and request format
- Complete descriptions of `maxOutputTokens`, `temperature`, `topP`, `topK`, `stopSequences`, recommended values, validation limits and examples
- What stop sequences mean, examples, and warning that literal strings can stop answers early
- Connect Syrus to AI Agent step by step
- Request and response example using fake values and a **verified** response shape (otherwise label illustrative)
- Example workflow and troubleshooting (401/403/429/5xx/timeout, unsupported tool-calling)
- Security/privacy guidance, changelog, development/test/build
- GitHub repository, license, maintainers, publishing and n8n verification status

## Work sequence

A. Audit references, API behavior and n8n AI model integration constraints.
B. Scaffold package, credentials and logo placement.
C. Implement transport and mapped language-model interface.
D. Implement parameter UI, validation, system prompt and message history.
E. Test simulated and real provider results, AI Agent integration, error/secret masking.
F. Produce comprehensive README and example workflow.
G. Configure GitHub CI and npm provenance publishing; validate package contents.
H. Present an honest completion report: files, supported versions, tests passing, unresolved constraints, publishing commands and instructions.

## Definition of done

Deliver working, buildable TypeScript source with true Chat Model connectivity, **not merely skeletons**. Every requirement of SPEC/PRD is tested or clearly marked as a blocker. No real API keys in files. Current official Syrus logo confirmed. README.md included in the published tarball. No claim of official n8n verification until actual review and approval.
