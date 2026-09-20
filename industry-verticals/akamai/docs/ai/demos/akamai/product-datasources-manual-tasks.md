# Product datasources — Manual Tasks

Product-specific datasources were created under `/sitecore/content/technology/akamai/Data/...` for all 15 cloud product pages. Content map: `product-datasources-map.yaml`.

## What MCP could / could not do

| Done via MCP | Manual in Pages |
|--------------|-----------------|
| Create ~18 datasources per product (+ FAQ Q&A children) | Assign those datasources on each page’s components |
| Set page `Title` / `NavigationTitle` | Confirm Akamai variants still selected |
| Partial wires on some components (Shared layout only) | Re-assign any component still showing API Security copy |

**Why wiring fails for many components:** `set_component_datasource` updates **Shared** layout (“base rendering”). These cloned product pages keep **Final** layout overrides still pointing at shared API Security datasources, so Final wins. Assigning a datasource in **Pages** writes Final and sticks per page.

**Questions:** MCP also fails to set the Questions component (missing branch template). FAQ items exist under `Data/Questions/{Product} FAQ` — assign in Pages.

## How to wire (per product page)

1. Open the product page in **Pages**.
2. For each component below, open datasource picker and select the item named `{Product Name} …` under `Data/...`.
3. Save / publish as needed.

Naming pattern (examples for Accelerated Compute):

| Component | Look for under Data |
|-----------|---------------------|
| Hero | `Hero/Accelerated Compute Hero` |
| Promo CTA (1st) | `Promo CTA/… Promo Comprehensive` |
| Heading CTA (section) | `Heading CTA/… Section Title` |
| Three Column (value props) | `Three Column CTA/… Value Props` |
| Promo CTA (2nd) | `Promo CTA/… Promo Discovery` |
| Four Column (icon bar) | `Four Column CTA/… Icon Bar` |
| Two Column (split) | `Two Column CTA/… Split Promo` |
| CTA Banner (1st) | `CTA Banner/… Banner Plans` |
| Three Column (features) | `Three Column CTA/… Features` |
| CTA Banner (2nd) | `CTA Banner/… Banner Start` |
| Heading (trusted) | `Heading CTA/… Trusted` |
| Three Column (stories) | `Three Column CTA/… Stories` |
| Heading (FAQ) | `Heading CTA/… FAQ Title` |
| Questions | `Questions/… FAQ` |
| CTA Banner (3rd) | `CTA Banner/… Banner Learn` |
| Heading (resources) | `Heading CTA/… Resources Title` |
| Three Column (resources) | `Three Column CTA/… Resources` |
| Contact Form | `Contact Form/… Contact` |

## Products (all have datasources ready)

| Page | Item ID |
|------|---------|
| Accelerated Compute | `{CB27BCB0-96F7-4050-82CC-6A0CD7763604}` |
| Akamai Functions | `{33954C2D-4895-49BF-9564-2C2FE89D293A}` |
| Inference Cloud Platform | `{C02B2BF5-7555-42C6-AC82-C1C9B0072FB8}` |
| App Platform | `{CB70995C-0BDB-44D5-AAC1-1623A452C86A}` |
| Backups | `{50563CDA-CBDB-4C84-A65F-DA1EDFBA9B64}` |
| Block Storage | `{1F08449A-D194-4C0A-B751-A18507571F79}` |
| Cloud Firewall | `{8161E45E-FA0B-41A4-9DE0-A8CD41AC94E5}` |
| CPU | `{EE05956B-B1E1-4F92-A1F5-1F14ACD7C1E2}` |
| DNS Manager | `{52A474CD-07C3-4373-9BD0-9DA8EB74F9EB}` |
| GPU | `{D4EC6A47-0E18-4713-9E39-B4A1DB5F2F45}` |
| Kubernetes | `{3DF64FFE-7600-4DD8-8B91-CA5BA15BDE83}` |
| Databases | `{EB95FC5D-A0F7-4149-B076-2A4D334AEBE8}` |
| NodeBalancers | `{F9A032BE-8FC2-4BEA-911D-24C762382561}` |
| Object Storage | `{E40F58DE-8BDD-4392-BD82-DFABF54EC644}` |
| Private Networking | `{89650F9E-1AB4-4F97-B894-235CCC51CFA7}` |

ID manifests (where generated):

- `docs/ai/demos/akamai/scripts/product-ds-created-five-products.json` (Backups → DNS Manager)
- Agent summaries also list Functions / Inference / App Platform and GPU → Private Networking IDs

## Spot-check

After wiring one page (e.g. Accelerated Compute), confirm Hero no longer says “API Security…” and Contact title matches the product.
