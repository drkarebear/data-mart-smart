# Data Mart Smart: September 2026 Revision

This revision broadens the project from a Data Mart guide into a question-first guide to California Community Colleges data.

## What changed

- Rebranded the user-facing site from **Data Mart Smart** to **Data Mart Smart**.
- Added a source-selection layer so users choose among **DataVista**, **CCC Data Mart**, and **local institutional data** based on the question.
- Added new guides for **DataVista**, **Snapshot vs. Cohort**, and **When Local Data Comes First**.
- Reworked Program Review, Equity, Student Success, Enrollment Planning, Staffing/Resource Requests, Faculty Hiring, College Comparison, and Institutional Effectiveness workflows.
- Preserved the detailed Data Mart report guides as **Data Mart deep dives** rather than treating Data Mart as the default source for every question.
- Updated the export-analysis page so its strongest tested support is described accurately as Data Mart-specific; DataVista CSVs are not given unsupported metric-specific interpretation.
- Added current DataVista cautions for suppression, incomplete cohort years, student populations, and calculated FTES.
- Expanded privacy, accessibility, source, and methods language to cover the broader project.
- Updated global navigation and performed static checks for local links, fragments, duplicate IDs, heading structure, image alt attributes, iframe titles, form labels, and JavaScript syntax.

## Important scope notes

### DataVista exports

The current site does **not** yet include a tested DataVista CSV parser. A DataVista file may open as a basic table, but users should verify metric definitions, denominators, populations, suppression, and completeness in the official DataVista documentation.

### Embedded CCC Data Coach

The existing Playlab assistant was originally developed around Data Mart workflows. The revised site makes that limitation visible. A later phase could update or replace the assistant so its source-selection and DataVista guidance matches the new site architecture.

## Recommended next phase

1. Test the revised site in GitHub Pages on desktop, mobile, and keyboard-only navigation.
2. Update the Playlab Coach prompt for Data Mart Smart.
3. Obtain a few representative DataVista CSV downloads and build/test a DataVista-aware export interpreter.
4. Add task-specific metric recommendations only when they can be traced to current official metric definitions.
5. Re-run accessibility and link checks after any deployment-specific changes.

## QA pass completed after the first revision

A second pass focused on usability, accessibility, consistency, and the six most likely faculty journeys through the site.

- Simplified **Start Here** so it begins with the user's task rather than repeating the DataVista/Data Mart/local-data comparison.
- Made **Explore Data** source-neutral unless a file is positively recognized as a tested Data Mart export. Generic uploads are no longer described as Data Mart data by default.
- Moved the Explore Data page heading before the interactive uploader so the document outline begins correctly with its H1.
- Added breadcrumbs to active utility, comparison, export, and task pages that previously lacked them.
- Linked useful pages that had become difficult to discover, including the current-data notes, examples, manual export workflow, college-comparison task guide, and program-review evidence map.
- Changed generated download filenames from `data-mart-smart-*` to `data-mart-smart-*`.
- Added responsive safeguards for source cards, DataVista view cards, and task-choice grids and strengthened the green icon contrast.
- Added missing page descriptions and marked legacy compatibility pages `noindex,follow` so old links can continue working without competing with current pages in search results.
- Changed source-document markup from decorative italics to semantic `<cite>` elements.
- Re-ran static checks across all 50 HTML pages and JavaScript files after the edits.

See `QA-REPORT.md` for the final audit results and testing limits.
