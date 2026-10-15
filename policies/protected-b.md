# Handling Protected B information

| Item | Detail |
|---|---|
| Application | Project Gating Navigator, version 1.0.0 and later |
| Last reviewed | 2026-10-15 |
| Status | Design statement and self-assessment. **Not an authorization to use the application with Protected B information.** |

This page explains how the application is designed to protect Protected B information, how that maps to Government of Canada security requirements, and what must be true of your environment for those protections to hold. The caveats in section 5 are part of the statement, not footnotes.

> **Protected B** applies to information whose compromise could reasonably be expected to cause serious injury to an individual, organization or government. A project gate assessment often contains information of that kind: unannounced funding requests and Cabinet or Treasury Board submissions, cost estimates and contingency, procurement strategy before a solicitation is issued, and frank statements about risks and weaknesses. The application therefore uses **Protected B** as the default marking. Choose a lower marking only when the content clearly warrants it.

## 1. Requirements framework

The design responds to:

- the **Policy on Government Security** and the **Directive on Security Management** (Treasury Board), which require departments to protect information according to its security category and to manage risks to information systems
- **ITSG-33**, *IT Security Risk Management: A Lifecycle Approach* (Canadian Centre for Cyber Security), whose controls are used in section 4 to describe the application's own safeguards
- the **Policy on the Planning and Management of Investments** and the **Directive on the Management of Projects and Programmes**, the subject of the assessments this tool produces (Cabinet confidences in draft submissions are subject to their own handling rules; do not paste Cabinet confidences into the tool)
- **ITSP.40.111**, *Cryptographic Algorithms for UNCLASSIFIED, PROTECTED A, and PROTECTED B Information* (CCCS)
- **ITSP.40.006**, *IT Media Sanitization* (CCCS), for disposal.

Departmental security policies and standards take precedence. Your Departmental Security Officer (DSO) and IT security team decide whether, and under what conditions, the application may be used with Protected B information.

## 2. Summary

| Requirement | How the application meets it | Depends on (see section 5) |
|---|---|---|
| Information stays under departmental control | Runs entirely in the browser. No server-side component; no network connections (blocked by Content Security Policy) | Trusted, unmodified copy of the code (5.2) |
| Protection at rest | AES-256-GCM encryption in browser storage by default. Unencrypted storage is refused for Protected A and B | Managed device with full-disk encryption (5.1); browser crypto not CMVP-validated (5.3) |
| Protection in transit | Nothing is transmitted. Encrypted export files for moving work between devices | Approved channels for files you send (5.6) |
| Access control | Passphrase to unlock; auto-lock after 15 minutes of inactivity (adjustable); manual lock | Passphrase strength; device screen lock (5.1, 5.4) |
| Marking | Marking banner on every screen; marking on reports, every printed page, exported file names and contents | Users choose the correct marking (5.8) |
| Disposal | One-step erase of all stored data; encrypted data becomes unrecoverable when the key is gone | Device sanitization at end of life (5.5) |
| Accountability | Not provided: no audit log of access (5.7) | Departmental records management |

## 3. Safeguards in detail

### 3.1 No transmission of information

- The application is static HTML, CSS and JavaScript. All processing (including the review of pasted project documents) happens in the browser tab.
- Each page declares a **Content Security Policy**: `default-src 'none'; connect-src 'none'; form-action 'none'; script-src 'self'; style-src 'self'; base-uri 'none'; object-src 'none'`. The browser therefore blocks network connections, form submissions, inline and remote scripts, and remote content, even if an attacker managed to inject markup. `referrer` is set to `no-referrer`.
- There are no third-party libraries at run time, no analytics, no fonts or images from other sites, and no cookies.
- Automated tests fail the build if the client code uses any network or cookie API, or if the Content Security Policy is weakened. A browser test confirms that `fetch` is blocked.

### 3.2 Encryption at rest

