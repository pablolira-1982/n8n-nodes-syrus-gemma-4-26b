# PRD — Syrus Gemma 4 26B Chat Model for n8n

Version: 1.0 — 2026-10-14

## Product vision

Offer Syrus Gemma 4 26B as an easy-to-configure n8n Chat Model sub-node, so n8n self-hosted users can use Syrus in AI Agent and compatible LLM workflows rather than writing manual HTTP requests.

## Target users

- n8n workflow automation developers
- AI/LLM agent builders
- Portuguese-speaking businesses, while public plugin UI and README remain in English per n8n verification guidance.

## MVP scope (P0)

1. A genuine n8n AI Language Model sub-node, selectable via AI Agent Chat Model connection in a **tested** self-hosted n8n release.
2. Official up-to-date Syrus brand SVG and display title.
3. Secret n8n credential using `syrus-api-key` header.
4. POST `/generate` text generation, request/response conversion, normal history.
5. Five configurable settings: Max Output Tokens, Temperature, Top P, Top K, Stop Sequences.
6. Robust output and API error handling, timeouts, modest retries.
7. English README.md documenting install, configuration, parameter tuning, examples, limits, troubleshooting, security and npm publishing.
8. CI, tests, dependency audit, package scanning, release workflow with provenance.
9. Explicit feature-detection test for AI Agent tool calling (working OR clearly reported as unsupported).

## Not in scope unless verified (P1/P2)

- Native streaming; function/tool calling; media/image/audio; structured JSON schema; thinking controls; token accounting; rate-limit detection from proprietary headers; n8n Cloud official verification.
- These features must never be advertised without passing integration tests.

## User stories and acceptance criteria

| Priority | Story | Done when |
|---|---|---|
| P0 | As a user I find Syrus under Chat Model options | Shown in supported self-hosted n8n AI Agent Chat Model picker |
| P0 | As a user I store API key once | Credentials field is secret and requests include correct header |
| P0 | As a user I adjust creativity/output | Five settings serialize exactly to `generationConfig` |
| P0 | As a user I define stop markers | Stops are editable and serialized as JSON array |
| P0 | As a user I understand failures | Errors distinguish authentication/rate limit/server/timeouts |
| P0 | As a user I follow setup docs | Fresh installation succeeds following README alone |
| P0 | As publisher I release securely | GitHub Action publishes with npm provenance after tests pass |
| P0 | As admin I can audit the package | Package has MIT, public source, zero exposed secrets, clear versioning |

## UX contract

Node display label: `Syrus Gemma 4 26B Chat Model`.

Credentials: `Syrus API Key` (password input).

Options:

- Max Output Tokens: positive integer; default `8192` as in supplied example, but validate actual service limit.
- Temperature: decimal; default `1`; low values give more repeatable responses, higher values increase variability; validate actual supported range.
- Top P: decimal `0..1` (strictly >0), default `.95`; high value gives larger token selection pool.
- Top K: positive integer, default `40`; restricts token candidate count, if Syrus permits it.
- Stop Sequences: repeatable string list / validated JSON array, default `[]`; stop when matching a listed string, limit subject to Syrus contract.
- Advanced: request timeout, optional override/omit API defaults.

Explain that `maxOutputTokens` is output capacity, not a guarantee of output length; combinations of Top P/Top K/temperature interact; stop sequences are **literal substrings** not regex.

## Technology and delivery

- TypeScript and current n8n official node scaffold.
- n8n extension APIs compatible with a true Chat Model sub-node; choose feasible integration only after an actual installed-n8n proof of concept.
- HTTP transport with safe credential handling and deterministic request serialization.
- Unit tests plus live contract tests using an expendable key held in local secure environment/CI secret (never checked into repository).
- Do **not** claim n8n Cloud compatibility where community-node sandbox prevents required model classes.

## Milestones

M1 — Research: confirm Syrus response format, supported roles, auth and features; verify target n8n API.

M2 — Proof of concept: real model sub-node appears in supported AI Agent and answers a prompt.

M3 — Settings and diagnostics: all five inputs, validation, error handling, credentials.

M4 — Branding and docs: verified official logo plus completed README and sample workflow.

M5 — Quality: unit/integration tests, security and compatibility matrix.

M6 — Publication: GitHub, package validation, trusted npm release with provenance; optional n8n verification submission.

## Release blockers

- No functioning AI Agent Chat Model linkage on the claimed platform.
- Unknown or unparseable API response JSON.
- No official/current approved Syrus logo.
- Missing README or API key included in published assets.
- Failing lint/build/test/package scan.
- Unverified claims of streaming or tool calling.
- Missing provenance on a release intended for official verification.

## Success metrics

- 100% pass for required acceptance and contract tests.
- Example AI Agent conversation works end to end on documented supported n8n version.
- New user can install and configure using README alone.
- 0 leaked secrets; `npm pack --dry-run` shows complete runtime assets.

## Risk register

| Risk | Mitigation |
|---|---|
| Syrus format only resembles Gemini API | Run contract tests before selecting response mapper |
| AI Agent expects tool calling | Detect and document limitation or implement after API confirmation |
| n8n Cloud disallows required imports | Limit first release to tested self-hosted installation; avoid unverifiable Cloud claims |
| No official logo asset | Require approved owner-provided SVG before public release |
| Model refuses Top K or token maximum | Validate actual API constraints and expose server errors clearly |
| n8n/SDK internal APIs change | Pin supported versions and run compatibility matrix on CI |
