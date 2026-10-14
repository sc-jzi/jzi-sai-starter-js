---
name: new-demo
description: Single entry point to build a customer demo. Give it the prospect, their website and whatever you know about the opportunity; it picks the route itself (Gong transcript, RFP documents or other material waiting in harness/inbox, interview if there is none, or resume) and runs the whole flow. Use for "/new-demo ...".
---

# /new-demo — one command for the whole demo

The SE types `/new-demo <description>`, e.g. *"create a demo for Acme Corp (acme.com); they struggle with slow campaign launches"*. The SE does not choose a route; this skill does.

## 1. Read the request
- Take from the message: **prospect name**, **website URL**, and everything else the SE said (pains, audience, demo flow, pages wanted, collection, template). Whatever was given is not asked again.
- `<customer>` = lower-case kebab slug of the prospect name (`Acme Corp` → `acme-corp`). If the name is ambiguous or missing, ask ONE question for it (and the URL if missing).
- Open with one sentence saying what you are about to do.

## 2. Pick the route (never ask the SE which one)
```
node harness/scripts/demo-route.mjs --customer <customer>
```
| Route | When | What happens |
|---|---|---|
| `resume` | `demo-progress.yaml` exists for this customer | continue from the first unfinished phase ("Resume" in `demo-from-transcript`) |
| `rfp` | an RFP / requirements / tender file waits in `harness/inbox/` (Excel, Word, PDF, any mix; a transcript and supporting files may be there too) | `intake-materials.mjs <customer>` takes everything, converts it to text, and the brief is **RFP-led** (see `demo-from-transcript`, "RFP-led brief") |
| `transcript` | a Gong-style transcript waits in `harness/inbox/` (nothing RFP-like) | `intake-materials.mjs <customer>` stores it; the brief is built from it |
| `materials` | other files wait (brand guide, screenshots ...) | they are stored and read; the brief comes from the interview |
| `interview` | no transcript | `intake-materials.mjs <customer> --none`; the brief comes from `harness/templates/demo-interview.md`, skipping what the SE already wrote in the request |

State the route in one line ("No transcript or RFP in the inbox, so I'll interview you." / "Found `acme-call.txt` and `rfp.xlsx` in the inbox, building an RFP-led brief.").

## 3. Run the flow
Follow `.cursor/skills/demo-from-transcript/SKILL.md` from Phase T0 with the route above (it is the engine behind this command): preflight and dependency check, brief, theme proposal, page and component plan, **one approval gate** (story, pages, theme, Sitecore plan), then site creation, bootstrap, build, thumbnail and hand-over.

Details from the request become part of the brief marked *stated by the SE*. If a transcript exists and the request contradicts it, show the conflict at the gate instead of picking silently.

## One continuous run
After the SE approves the plan the run does not stop, hand back or ask until the hand-over (rules: "Continuous run" in `demo-from-transcript`). A missing editing host, an unreadable field or an API limit becomes a line in `manual-tasks.md`, never a pause. Do not end a turn with "say resume demo" unless something truly blocking failed.

## Rules
All hard rules of `demo-from-transcript` apply (nothing outside the customer folder and its own new site is touched; no secrets in chat; no invented facts).

## Always ask, never assume
The SE chooses the Sitecore collection and the site template (offered as options; `Empty` template recommended) and approves the full plan, which you print in the chat message before asking. Details in `demo-from-transcript` phases T2 and T4.
