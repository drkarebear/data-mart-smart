# CCC Data Smart QA Report

**QA date:** September 6, 2026  
**Scope:** Revised static GitHub Pages site, 50 HTML pages

## What was reviewed

This pass examined the site as a faculty-facing information and analysis tool rather than only as a set of web pages. Review priorities were:

- whether users can reach the correct source or task quickly;
- whether the revised site still contains Data-Mart-only assumptions that no longer fit the broader project;
- heading structure and page landmarks;
- internal links and fragment links;
- labels and ARIA references;
- image alternative text and iframe titles;
- responsive layout risks;
- privacy and local-file-processing claims;
- safe spreadsheet handling and CSV export behavior;
- consistent CCC Data Smart branding;
- JavaScript syntax.

## User-journey results

From the homepage, the main pathways now remain short:

- question finder: 1 click;
- DataVista, Data Mart, or local-data overview: 1 click;
- Explore Data: 1 click;
- Program Review: 2 clicks;
- Equity: 2 clicks;
- Student Success: 2 clicks;
- Enrollment Planning: 2 clicks;
- Staffing/Resource Requests: 2 clicks;
- Institutional Effectiveness/Accreditation: 2 clicks;
- College Comparison: 2 clicks.

Useful supporting pages that had weak or no discoverability were linked into the active architecture. Only legacy alias pages remain intentionally absent from the current navigation.

## Key fixes made in this pass

### Start Here

The page now asks what the visitor is trying to do: answer a question, complete a work task, open an existing file, or go directly to a known source. This avoids making users understand the three data systems before they can begin.

### Explore Data

The page no longer assumes every unknown spreadsheet is a CCC Data Mart export. Data Mart-specific interpretation is used only for recognized/tested structures; generic Excel/CSV files are described as user-provided data whose source and definitions still need verification.

The H1 and introductory content now occur before the interactive uploader in the document outline.

### Discoverability and consistency

Breadcrumbs were added to active utility and workflow pages that lacked them. Current-data notes, examples, manual-export instructions, the college-comparison guide, and the program-review evidence map are now reachable from related pages.

Generated filenames now use `ccc-data-smart-*` rather than the previous `data-mart-smart-*` branding.

### Reflow and visual clarity

Additional responsive rules protect three- and four-card layouts from becoming cramped at intermediate widths. Long card titles can wrap without forcing overflow. The green icon color was darkened for stronger visual contrast.

### Search and legacy pages

Compatibility pages retained for old links have descriptive metadata and `noindex,follow`. Current pages remain indexable.

## Final automated/static checks

The final local audit checked all 50 HTML files for:

- exactly one H1 per page;
- H1 as the first heading;
- no skipped heading levels;
- duplicate IDs;
- broken `aria-labelledby`, `aria-describedby`, and `aria-controls` references;
- form inputs/selects/textareas without an accessible label;
- images without an `alt` attribute;
- inconsistent primary navigation;
- broken local file links;
- broken same-site fragment links;
- links opening a new tab without appropriate relationship attributes.

**Result: no issues detected by these static checks.**

All local JavaScript files also passed `node --check`, and the final CSS has balanced braces.

## Privacy and spreadsheet-safety review

The file-analysis tools continue to process uploaded spreadsheet data locally in the browser. The file-security helper limits file size, rows, and columns and sanitizes generated CSV cells that could otherwise be interpreted as spreadsheet formulas. Dynamic output reviewed in this pass either uses text-safe DOM methods or escapes spreadsheet/user-provided text before inserting it as HTML.

The privacy page also distinguishes local spreadsheet processing from the browser's separate request for the SheetJS library hosted on a CDN.

## What this QA does not certify

This is not a formal WCAG conformance certification or penetration test. Static checks can catch many structural failures but cannot prove all keyboard, screen-reader, zoom, focus-order, browser, or assistive-technology behavior.

Before treating the revision as final, deploy it to GitHub Pages and do one live-browser pass at minimum for:

- keyboard-only navigation and visible focus;
- 200% and 400% zoom/reflow;
- mobile-width navigation and interactive tools;
- WAVE or an equivalent accessibility scan on representative pages;
- actual Excel/CSV upload, analysis, comparison, and download workflows;
- external links and the embedded Coach after deployment.

## Recommended next build

The site architecture is stable enough that the next development phase should be the **CCC Data Coach**. Its decision sequence should match the site:

**question → best source → appropriate DataVista view/Data Mart report/local source → population → metric → denominator → interpretation cautions**

After the Coach is updated, the next technical feature should be a tested DataVista CSV interpreter using representative exports from DataVista rather than inferred column structures.
