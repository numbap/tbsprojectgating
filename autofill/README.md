# Form Autofill

Paste a link to a web form, and a browser window opens the page and fills in your saved details (name, email, phone, address, work, links and any custom answers). You check the answers and submit the form yourself; the app never submits anything.

## Run it

Needs Node.js 18 or later. Run it on your own computer so the browser window appears on your screen.

```sh
cd autofill
npm install
npx playwright install chromium   # first time only
npm start
```

Open http://localhost:3000, fill in **Your details**, save, then paste a form's address and click **Fill form**.

## Two ways to fill

- **Fill form** (in the app): opens the page in a Chromium window controlled by the app and fills it, including forms inside embedded frames from other sites. The window keeps its own logins, so for a form behind a sign-in, sign in once in that window, then use **Fill the open page again**. That button also handles the next step of a multi-page form.
- **Bookmarklet**: drag **Autofill me** to your bookmarks bar, open any form in your normal browser and click it. It carries a copy of your details, so re-drag it after changing them.

## How fields are matched

Each field's `autocomplete` attribute, name, id, label, placeholder and ARIA label are compared with patterns for each detail (English and French). Drop-downs and radio buttons pick the option whose text or value matches (for example "Ontario" or "ON"). Custom answers match when their question text appears in the field's label.

Fields that already have a value are left alone unless you tick **Replace answers already on the page**. Password, payment card, CAPTCHA, one-time-code and social insurance number fields are never filled. Filled fields get a green outline, and the app lists what it filled with a screenshot.

## Privacy

The server listens on 127.0.0.1 only and refuses requests addressed to any other host name. Your details are saved in `data/profile.json` and the browser profile in `data/browser-profile/`; both are git-ignored.

## Options

| Variable | Effect |
| --- | --- |
| `PORT` | Port for the app (default 3000) |
| `HEADLESS=1` | Fill without showing a window (you get the screenshot only) |
| `CHROMIUM_PATH` | Use a specific Chromium or Chrome executable |
| `AUTOFILL_DATA_DIR` | Where to keep the profile and browser data |

## Tests

```sh
npm test
```
