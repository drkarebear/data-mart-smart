# Data Mart Smart Security Notes

## Intended data
Data Mart Smart is designed for aggregate, public, or otherwise appropriately shareable CCC Data Mart exports. Do not use it for student-level records, credentials, protected education records, or confidential institutional data.

## Architecture
The site is static. It has no application backend, user accounts, application database, cookies, localStorage, sessionStorage, or analytics code. Spreadsheet parsing occurs in the browser.

## Spreadsheet safety
- SheetJS Community Edition is pinned to 0.20.3 from the authoritative SheetJS CDN.
- File selection is limited to expected spreadsheet/CSV extensions.
- Files larger than 10 MB are rejected.
- Worksheet conversion is capped at 100,000 rows and 256 columns.
- Formula, HTML, VBA, style, and ancillary file parsing features are disabled where the parser permits.
- Generated CSV text is protected against spreadsheet formula injection.

## Browser policy
Every HTML page includes a Content Security Policy and no-referrer policy. Scripts are limited to local scripts and the pinned SheetJS CDN. Frames are limited to Playlab. Object embedding is disabled.

## Playlab Coach
The Playlab iframe is click-to-load, sandboxed, and uses no-referrer. It is a third-party service and must not receive protected or confidential data.

## Residual risks
A static browser tool cannot guarantee that a malformed compressed workbook will never exhaust browser resources. Only use files from trusted sources, preferably official CCCCO exports. GitHub Pages and external service providers can receive ordinary HTTP request metadata. For the strongest supply-chain privacy posture, vendor the exact SheetJS 0.20.3 file locally after verifying the vendor checksum.
