# SitecoreAI APIs

Index: https://api-docs.sitecore.com/?product=SitecoreAI (check it for new or changed APIs; this list was taken from it on 2026-10-09).

| API | Docs | Used by the harness for |
|---|---|---|
| Sites API | https://api-docs.sitecore.com/sai/sites-api | **Yes.** Create collection/site, list site templates (`GET /api/v1/sites/templates`), upload site thumbnail (`POST /api/v1/sites/{siteId}/upload-thumbnail`, multipart field `File`). Wrapped by `harness/scripts/sites-api.mjs`. |
| Agent API | https://api-docs.sitecore.com/sai/agent-api | Behind the Marketer MCP tools (pages, components, content). Limits: `.cursor/skills/sitecore-reference/references/agent-api-limitations.md` |
| Pages API | https://api-docs.sitecore.com/sai/pages-api | Not called directly yet |
| Content Items API | https://api-docs.sitecore.com/sai/content-items-api | Not called directly yet |
| Content Types API | https://api-docs.sitecore.com/sai/content-types-api | Not called directly yet |
| Components API | https://api-docs.sitecore.com/sai/components-api | Not called directly yet |
| Publishing API | https://api-docs.sitecore.com/sai/publishing-api | Not called directly yet |
| Content Transfer API | https://api-docs.sitecore.com/sai/content-transfer-api | Not used |
| Item Transfer API | https://api-docs.sitecore.com/sai/item-transfer-api | Not used |

## How to use this file
- Before adding a Sitecore call to a script or skill, open the matching docs page and use the documented path, parameters and response; do not guess endpoints.
- If a call fails with 400/404 or a response shape changed, re-read the docs page first, then fix the script and this table.
- When a task needs something the Marketer MCP cannot do (see the Agent API limitations), look here for an API that can, before putting it on the manual-task list.
- Auth for the Sites API is the automation client in `harness/.env.local`; never print credentials.
