# Demo method — how every demo story is built

Three frameworks, one structure. The brief and `demo-plan.yaml` carry the fields; `scripts/validate-story.mjs` enforces them; the approval screen shows them.
(Summarised from Force Management's *Command of the Message*, AlphaPresales' AAA, and Peter Cohan's *Great Demo!*. If your own copies word something differently, edit this file — the validator only checks the structure below.)

## 1. Chain of Pain (Great Demo!) — the spine
A **critical business issue (CBI)** is a problem the organisation must solve, not a feature gap. For each CBI record:
| Field | Meaning |
|---|---|
| `name` | A one- or two-word label for the issue (e.g. Governance, Marketer autonomy), used in the demo flow and the talk track |
| `issue` | The critical business issue, in the prospect's words |
| `owners` | Who in the audience feels it (audience ids) |
| `reason` | **Why / source**: the cause of the issue (process, tooling, people, volume) |
| `evidence` + `evidenceType` | A short quote from the transcript, marked `stated` or `inferred` |
| `impact` / `metric` | What it costs them (time, money, risk), only if they said it. Otherwise "not given" |
Rank CBIs by how much emphasis the prospect put on them. `c1` is the most painful.
Never invent a CBI, a reason or a number. A gap is written as a discovery gap and shown to the presenter.

## 2. AAA (AlphaPresales) — per audience
For every person or role in the room: **Audience** (who, what they own), **Annoyance** (what bugs them today), **Afterward** (what their working day looks like once it is solved). Every demo moment names the audience it is for and speaks to that person's annoyance and afterward.

## 3. Command of the Message (Force Management) — the message map
| Field | Meaning |
|---|---|
| `before` | The situation today and its negative consequences |
| `requiredCapabilities` | What they need to be able to do to fix it (stated as needs, not product features) |
| `after` | Positive business outcomes |
| `metrics` | How they will measure success (theirs, not ours) |
| `differentiators` | Why this approach / why Sitecore against the incumbent or alternatives |
| `proofPoints` | Evidence it works: customer story, analogue, or "none yet" |
| `whyNow` | The compelling event or deadline, if any |

## 4. Demo structure (Great Demo!)
1. **Situation slide** (`story.situation`): 2–4 sentences saying back what we understood: who they are, their CBIs, what success looks like. The presenter confirms it before showing anything.
2. **Do the last thing first.** Moment 1 (`wow: true`) shows the end result that solves the top CBI (`c1`), finished, before any "how". The audience should react to the outcome in the first minutes. Detail comes only if they ask.
3. **Then the rest, in CBI priority order**, one moment per CBI (a moment may cover two). Every moment: CBI(s) → audience → annoyance → afterward → capability → what must be visible on screen → a check-in question for the audience ("is this how you'd want to ...?").
3b. **Show first, reveal after (the last thing first, inside every moment).** `show` is the result on the site as the visitor sees it. `reveal` is the Sitecore screen that made it (Pages, Personalize, Content Hub, the component library, workflow). The audience reacts to the outcome before they see how. If the prospect complains they cannot personalize, the moment opens on the personalized page and only then opens Personalize on that component. A personalization moment names its `trigger` (the visit or signal) and puts the triggering page on its click path BEFORE the page that changes.
3c. **Click path.** Every moment lists the pages the SE clicks through (`clickPath`), from /Home, each step saying what is clicked (`/Home/membership (click: Membership in the header)`). The click path decides which pages are built in full: every page on it mirrors its live page, section by section, with its own components. Pages that are only in the menu are title-only stubs.
3d. **Talk track.** One or two sentences per moment in the presenter's words: the annoyance today, then the afterward on screen.
4. **Skip anything not tied to a CBI.** If a feature does not answer a CBI it is not in the demo, even if the site has it.
5. **Recap** (`story.recap`): go back through the CBIs and say, for each one, what we showed that solves it.
Three to six moments is normal. More than seven means the CBIs were not prioritised.

## 5. Two approvals
1. **Story gate (T2b)**: situation, Chain of Pain, AAA, message map, moments with show → reveal, talk track and click path, recap. Approved on its own (`storyApproved: true`) before anything is measured, planned or themed. A story change after this re-opens this gate.
2. **Build gate (T4)**: pages, components, theme and the Sitecore choices, built from the approved story (`userApproved: true`).

## 6. Where it lives
- Brief: `industry-verticals/<customer>/docs/ai/demos/<customer>/demo-brief.md` (tables; written from the transcript, corrected by the SE).
- Plan: `industry-verticals/<customer>/docs/ai/demos/<customer>/demo-plan.yaml` → `story:` (situation, audiences, chainOfPain, messageMap, moments, recap) and `site:` (pages). Template: `harness/templates/demo-plan.template.yaml`.
- Approval screen: `story-plan.md` (from `node harness/scripts/validate-story.mjs <client>`) and `site-plan.md` (from `validate-site-plan.mjs`).
- Presenter crib sheet: `demo-script.md` (generated after build: moment → page → what to click → talk track → check-in).
