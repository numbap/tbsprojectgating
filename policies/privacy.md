# Privacy policy

| Item | Detail |
|---|---|
| Application | Project Gating Navigator, version 1.0.0 and later |
| Effective date | 2026-10-15 |
| Source code | [github.com/numbap/tbsprojectgating](https://github.com/numbap/tbsprojectgating), MIT licence |

## Summary

- The Project Gating Navigator is an **open source** application that runs **entirely in your web browser** (client side).
- **It does not send anything you enter to any server**: not to the project, not to GitHub, and not to any third party. There are no accounts, analytics, advertising, tracking pixels, third-party scripts or web fonts.
- **What you save stays in your browser's local storage on your device**, encrypted unless you choose otherwise for Unclassified work. **The application does not set or read cookies.**
- You can erase everything the application has stored at any time.

## How we make sure nothing is transmitted

- The application is made of static files (HTML, CSS and JavaScript). After your browser downloads them, all processing (scoping, complexity estimate, document analysis, scoring, report generation and encryption) happens on your device.
- Every page declares a **Content Security Policy** with `connect-src 'none'` and `form-action 'none'`. This instructs your browser to block the page from opening any network connection or submitting any form, even if the code were changed to try. The pages also set `referrer` to `no-referrer`, so following a link does not reveal which page you came from.
- The project's automated tests fail the build if the application code contains any network or cookie API (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `document.cookie`, and similar), or if the Content Security Policy is weakened.

## What is stored on your device

Everything is stored with the browser's `localStorage` for the address the application is served from. Nothing is stored in cookies, `sessionStorage` or IndexedDB.

| Storage key | Contents | When it is written |
|---|---|---|
| `gating-navigator-settings` | Your choices: security marking, storage mode, auto-lock time. No assessment content. | When you complete setup or change settings |
| `gating-navigator-vault` | Your assessment, **encrypted** (AES-256-GCM) with a key derived from your passphrase. Unreadable without the passphrase. | Encrypted mode (default) |
| `gating-navigator-state` | Your assessment, **unencrypted**. | Only if you choose unencrypted storage, which is allowed only for Unclassified assessments |
| `gating-theme` | Light or dark theme preference | When you use the theme button |
| `gating-lang` | Interface language (English or French) | When you use the language button |

If you choose **Not saved**, the application writes only your settings; the assessment exists only in the open tab.

The assessment can include project details (costs, funding, procurement approach, risks), your questionnaire answers, notes, action plans and any document text you paste for review. Your passphrase is never stored. The encryption key is held only in memory while the assessment is unlocked.

## Files you download

Reports (Markdown, CSV, printouts) and exported assessment files are created on your device and saved wherever your browser saves downloads. You control those files. Encrypted exports can only be opened with the passphrase you choose for them.

## The hosting provider

When the application is used from GitHub Pages, your browser downloads the application's files from GitHub. Like any web server, GitHub receives standard request information (your IP address, browser user agent, the files requested and the time) and may record it under the [GitHub General Privacy Statement](https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement). GitHub does **not** receive anything you type, paste, upload or save in the application.

Organizations that want no external requests at all can host their own copy of the application (see the README); the application then makes no requests outside that host.

## Links to other sites

The footer links to the project's issue tracker on GitHub for reporting accessibility problems. Following it takes you to GitHub, whose own privacy statement applies. Issue reports may be public: **do not include assessment content or any Protected or sensitive information in a report.**

## Deleting your data

- In the application: **Data and security → Erase all data from this browser** removes every key listed above.
- In your browser: clearing site data for the application's address also removes it.
- Downloaded files must be deleted separately.

For Protected information, also follow your department's procedures for disposing of information and sanitizing devices.

## Personal information

The application does not collect personal information. Anything personal you type into an assessment (for example the names of owners) stays on your device under your control. If a department deploys or modifies the application, the department is responsible for assessing its own privacy obligations, for example under the *Privacy Act*.

## Changes to this policy

Changes are made in the public source repository, so the history of this policy can be reviewed there. The effective date above is updated when the policy changes.

## Contact

Questions about this policy can be raised through the project's [issue tracker](https://github.com/numbap/tbsprojectgating/issues). Do not include sensitive information.
