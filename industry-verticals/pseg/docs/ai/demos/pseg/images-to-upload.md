# PSEG — Images to upload

Content Hub (`https://jzi-verticals.sitecoresandbox.cloud`) returned **HTTP 503** during authenticate. Datasource Image fields use live `nj.pseg.com` URLs where accepted; variants also fall back to files in `public/pseg/`.

When Content Hub is back:

1. Upload each file from `docs/ai/demos/pseg/images/`
2. Approve the asset
3. Create a public link
4. Set the Image field on the datasource below

| File | Section | Datasource | Field |
|------|---------|------------|-------|
| `logo.png` | Header / Footer | Header LogoImage / Footer Image1 | LogoImage / Image1 |
| `hero-jdp.jpg` | Carousel slide 1 | PSEG - JD Power | Image |
| `hero-bill.jpg` | Carousel slide 2 | PSEG - Bill Help | Image |
| `hero-gas.jpg` | Carousel slide 3 | PSEG - Gas Safety | Image |
| `myalerts.jpg` | Account cards | PSEG - Account Cards | Image1 |
| `mymeter.jpg` | Account cards | PSEG - Account Cards | Image2 |
| `business.jpg` | Business promo | PSEG - Business Needs | Image |
| `worryfree-repair.jpg` | WorryFree | PSEG - WorryFree Services | Image1 |
| `worryfree-protect.jpg` | WorryFree | PSEG - WorryFree Services | Image2 |
| `worryfree-replace.jpg` | WorryFree | PSEG - WorryFree Services | Image3 |
| `appointment.jpg` | Appointment | PSEG - Make an Appointment | Image |
| `community.jpg` | Community | PSEG - Powering the Future | Image |
| `storm.jpg` | Storm | PSEG - Storm Preparation | Image |

Local copies also live in `public/pseg/` so the rendering host can show photography before DAM links are set.
