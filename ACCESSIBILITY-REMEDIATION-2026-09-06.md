# Data Mart Smart accessibility remediation — September 6, 2026

This build incorporates the user-provided/Claude edits first, then applies an additional WCAG 2.2 AA remediation pass.

## Preserved from the incoming build

- More descriptive repeated headings on `explore-data.html`.
- Existing decorative logo treatment (`alt=""`) with the home link carrying the accessible name.
- Existing CSP and browser-local file-processing protections.
- SheetJS loader now uses `crossOrigin="anonymous"` and includes a documented SRI placeholder. The SRI hash remains intentionally blank because the exact pinned CDN bytes could not be independently retrieved in this environment; no hash was invented.

## Accessibility changes in this build

- Added a sitewide **Report an accessibility issue** email link to `karencrozer@gmail.com`, with a prefilled subject.
- Updated the Accessibility page with an email reporting path, optional GitHub issue path, and suggested details to include without requesting disability/medical information.
- Removed sticky behavior from data-viewer filter panels so keyboard focus cannot become trapped or fully obscured below the viewport.
- Hardened District Trends reflow so the wide line chart scrolls inside its own labeled region rather than widening the whole page.
- Strengthened the Coach textarea and example-button boundaries to at least 3:1 against white.
- Added `summary:focus-visible` to the shared focus treatment.
- Associated important helper/instruction text with the relevant form controls using `aria-describedby`.
- Removed the broad live region from District Compare results and added concise update announcements through the dedicated status region.
- Changed the Coach result from a broad live region to a labeled region that receives programmatic focus after submission.
- Added `role="region"` to focusable scrollable tables/charts with accessible names.
- Shortened the District Trends SVG description because exact values are already available in the following accessible table.
- Increased non-highlighted District Trends line opacity to keep comparison lines easier to perceive.
- Removed italic styling from the Coach's quoted question echo to avoid quotation marks plus italics on the same text.

## QA in this build

- 50 HTML pages checked for one `main`, one `h1`, `lang`, duplicate IDs, heading-level skips, image alt attributes, iframe titles, form-control accessible names, broken ARIA ID references, and `target="_blank"` links missing `noopener`.
- All JavaScript files passed `node --check`.
- All 50 pages include the accessibility-report email link.

Automated/static checks support accessibility work but are not a certification. The deployed site should still receive keyboard-only, 200%/400% zoom/reflow, WAVE, and VoiceOver/NVDA testing after publication, especially after changes to interactive data viewers.
