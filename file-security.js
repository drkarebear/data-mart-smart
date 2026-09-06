"use strict";

(function (global) {
  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_ROWS = 100000;
  const MAX_COLUMNS = 256;
  const EXCEL_EXTENSIONS = [".xlsx", ".xls"];
  const CSV_EXTENSIONS = [".csv"];

  function extensionOf(name) {
    const lower = String(name || "").toLowerCase();
    return [...EXCEL_EXTENSIONS, ...CSV_EXTENSIONS].find(ext => lower.endsWith(ext)) || "";
  }

  function validateFile(file, options = {}) {
    const allowCsv = options.allowCsv !== false;
    if (!file || typeof file.name !== "string") throw new Error("No file was selected.");
    const ext = extensionOf(file.name);
    const allowed = allowCsv ? [...EXCEL_EXTENSIONS, ...CSV_EXTENSIONS] : EXCEL_EXTENSIONS;
    if (!allowed.includes(ext)) throw new Error(allowCsv ? "Choose an .xlsx, .xls, or .csv file." : "Choose an .xlsx or .xls file.");
    if (!Number.isFinite(file.size) || file.size <= 0) throw new Error("The selected file is empty.");
    if (file.size > MAX_FILE_BYTES) throw new Error("For safety, choose a file smaller than 10 MB. Large exports should be narrowed at the source before analysis.");
    return ext;
  }

  async function readRows(file, options = {}) {
    validateFile(file, options);
    if (!global.XLSX || !global.XLSX.read || !global.XLSX.utils) throw new Error("The spreadsheet reader is unavailable. Reload the page and try again.");

    const buffer = await file.arrayBuffer();
    const workbook = global.XLSX.read(buffer, {
      type: "array",
      cellDates: false,
      cellFormula: false,
      cellHTML: false,
      cellStyles: false,
      cellNF: false,
      bookVBA: false,
      bookFiles: false,
      sheetRows: MAX_ROWS + 1
    });
    if (!workbook.SheetNames || !workbook.SheetNames.length) throw new Error("No worksheets were found in this file.");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error("The first worksheet could not be read.");

    if (sheet["!ref"]) {
      const range = global.XLSX.utils.decode_range(sheet["!ref"]);
      const rowCount = range.e.r - range.s.r + 1;
      const columnCount = range.e.c - range.s.c + 1;
      if (rowCount > MAX_ROWS) throw new Error(`This worksheet has more than ${MAX_ROWS.toLocaleString()} rows. Narrow the export before using it here.`);
      if (columnCount > MAX_COLUMNS) throw new Error(`This worksheet has more than ${MAX_COLUMNS} columns. Narrow the export before using it here.`);
    }

    const rows = global.XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: true,
      defval: Object.prototype.hasOwnProperty.call(options, "defval") ? options.defval : null
    });
    if (rows.length > MAX_ROWS) throw new Error(`This worksheet has more than ${MAX_ROWS.toLocaleString()} rows. Narrow the export before using it here.`);
    return { workbook, sheet, rows };
  }

  function csvCell(value) {
    let text = value === null || value === undefined ? "" : String(value);
    // Prevent spreadsheet applications from interpreting untrusted text as a formula.
    if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  global.DataMartFileSecurity = Object.freeze({
    MAX_FILE_BYTES,
    MAX_ROWS,
    MAX_COLUMNS,
    validateFile,
    readRows,
    csvCell
  });
})(window);