- **Cipher:** AES-256 in GCM mode (authenticated encryption), with a new random 96-bit IV for every save.
- **Key derivation:** PBKDF2-HMAC-SHA-256, 600,000 iterations, random 128-bit salt. Envelopes with fewer than 100,000 iterations are refused.
- AES and SHA-256 are among the algorithms ITSP.40.111 approves for Protected B. PBKDF2 is the password-based key derivation function in NIST SP 800-132.
- Keys are created as **non-extractable** Web Crypto keys and exist only in memory while unlocked. The passphrase is never stored.
- The security marking and key-derivation parameters are bound to the ciphertext as authenticated data, so they cannot be altered without detection.
- **Policy enforcement in code:** the storage layer refuses to write a Protected A or Protected B assessment to browser storage unencrypted. Unit tests verify this.
- Choosing **Not saved** keeps the assessment only in the tab's memory.

### 3.3 Access to the stored assessment

- Unlocking requires the passphrase (at least 15 characters). Password managers and pasting are supported, as WCAG 2.2 criterion 3.3.8 requires.
- **Auto-lock** after 15 minutes of inactivity by default, adjustable from 15 minutes to 8 hours or off. **Lock** is always available in the header. Locking clears the decrypted assessment from the page.
- The application refuses to run inside a frame, which prevents other pages from embedding it and reading decrypted content.

### 3.4 Marking

- A banner at the top of every screen shows the marking (for example **PROTECTED B**), the storage mode and “Data stays on this device”.
- Reports show the marking at the top and bottom. Printouts repeat it at the top right and bottom of **every page**.
- Downloaded file names include the marking (for example `…-PROTECTED-B.md`). Markdown and CSV files start with the marking, and encrypted files carry it in their authenticated header.

### 3.5 Exporting and moving information

- **Encrypted export** uses a separate passphrase you choose, so the file can be moved without revealing your browser passphrase. Send the passphrase by a different channel from the file.
- Reports in Markdown or CSV and unencrypted JSON exports cannot be encrypted by the application. When the marking is Protected, the application asks you to confirm before downloading and reminds you to store the file only on approved systems.

### 3.6 Disposal

- **Data and security → Erase all data from this browser** removes every item the application stores.
- Because stored assessments are encrypted, removing the encrypted data and forgetting the key leaves any remnants on disk unreadable (cryptographic erasure).

## 4. Mapping to ITSG-33 controls (the application's own safeguards)

| Control | Implementation in the application | Status |
|---|---|---|
| AC-4 Information flow enforcement | CSP blocks all outbound connections and form submissions | Implemented |
| AC-11 Session lock | Auto-lock (adjustable) and manual lock; decrypted content removed from the page | Implemented |
| AC-12 Session termination | Lock discards the in-memory key; reload requires the passphrase | Implemented |
| AU-2 / AU-12 Audit events | No audit logging of access to the assessment | **Not implemented** (5.7) |
| CM-7 Least functionality | No server, network, cookies, third-party code or inline script | Implemented |
| IA-5 Authenticator management | Minimum passphrase length; passphrase never stored; separate export passphrases | Partial: no recovery, no complexity checking beyond length (5.4) |
| IA-7 / SC-13 Cryptographic protection | ITSP.40.111-approved algorithms through Web Crypto | Partial: module validation depends on the browser and platform (5.3) |
| MP-6 Media sanitization | Erase function and cryptographic erasure | Partial: device sanitization is departmental (5.5) |
| SC-8 Transmission confidentiality | No transmission; encrypted export files | Implemented; channels for files are departmental (5.6) |
| SC-12 Key management | Random salts and IVs; non-extractable keys; key held only in memory | Implemented |
| SC-18 Mobile code | Only same-origin scripts can run (CSP `script-src 'self'`) | Implemented |
| SC-28 Protection at rest | AES-256-GCM; unencrypted storage refused for Protected information | Implemented, as defence in depth (5.1) |
| SI-10 Input validation | All user content is escaped before display; imported files are validated | Implemented |
| SI-12 Information retention | Data stays until you erase it; nothing is retained elsewhere | Implemented; retention schedule is departmental |

## 5. Caveats and dependencies

These conditions are **required** for the safeguards above to be meaningful. Several depend on how and where the application is deployed, or on permissions the application cannot control.

### 5.1 The device

Use the application only on a **Government of Canada-managed device that is authorized for Protected B**, with full-disk encryption, current patches, endpoint protection and an enforced screen lock. Do not use personal or shared devices. Browser storage lives in the user's browser profile on disk. The application's encryption is defence in depth, **not a substitute for device encryption**.

