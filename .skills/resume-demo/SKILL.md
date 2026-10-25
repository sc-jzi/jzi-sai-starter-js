---
name: resume-demo
description: Continue a customer demo build that stopped (Marketer MCP not connected, a cut turn, a gate the SE has not answered yet). Re-checks the Sitecore Marketer MCP first, then picks up at the first unfinished phase. Use for "/resume-demo <customer>" or "resume demo".
---

# /resume-demo <customer>

The SE types `/resume-demo <customer>` (e.g. `/resume-demo acme-corp`) after a run stopped. Typically the Marketer MCP was not connected and the auth request timed out.

## 1. Find the run
- `<customer>` comes from the message. Without one, ask the SE ONE question for it (offer the customer named in `harness/.active-run.json`, the last run on this machine, as the first option when that file exists). Never list, open or search other folders under `industry-verticals/` to find it: other demos are invisible (R16). Only the folder the SE names is read.
- Read `industry-verticals/<customer>/docs/ai/demos/<customer>/demo-progress.yaml`, `demo-plan.yaml` (if it exists) and `site.json` (if it exists). Say in one line where the run stopped (the `blockedOn` value, or the first phase that is not `complete`).

## 2. Marketer MCP first, always
Run the T0 Marketer MCP check of `.skills/demo-from-transcript/SKILL.md` exactly as written: probe `list_sites`; not connected → send the authentication request and ask the SE once; a timeout or "Not now" stops again with `blockedOn: marketer-mcp-auth` and the same one-line message. Nothing else runs before `list_sites` returns.
When it returns: remove the top-level `blockedOn` line from `demo-progress.yaml`, set `transcriptFlow.t0_preflight: { status: complete, marketerMcp: connected }`, and set the phase that was `blocked` back to `pending`.

## 3. Continue where it stopped
Follow "Resume" in `demo-from-transcript`:
- Never recreate a site that exists (the scripts refuse). Skip finished phases. Retry `failed` and `blocked` ones.
- **Before gate 1** (`storyApproved` is not true): finish T1/T2, then show the story gate (T2b). Nothing is measured, planned or themed first. After the SE's yes: `node harness/scripts/run-gate.mjs approve <customer> story`.
- **Before gate 2** (`userApproved` is not true): finish T3a/T3/T3b and show the build-plan gate (T4). After the SE's yes: `node harness/scripts/run-gate.mjs approve <customer> plan`.
- If `run-gate.mjs check` says the story or plan changed after approval: show the SE the change, and approve again only on their yes.
- **After gate 2**: `node harness/scripts/run-gate.mjs init <customer>` (re-arms the stop hook for this run), then `node harness/scripts/run-gate.mjs check <customer>` and work through its items in order. That is the "Continuous run": no hand-back until it exits 0.

## Rules
`.skills/RULES.md` (R1–R24) applies in full.
