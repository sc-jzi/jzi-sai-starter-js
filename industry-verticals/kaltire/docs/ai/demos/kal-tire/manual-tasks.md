# Kal Tire — Manual Tasks

> **Page:** `/sitecore/content/retail/kal-tire/Home` — `{74931444-58E3-4FFF-B9EE-654C83D8BD5F}`
> **Updated:** August 20, 2026

Everything in Sitecore's content tree (templates, renderings, variants, datasource items) and in the front-end code is done. The Agent API cannot write layout on this page, so the whole of Phase 6 is manual. Work through the tasks in order.

Everything below happens in **Pages**, editing the Home page. The `headless-main` placeholder is the main content area.

---

## 1. Remove the starter components (do this first)

Home still carries the PLAY! Financial layout. Clearing it first makes the ordering in task 2 much easier. For each one: select it on the canvas, open the three-dot menu, choose **Remove**.

| Component | Placeholder |
|---|---|
| Carousel | `headless-main` |
| Promo CTA (×2) | `headless-main` |
| Five Column CTA | `headless-main` |
| Two Column CTA | `headless-main` |
| Documents List | `headless-main` |
| App Promo | `headless-main` |
| Four Column CTA | `/headless-main/row-1-7` |
| Comparison (×2) | `/headless-main/two-col-placeholder-left-0-27` and `…-right-0-27` |

Keep **Three Column CTA** (`d54d53b4-…`) and **Article List** (`854de8ce-…`) — task 2 reuses both rather than adding new instances.

---

## 2. Assemble the page

Target order in `headless-main`, top to bottom. Header and Footer come from the partial design (task 4) and are not in this list.

| # | Component | Action | Rendering ID | Datasource to select |
|---|---|---|---|---|
| 1 | Tire Finder Hero | add | `{C4748A66-22D2-4EA3-8353-BB55BE190944}` | Kal Tire - Tire Finder Hero `{3D03F235-7035-4E6C-92DC-06323C33C29B}` |
| 2 | Promotional Mosaic | add | `{63423595-A911-42BD-ACB6-C5CEFA4D1364}` | Kal Tire - Promotional Mosaic `{260999CC-DC4B-4727-997E-362C07CD2788}` |
| 3 | Three Column CTA | reuse — change datasource | already on page | Kal Tire - Customer Promises `{6A38A030-4284-47B4-88CD-D31D45AC53A4}` |
| 4 | Article List | reuse — move into position | already on page | content-tree source, see task 3 |
| 5 | Heading CTA | reuse or add | `{89E1D547-7CD6-4EF0-9A27-1E99410797DD}` | Kal Tire - Advice Signup `{4B3707BD-F34A-4784-8238-004F4E7E30B2}` |

Datasource items live under `/sitecore/content/retail/kal-tire/Data/Kal Tire Demo`. All of them are fully populated with Kal Tire content and images — you only need to select them, not edit them.

Notes:

- The Promotional Mosaic renders its three children (Brake Inspection, Trailer Tires, CAA Savings) from the parent datasource. Select only the parent; do not wire the children individually.
- When adding a component, Pages creates a local datasource under `/Home/Data`. After you point the rendering at the shared item above, that local item is orphaned — clean it up in task 6.
- Article List has no Heading CTA sibling on the page today, so if you removed it in task 1, add it back with the rendering ID above.

---

## 3. Variant selection

Select the component on the canvas, open the **Design** tab in the right-hand pane, and pick the variant. This cannot be set through the API (see known blockers), so it has to happen here.

| # | Component | Current | Set to | Variant ID |
|---|---|---|---|---|
| 1 | Header | Default | KalTire | `{B675B8EB-C5E7-447F-9B58-F2580E778999}` |
| 2 | Three Column CTA | Default | KalTire | `{48461465-F9AF-4454-A001-D44678A7E97A}` |
| 3 | Article List | Default | KalTire | `{BC8641AF-71C9-4589-B925-3406FEE8CE5E}` |
| 4 | Heading CTA | Default | KalTire | `{260BA48B-D73B-409D-B16F-B682E1F1DAC4}` |
| 5 | Footer | Default | KalTire | `{D8D1E235-1822-46D3-B3C3-B4B4CB7919CA}` |

Tire Finder Hero and Promotional Mosaic have only one variant each (`Default`), so they need no action unless they render blank — in that case select `{CF166782-B716-4019-BC5F-D4DE4A6D9985}` and `{7E683B3A-304D-4F9F-B80F-0E2D9EB107FB}` respectively.

---

## 3. Context-only components

- [ ] **Header** — lives in the header partial design, not on the Home page. Open the partial design to set the `KalTire` variant and confirm the logo, utility links (Commercial, Mining, Contact Us, Sign in), primary nav (Tires, Wheels, Services, Locations, Promotions), and the "Book a Tire Change" CTA.
- [ ] **Footer** — lives in the footer partial design. Set the `KalTire` variant and assign the datasource **Kal Tire - Footer** (`{90DBFDC0-7306-4C71-BB55-ED9DA9FF07D5}`), which already has all four link columns, socials, copyright, and legal links populated.
- [ ] **Article List** — reads articles from the content tree rather than from a component datasource item. Point it at a source folder containing the six Summer Resources articles below, or at the starter's existing articles folder for the demo.

Summer Resources articles and their uploaded thumbnails:

| Article | Thumbnail asset |
|---|---|
| When do you change your brakes? | `96080` |
| Choosing the best trailer tires | `96092` |
| How can potholes damage your vehicle and tires? | `96102` |
| How do you measure tire tread depth? | `96117` |
| Buying wheels? What to know before upgrading your wheels | `96125` |
| All about tire pressure: what you need to know | `96141` |