**Browser extensions** can read the content of any page, including decrypted assessments. Departments should restrict extensions on devices used for Protected B.

### 5.2 Where the code comes from (hosting and origin)

- **GitHub Pages is not a departmental service.** It serves only the application's code; it never receives assessment content. However, whoever controls the repository controls the code your browser runs. A compromised or malicious change could remove these safeguards. Use a reviewed version.
- On `github.io`, **every GitHub Pages site under the same account shares one origin** (for example `https://numbap.github.io`), and so shares browser storage. Other sites under that account could read the encrypted data (but not decrypt it), delete it, or replace it. GCM authentication detects replacement.
- GitHub Pages cannot send custom HTTP security headers (such as `frame-ancestors`, `X-Content-Type-Options`, or a header-delivered CSP). The application compensates with a `<meta>` CSP and a frame check in code, which offer less protection.
- **Recommendation for Protected B use:** the department should host a reviewed, version-pinned copy on its own infrastructure or approved hosting, on a **dedicated origin** (its own host name) with security headers set by the server. Running `npm start` serves the application locally.

### 5.3 Cryptographic module validation

The application uses the browser's built-in Web Crypto implementation. Whether this is a **CMVP-validated (FIPS 140-2/140-3) module** depends on the browser, operating system and configuration, and **generally cannot be guaranteed**. If departmental standards require validated cryptography for Protected B at rest (ITSG-33 IA-7 and SC-13), rely on the device's validated full-disk encryption as the primary control.

### 5.4 Passphrases

- Protection is only as strong as the passphrase. The minimum length is enforced; strength beyond that is not measured.
- There is **no passphrase recovery**. A forgotten passphrase means the stored assessment is lost; keep encrypted exports as backups.
- There is no lockout after failed attempts. Someone with a copy of the browser profile can try passphrases offline; the 600,000-iteration key derivation slows this down but cannot prevent it.

### 5.5 Memory and remnants

JavaScript cannot reliably wipe memory. While an assessment is unlocked, and for some time after, decrypted content may remain in memory, the page file, hibernation files or crash dumps. Full-disk encryption and departmental sanitization procedures (ITSP.40.006) address these copies. Browser backups, roaming profiles or synchronized folders may copy the encrypted data; check departmental configuration.

### 5.6 Files you create

Markdown and CSV reports, unencrypted JSON exports, printouts and browser-generated PDFs are **not encrypted**. Store them only in repositories approved for Protected B, mark them, and send them only through approved channels (for example, departmental Protected B-approved collaboration systems or encrypted email). Check that the browser's download folder is not synchronized to an unapproved cloud service. Content copied to the clipboard may be visible to other applications or clipboard history.

### 5.7 No audit trail

The application records no log of who opened or changed an assessment, so it does not meet ITSG-33 audit requirements (AU family) for systems of record. Use it as a working tool, and keep authoritative records in departmental systems.

### 5.8 User responsibilities

The marking reflects what the user selects. Choosing a marking does not, by itself, make handling compliant. Users must follow departmental rules on need-to-know, storage, transmission and disposal. **Protected C and classified information are not supported.**

### 5.9 Status of this statement

This statement was prepared together with the application's code by an AI assistant (Claude, Anthropic). It is a design statement supported by automated tests, **not** an assessment by a departmental security authority. The application has not undergone a security assessment and authorization (SA&A). Before using it with Protected B information, obtain approval through your department's security process. That process may treat the application as a tool used on an already-authorized endpoint.

## 6. Evidence

| Evidence | Location |
|---|---|
| Encryption, storage policy and no-network unit tests | `tests/storage.test.mjs` |
| Browser security checks (CSP blocks network; only ciphertext stored; lock clears page; framing refused; unencrypted Protected storage refused; marking on reports and file names) | `tests/security/run.mjs` |
| Encryption implementation | `js/vault.js` |
| Storage policy enforcement | `js/storage.js` |
| Content Security Policy | `index.html` and each documentation page |

All of these run on every commit in the project's continuous integration workflow.
