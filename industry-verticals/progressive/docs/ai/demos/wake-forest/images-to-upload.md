# Images to upload manually

Content Hub upload skipped — credentials expired (HTTP 401: password expired).

**Host:** `https://jzi-verticals.sitecoresandbox.cloud/`

After fixing credentials, run:
```bash
node docs/ai/scripts/upload-to-content-hub.mjs --images-dir docs/ai/demos/wake-forest/images
```

## Priority images

| Local file | Datasource | Field | Source URL |
|------------|------------|-------|------------|
| `section1-img1.jpg` | Wake Forest - Hero | Image | Hero campus aerial |
| `section3-img2.webp` | Wake Forest - Wake Up | Image2 | Wake Up lab photo |
| `section4-img6.webp` | Wake Forest - Motto | Image1 | Stone seal |
| `section4-img3.webp` | (News - not yet created) | — | Peter Rodriguez portrait |
| `section8-img*.jpg` | (Why WFU - not yet created) | — | Campus autumn photo |
| `section10-img*.webp` | (Athletics - not yet created) | — | Deactown banner |

## Failed downloads (Instagram CDN — skip or source manually)

10 Instagram CDN images returned HTTP 403. Use WFU-hosted images from `prod.wp.cdn.aws.wfu.edu` instead.
