# Data Mart Smart restoration and district-tool fix — September 6, 2026

## Brand and routing
- Restored the site title to **Data Mart Smart**.
- Kept the newer question-routing work, but repositioned Data Mart as the practical first stop for many direct term/report questions.
- Reframed DataVista as the stronger choice when cohorts, equity, pathways, completion, transfer, labor-market outcomes, or integrated annual outcomes add needed depth.
- Added an explicit note that broad DataVista views can take longer to load, with a link to the official release-webinar transcript.
- Updated the primary navigation label from **Data Tools** to **Which Tool?**.

## District Compare / spreadsheet-tool fix
- Removed the blocking SheetJS script from page startup.
- Excel support now loads only when an `.xlsx` or `.xls` file is selected.
- CSV files are parsed locally without the external Excel library.
- If the Excel library is blocked or slow, the user receives a specific CSV fallback message.
- District Compare now announces that it is ready as soon as its local JavaScript loads.
- The built-in district demo no longer depends on SheetJS loading.
- Updated the Program Awards parser for the current multi-year export layout, where several annual years can appear as separate columns in one workbook.
- The Program Awards viewer now accepts both Excel and CSV and uses the shared current parser instead of an older one-period parser.

## Why this change
The previous `defer`-loaded external SheetJS script could delay every later deferred script on a spreadsheet page. If the CDN was slow or blocked, District Compare could appear not to load at all. Loading the Excel reader on demand prevents that external dependency from blocking the page itself. A second issue was also found in current Program Awards exports: the report now places multiple annual periods in separate columns, while the older parser assumed a single hard-coded count column. The revised parser detects all annual columns instead.


## College display-name normalization

- Data Mart's `LA Swest` label is displayed as **LA Southwest** in browser-based viewers and District Compare.
- The underlying Data Mart value is not changed in the user's source file; this is a display/readability normalization only.
