# Removes the OLD skill locations after the move to .cursor/skills. Review first: run with -WhatIf.
# Usage (repo root):  pwsh harness/scripts/cleanup-legacy-skills.ps1 -WhatIf   then without -WhatIf
[CmdletBinding(SupportsShouldProcess)]
param()
$paths = @(
  "industry-verticals/prospera/docs/ai/skills",
  "industry-verticals/prospera/docs/ai/agents",
  "industry-verticals/prospera/docs/ai/reference",
  "industry-verticals/prospera/docs/ai/rules",
  "industry-verticals/prospera/docs/ai/examples",
  "industry-verticals/prospera/.agents",
  "industry-verticals/prospera/Skills.md",
  "industry-verticals/prospera/docs/ai/scripts/site-scraper.mjs",
  "industry-verticals/prospera/docs/ai/scripts/content-extractor.mjs",
  "industry-verticals/prospera/docs/ai/scripts/download-images.mjs",
  "industry-verticals/prospera/docs/ai/scripts/setup.cmd",
  "industry-verticals/prospera/docs/ai/scripts/setup.ps1",
  "industry-verticals/prospera/docs/ai/scripts/setup.sh",
  "harness/skills",
  ".cursor/skills/skinned-demo-setup",
  ".cursor/skills/sitecore-reference/references/react-uiim-guidelines.md",
  ".cursor/skills/sitecore-reference/references/rule-03-react-uiim-shadcn.md",
  ".cursor/skills/sitecore-reference/references/brand-variables.md"
)
foreach ($p in $paths) {
  if (Test-Path $p) {
    if ($PSCmdlet.ShouldProcess($p, "git rm -r")) { git rm -r -q --ignore-unmatch -- $p; if (Test-Path $p) { Remove-Item -Recurse -Force $p } }
  }
}
git status --short