Full titles, categories, links, and image URLs are in `content-map.yaml` under section 5.

---

## 4. Missing images

- [ ] **Three Column CTA icons** — `Image1`, `Image2`, and `Image3` on **Kal Tire - Customer Promises** still hold Financial starter photography inherited from standard values (a woman at an ATM, a handshake, a woman at a laptop). These are visibly wrong for Kal Tire. The live site draws these three assurance icons as inline SVG sprites, so the extractor could not download them — replace them with equivalent icons from the media library, or clear the fields, since the `KalTire` variant renders correctly without them.

All 20 other images uploaded to Content Hub (`jzi-verticals.sitecoresandbox.cloud`) and were approved, and their fields are already set.

---

## 5. Link verification

Every CTA currently points at kaltire.com. Repoint any that should stay inside the demo:

- [ ] Hero finder — `…/tires/tires-by-vehicle/`, `…/tires/tires-by-size/`, `…/wheel-and-tire-packages/`
- [ ] Mosaic panels — `…/brakes/`, `…/trailer-tires/`, `…/caa-rewards/`
- [ ] Customer promises — `…/customer-care-plan/`, `…/price-match/`, `…/financing/`
- [ ] Advice signup "Sign up" — `https://www.kaltire.com/`
- [ ] Article List CTA — `https://www.kaltire.com/resource-centre/`
- [ ] Footer columns, socials, and legal links

---

## 6. Cleanup

- [ ] Set the Home page `Title` field, which still reads "PLAY! Financial". Suggested: `Kal Tire | Tires, Wheels & Auto Service`. This cannot be set via API — the page-field write returns 500.
- [ ] Delete the unused starter datasource items under `/Home/Data` once their components are gone: `Hero`, `Hero 1`, `Questions 1`, `Promo CTA 1`, the three `Carousel - *` items, `Comparison Amount`, `Comparison Duration`, and `Documents List 1`.
- [ ] Delete any local datasource items Pages auto-created under `/Home/Data` while adding components in task 2, once each rendering points at its shared `/Data/Kal Tire Demo` item.
- [ ] Child pages under Home (personal, business, retirement-planning, and so on) are Financial starter content and are unrelated to this demo. Leave or delete as you prefer.

---

## 7. Personalization (optional)

To demo audience-specific content, duplicate a datasource item and personalize the component:

| Component | Folder | Template |
|---|---|---|
| Tire Finder Hero | `/Data/Kal Tire Demo` | KalTireFinderHero |
| Promotional Mosaic | `/Data/Kal Tire Demo` | KalTirePromoMosaic |
| Three Column CTA | `/Data/Kal Tire Demo` | ThreeColumnCta |

Naming: `Kal Tire - <Component> - <Segment>`, for example "Kal Tire - Tire Finder Hero - Fleet". Then in Pages: select the component, click **Personalize**, add a condition, and assign the segment datasource.

---

## Known blockers

| Issue | Impact | Notes |
|---|---|---|
| Agent API HTTP 500 on every write to an existing page | All of Phase 6 is manual | Reads work. Confirmed on Home and `/personal`. No CM exception logged — see below |
| Rendering parameters not settable via API | Variant selection is manual (task 3) | Pre-existing limitation, documented in `agent-api-limitations.md` §1 |
| `discoverDomainId` not configured | `npm run build` fails during prerender | Pre-existing environment gap; `npm run dev` and type-checking are unaffected |
| GraphQL `Invalid URI: The hostname could not be parsed` | Queries selecting item `url`/`path` throw, which affects Article List | Site definitions have an empty target hostname. Tenant-wide, not specific to kal-tire |
| `[OrcaBearerAuthentication] No configuration manager found for issuer 'https://auth.sitecorecloud.io'` | Log noise only | Appears alongside Agent API calls, including ones that succeed. Not the cause of the 500s |

### Site name resolution (fixed)

Layout reads were failing with `System.InvalidOperationException: Site from query string was not found: Kal Tire`. The Agent API builds `sc_site` from the site's **display name**, not the item name. Other sites survive this because Sitecore matches site names case-insensitively (`Quanex` → `quanex`), but `Kal Tire` cannot resolve to `kal-tire` across a space-versus-hyphen difference.

Fixed by setting `__Display name` to `kal-tire` on the site root item `/sitecore/content/retail/kal-tire` (`{51AE7E42-770D-48C3-88D2-8DD0CC16592E}`). Setting it on the Site Grouping item has no effect. If the display name is ever changed back to something containing a space, layout operations will break again.

### Page writes on existing pages (unresolved)

After the display-name fix, reads of Home work, but every **write** to an existing page returns a bare 500:

| Operation | Result |
|---|---|
| `get_components_on_page` | works |
| `get_allowed_comps_by_ph` | works |
| `update_fields_on_item` on a datasource item | works |
| `update_fields_on_item` on a page item | 500 |
| `set_component_datasource` | 500 |
| `add_component_on_page` | 500 |

Confirmed on both Home and `/personal`, so it is not specific to one page's layout. CM logs record no exception for these attempts — only the Orca issuer warning, which also appears during successful calls.

A page created fresh via `create_page` accepted all three write operations normally, which narrows the problem to pre-existing pages rather than the site or the renderings.

Note that `add_component_on_page` creates its local datasource item *before* the 500, leaving an orphan under `/Home/Data`. A retry then fails with `a content item with the same name is already defined on this level`. Delete the orphan first.

## Security

`docs/ai/config/credentials.local.yaml` holds Content Hub credentials and is currently untracked. Keep it out of commits.
