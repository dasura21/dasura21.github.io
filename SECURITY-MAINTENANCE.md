# Static site security

October 29, 2026: executable Three.js modules and Draco decoder assets are
served from this repository rather than third-party CDNs. The same Three.js
version used previously is pinned in package-lock.json. `npm audit` reported
no known advisories for this dependency tree at verification time.

Every page has a Content Security Policy. Scripts run from this site; inline
import maps use SHA-256 hashes. WebAssembly compilation, same-origin blob model
textures, and blob decoder workers remain enabled for the 3D viewer. JavaScript
`unsafe-eval` and executable `unsafe-inline` are not enabled. Inline styles remain
allowed for the existing design and UI animations. Referrers use
strict-origin-when-cross-origin. HTTPS enforcement is enabled in GitHub Pages.

Reproduce dependencies, refresh vendored assets and run checks:

```powershell
npm ci --ignore-scripts
npm run vendor
npm test
npm audit --audit-level=moderate
```

Commit refreshed vendor files after dependency updates. Import-map edits require
updating the CSP SHA-256 hash for that exact inline JSON. CI verifies hashes and
rejects external executable scripts, inline event handlers and missing assets.
Vendor licenses are retained. The developer check does not require a backend.

Desktop/mobile browser regression checks also covered all five pages, gallery
open/close, CAD loading and model filtering. GitHub Pages does not provide custom
response headers: a CSP meta element cannot enforce frame-ancestors. Host through
a configurable proxy if anti-framing response headers are required later.
