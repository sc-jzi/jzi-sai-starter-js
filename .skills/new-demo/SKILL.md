---
name: new-demo
description: Single entry point to build a customer demo. Give it the prospect, their website and whatever you know about the opportunity; it picks the route itself (Gong transcript, RFP documents or other material waiting in harness/inbox, interview if there is none, or resume) and runs the whole flow. Use for "/new-demo ...".
---

# /new-demo — one command for the whole demo

The SE types `/new-demo <description>`, e.g. *"create a demo for Acme Corp (acme.com); they struggle with slow campaign launches"*. The SE does not choose a route; this skill does.

## 1. Read the request
- Take from the message: **prospect name**, **website URL**, and everything else the SE said (pains, audience, demo flow, pages wanted, collection, template). Whatever was given is not asked again.
- **The prospect has a live website and the demo is a skinned copy of it (R12).** Find and validate the URL exactly as `demo-from-transcript` Phase T3 "MIRROR RULE" describes (a URL you looked up is validated before any other work; say the result in the first message in one line; ask only when several companies fit). A URL the SE gave is used as given.
- `<customer>` = lower-case kebab slug of the prospect name (`Acme Corp` → `acme-corp`). If the name is ambiguous or missing, ask ONE question for it (the URL is looked up, see above).
- Open with one sentence saying what you are about to do. If this chat already built or discussed another demo, tell the SE once: "Start a new chat for each demo; this chat still carries the other demo's context." and carry on.

## 2. Pick the route (never ask the SE which one)
```
node harness/scripts/demo-route.mjs --customer <customer>
```
| Route | When | What happens |
|---|---|---|
| `resume` | `demo-progress.yaml` exists for this customer | same as `/resume-demo <customer>` (`.skills/resume-demo/SKILL.md`): Marketer MCP check first, then the first unfinished phase |
| `rfp` | an RFP / requirements / tender file waits in `harness/inbox/` (Excel, Word, PDF, any mix; a transcript and supporting files may be there too) | `intake-materials.mjs <customer>` takes everything, converts it to text, and the brief is **RFP-led** (see `demo-from-transcript`, "RFP-led brief") |
| `transcript` | a Gong-style transcript waits in `harness/inbox/` (nothing RFP-like) | `intake-materials.mjs <customer>` stores it; the brief is built from it |
| `materials` | other files wait (brand guide, screenshots ...) | they are stored and read; the brief comes from the interview |
| `interview` | no transcript | `intake-materials.mjs <customer> --none`; the brief comes from `harness/templates/demo-interview.md`, skipping what the SE already wrote in the request |

State the route in one line ("No transcript or RFP in the inbox, so I'll interview you." / "Found `acme-call.txt` and `rfp.xlsx` in the inbox, building an RFP-led brief.").

## 3. Run the flow
Follow `.skills/demo-from-transcript/SKILL.md` from Phase T0 with the route above (it is the engine behind this command): preflight and dependency check, brief, **gate 1: the story** (Chain of Pain, AAA, message map, moments with show → reveal, talk track and click path; approved before anything is measured, planned or themed), Sitecore choices, measurement, page and component plan per page from the section screenshots, theme proposal, **gate 2: the build plan** (pages, components, theme, Sitecore), then site creation, bootstrap, build and hand-over (thumbnails are manual tasks).
The dependency check includes the Sitecore Marketer MCP: `list_sites` must return before intake. Not connected: send the authentication request and ask the SE to connect. If that request times out, the run stops with `blockedOn: marketer-mcp-auth` in `demo-progress.yaml`, and the SE continues later with `/resume-demo <customer>` (T0 in `demo-from-transcript`).

Details from the request become part of the brief marked *stated by the SE*. If a transcript exists and the request contradicts it, show the conflict at the gate instead of picking silently.

## One continuous run
After the SE approves the plan the run does not stop, hand back or ask until the hand-over (rules: "Continuous run" in `demo-from-transcript`). Only the editing host and what a person alone can do go to `manual-tasks.md`; everything else is built, and the run is finished only when `node harness/scripts/run-gate.mjs check <customer>` exits 0. Never end a turn, summarise or hand over while it exits 4: do the unfinished item it names.

## Rules
`.skills/RULES.md` (R1–R24) applies in full (nothing outside the customer folder and its own new site is touched; no secrets in chat; no invented facts).

## Always ask, never assume
The SE approves the story on its own first, then chooses the Sitecore collection and the site template (offered as options; `Empty` template recommended) and approves the build plan. Both are printed in the chat message before asking. Details in `demo-from-transcript` phases T2b, T2 and T4.
