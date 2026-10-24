---
name: resume-demo
description: Continue a customer demo build that stopped (Marketer MCP not connected, a cut turn, a gate the SE has not answered yet). Re-checks the Sitecore Marketer MCP first, then picks up at the first unfinished phase. Use for "/resume-demo <customer>" or "resume demo".
---

# /resume-demo <customer>

The SE types `/resume-demo <customer>` (e.g. `/resume-demo ampp`) after a run stopped. Typically the Marketer MCP was not connected and the auth request timed out.

## 1. Find the run
- `<customer>` comes from the message. Without one, list the folders under `industry-verticals/` whose `docs/ai/demos/<customer>/demo-progress.yaml` exists and ask ONE question with them as options.
- Read `industry-verticals/<customer>/docs/ai/demos/<customer>/demo-progress.yaml`, `demo-plan.yaml` (if it exists) and `site.json` (if it exists). Say in one line where the run stopped (the `blockedOn` value, or the first phase that is not `complete`).

## 2. Marketer MCP first, always
Run the T0 Marketer MCP check of `.cursor/skills/demo-from-transcript/SKILL.md` exactly as written: probe `list_sites`; not connected → send the authentication request and ask the SE once; a timeout or "Not now" stops again with `blockedOn: marketer-mcp-auth` and the same one-line message. Nothing else runs before `list_sites` returns.
When it returns: remove the top-level `blockedOn` line from `demo-progress.yaml`, set `transcriptFlow.t0_preflight: { status: complete, marketerMcp: connected }`, and set the phase that was `blocked` back to `pending`.

## 3. Continue where it stopped
Follow "Resume" in `demo-from-transcript`:
- Never recreate a site that exists (the scripts refuse). Skip finished phases. Retry `failed` and `blocked` ones.
- **Before gate 1** (`storyApproved` is not true): finish T1/T2, then show the story gate (T2b). Nothing is measured, planned or themed first.
- **Before gate 2** (`userApproved` is not true): finish T3a/T3/T3b and show the build-plan gate (T4).
- **After gate 2**: `node harness/scripts/run-gate.mjs init <customer>` (re-arms the stop hook for this run), then `node harness/scripts/run-gate.mjs check <customer>` and work through its items in order. That is the "Continuous run": no hand-back until it exits 0.

## Rules
All hard rules of `demo-from-transcript` apply.
