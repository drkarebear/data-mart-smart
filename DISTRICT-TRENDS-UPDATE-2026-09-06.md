# District Trends Update - September 6, 2026

District Compare now supports a multi-college line graph for Program Awards exports that contain multiple annual columns.

## What changed

- Added a **View** control with:
  - Compare colleges in one period
  - Follow colleges over time
- Trend view defaults to the latest five available annual periods.
- Users can choose the start and end period.
- Each selected college is followed as its own line across the same periods.
- The existing **Highlight my college** control also highlights a line in trend view.
- Trend results include an accessible year-by-year table and downloadable CSV.
- Missing college-period values remain missing. They are not silently converted to zero.
- A college omitted from the export is not assumed to have zero awards.
- The LA Swest label continues to display as **LA Southwest**.

## Current scope

The one-file multi-college trend view is currently enabled for **Program Awards** exports with at least two annual periods. Other supported District Compare reports continue to use the one-period comparison view.

The separate Compare & Trends page remains useful when the user has multiple separate exports rather than one multi-year Program Awards export.

## Test file

Tested against the supplied Program Awards Summary export for Speech Communication (TOP 150600). The latest five periods were recognized as 2021-2022 through 2025-2026. Eight colleges had award rows in that export. LA Trade-Technical did not appear as a college row in the selected export, so the tool does not invent a zero-valued ninth line.
