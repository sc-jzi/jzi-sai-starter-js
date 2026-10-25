# Demo harness: build a prospect demo from Cursor

Type `/new-demo <prospect, their website, what you know>` in Cursor. It drafts the story and asks you to **approve the story** (Chain of Pain, moments, click paths), then plans pages and theme and asks for **one more approval**, then builds a skinned copy of the prospect's site in Sitecore (new site, pages, components, theme, personalization) plus a local app, and hands it over with a demo script.

## First time only (about 20 minutes)

1. **Install:** Cursor, Node 20 or newer, git, the .NET SDK and the Sitecore CLI (for the editing host), and a Vercel account (for deploying).
2. **Clone this repo** and open the folder in Cursor.
3. **Cursor settings:** turn on Settings → Hooks (this restarts a run that stops early), then restart Cursor. Run `node harness/scripts/deps-check.mjs --fix` once: it also turns on the commit check that refuses a commit when an app no longer builds. Connect the **Sitecore Marketer MCP** and check it shows as connected.
4. **Your settings file:** copy `harness/env.example` to `harness/.env.local` and fill it in. Never commit it, never paste its values into chat.
   - Sitecore automation client id and secret, environment id, Edge context id, editing secret.
   - Content Hub values if you want images uploaded (`CH_ENABLED=true`), otherwise leave it `false`.
5. **Check it:**
   ```
   node harness/scripts/env-check.mjs
   node harness/scripts/deps-check.mjs --fix
   node harness/scripts/sites-api.mjs auth-check
   ```
   All three must pass before your first demo.

## Every demo (1st, 2nd, 3rd ...)

1. **Optional:** drop whatever you have into `harness/inbox/` (call transcript, RFP, brand guide). Nothing there is fine too.
2. **In Cursor chat:** `/new-demo Acme Corp (https://acme.com), they struggle with ...`. Cursor finds the prospect's real site and asks you to confirm the URL if you didn't give one.
   If the Sitecore Marketer MCP is not connected, Cursor asks you to sign in. If that times out, the run stops. Connect it, then type `/resume-demo <customer>`.
3. **Approve the story first.** Check the pains, the order of the moments (the result first, then how it is built) and each moment's click path. Every page on a click path is built in full. Say what to change, then approve.
4. **Then approve the build plan**: the page tree, the component for each section (built from that section's screenshot), the theme, and what is new or hand-built.
5. **Leave it running.** After the second approval it runs without asking questions and restarts itself if it stops. It is finished when the run gate passes.
6. **Hand-over, a few minutes of your own work** (the list is in `industry-verticals/<customer>/docs/ai/demos/<customer>/manual-tasks.md`):
   - Add the site thumbnail, partial thumbnails, and layout icons (icons only if a new component was created).
   - Editing host: `dotnet sitecore cloud login`, then `node harness/scripts/editing-host.mjs --customer <customer> --apply`.
   - Publish the site in Sitecore. Personalization from the front end only works after publish. Preview personas in Pages before that.
   - Deploy: ask Cursor "deploy my `<customer>` site to Vercel".
7. **Rehearse** with `demo-script.md` in the same folder.

## From the second demo on

- No setup again. Just `git pull` first (the skills and scripts keep improving), then start at "Every demo".
- If the Sitecore CLI login has expired, run `dotnet sitecore cloud login` again.
- Two sites for one prospect: run `/new-demo` twice, one after the other, with different customer names (for example `acme` and `acme-pvp`).
- Something failed or looks wrong? Tell Cursor what you see. Fix the cause in the skills or scripts, not in Sitecore by hand, so the next demo is better. Commit and push the improvement so your peers get it.

## Good to know

- Each demo only touches its own folder in `industry-verticals/<customer>/` and its own new Sitecore site. The base app (`prospera`) and existing sites are never changed.
- Credentials, transcripts, and demo documents are git-ignored. Do not commit them.
- Personalization is built only as Sitecore rules, never as code in the app.
