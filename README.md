# Graphics by Ari Image Slots

This project uses a simple image slot system. Every image on the site has a `data-image-key` and a matching entry in `assets/data/site-images.json`.

You can update images through the admin uploader (`/admin.html`) or by editing `assets/data/site-images.json` directly.

## How the slot system works
- Each image in the HTML has a `data-image-key`.
- The key maps to a URL or local file path in `assets/data/site-images.json`.
- The admin uploader updates the JSON automatically.

## Slot List and Location
- `homeHero`: Homepage hero background image. (`index.html` hero section)
- `aboutHero`: About page hero background image. (`about.html` hero section)
- `servicesHero`: Services page hero background image. (`services.html` hero section)
- `contactHero`: Contact page hero background image. (`contact.html` hero section)
- `aboutPreview`: Homepage About preview image. (`index.html` About preview image) and About page inline image. (`about.html`)
- `caseStudy1`: Homepage featured work card 1 image. (`index.html`)
- `caseStudy2`: Homepage featured work card 2 image. (`index.html`)
- `caseStudy3`: Homepage featured work card 3 image. (`index.html`)
- `serviceBranding`: Services page branding image card. (`services.html`)
- `serviceContent`: Services page content image card. (`services.html`)
- `serviceSocial`: Services page social image card. (`services.html`)
- `productionDays`: (Reserved) Content Production Days image slot. Not currently placed in HTML, but available for future use.

## Admin Uploader
1. Start server:
   ```powershell
   cd "c:\Users\Arianna\Desktop\GBA New Site 2026"
   npm run start:win
   ```
2. Open admin page:
   - `http://localhost:3000/admin.html`
3. Select a slot, upload an image, and submit.

## Files
- Slot map: `assets/data/site-images.json`
- Slot registry (labels): `assets/data/image-slots.json`
- Admin page: `admin.html`
- Backend: `src/server.js`

## Notes
- Uploads are saved to: `assets/uploads/`
- The admin uploader currently does not require a key.
