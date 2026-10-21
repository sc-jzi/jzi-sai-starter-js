$dir = "industry-verticals\340bpvp\docs\ai\demos\340bpvp\images"
$items = @(
  @("pvp-distribution-icon.png", "pvp-distribution-icon", "Hand truck icon"),
  @("pvp-distribution-landing.jpg", "pvp-distribution-landing", "Distribution center worker checking inventory on a tablet"),
  @("pvp-distribution-map.png", "pvp-distribution-map", "Map of the United States with distribution professionals"),
  @("pvp-about-pill-icon.png", "pvp-about-pill-icon", "Medication capsule icon"),
  @("pvp-about-340b.jpg", "pvp-about-340b", "Intravenous drip bag in a hospital"),
  @("pvp-about-pvp.jpg", "pvp-about-pvp", "Colleagues meeting around a conference table"),
  @("pvp-callout-library.jpg", "pvp-callout-library", "Pharmacist working at a computer in a lab"),
  @("pvp-answers-hero.png", "pvp-answers-hero", "Apexus Answers specialist wearing a headset, with 2024 Stevie Award badges"),
  @("pvp-callout-faq.jpg", "pvp-callout-faq", "Clinician in a white coat working at a laptop"),
  @("pvp-callout-roadmap.jpg", "pvp-callout-roadmap", "Person taking notes beside a laptop"),
  @("pvp-university-hero.png", "pvp-university-hero", "340B University seal over a classroom scene"),
  @("pvp-university-enroll-icon.png", "pvp-university-enroll-icon", "Play icon"),
  @("pvp-university-roadmap-icon.png", "pvp-university-roadmap-icon", "Map icon"),
  @("pvp-university-tools-icon.png", "pvp-university-tools-icon", "Tools icon"),
  @("pvp-university-tools-banner.jpg", "pvp-university-tools-banner", "Woman using a tablet surrounded by digital learning icons"),
  @("pvp-university-roadmap-banner-icon.png", "pvp-university-roadmap-banner-icon", "Map with location pin icon"),
  @("pvp-university-online-module.png", "pvp-university-online-module", "Online module"),
  @("pvp-university-inperson.png", "pvp-university-inperson", "In-person session")
)
foreach ($i in $items) {
  $out = node harness/scripts/content-hub-upload.mjs 340bpvp --file "$dir\$($i[0])" --name $i[1] --alt $i[2] 2>&1 | Out-String
  $line = ($out -split "`n" | Where-Object { $_ -like "RESULT*" }) -join ""
  if (-not $line) { "FAIL $($i[1]): $($out.Trim() | Select-Object -Last 1)" } else { "$($i[1]) $line" }
}
