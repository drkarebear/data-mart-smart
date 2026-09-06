"use strict";

(function (global) {
  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_ROWS = 100000;
  const MAX_COLUMNS = 256;
  const EXCEL_EXTENSIONS = [".xlsx", ".xls"];
  const CSV_EXTENSIONS = [".csv"];
  const SHEETJS_URL = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
  // Subresource Integrity hash for the pinned SheetJS build above. CSP already restricts
  // script-src to this exact CDN origin, but SRI adds a second, independent guarantee: if
  // cdn.sheetjs.com is ever compromised or serves different bytes than expected, the browser
  // will refuse to run the script instead of silently executing whatever it returns.
  // To fill this in: download the exact file from SHEETJS_URL, then run
  //   openssl dgst -sha384 -binary xlsx.full.min.js | openssl base64 -A
  // and paste the result below as "sha384-<hash>". Leave empty to skip the integrity check
  // (the script will still load normally; only this extra guarantee is skipped).
  const SHEETJS_SRI = "";
  let sheetJsPromise = null;

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

  function parseCsvText(text) {
    const source = String(text || "").replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;

    for (let i = 0; i < source.length; i += 1) {
      const ch = source[i];
      if (quoted) {
        if (ch === '"') {
          if (source[i + 1] === '"') { cell += '"'; i += 1; }
          else quoted = false;
        } else {
          cell += ch;
        }
        continue;
      }
      if (ch === '"') quoted = true;
      else if (ch === ',') { row.push(cell); cell = ""; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && source[i + 1] === '\n') i += 1;
        row.push(cell); cell = "";
        rows.push(row); row = [];
        if (rows.length > MAX_ROWS) throw new Error(`This CSV has more than ${MAX_ROWS.toLocaleString()} rows. Narrow the export before using it here.`);
      } else cell += ch;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    for (const r of rows) {
      if (r.length > MAX_COLUMNS) throw new Error(`This CSV has more than ${MAX_COLUMNS} columns. Narrow the export before using it here.`);
    }
    return rows;
  }

  function ensureSheetJs() {
    if (global.XLSX && global.XLSX.read && global.XLSX.utils) return Promise.resolve(global.XLSX);
    if (sheetJsPromise) return sheetJsPromise;
    if (!global.document || !global.document.head) return Promise.reject(new Error("The Excel reader is unavailable in this environment."));

    sheetJsPromise = new Promise((resolve, reject) => {
      const script = global.document.createElement("script");
      script.src = SHEETJS_URL;
      script.async = true;
      script.referrerPolicy = "no-referrer";
      script.crossOrigin = "anonymous";
      if (SHEETJS_SRI) script.integrity = SHEETJS_SRI;
      script.dataset.dataMartSmartSheetjs = "true";
      const timer = global.setTimeout(() => {
        script.remove();
        sheetJsPromise = null;
        reject(new Error("The Excel reader took too long to load. Export the same Data Mart result as CSV and try again; CSV works without the external Excel reader."));
      }, 12000);
      script.onload = () => {
        global.clearTimeout(timer);
        if (global.XLSX && global.XLSX.read && global.XLSX.utils) resolve(global.XLSX);
        else {
          sheetJsPromise = null;
          reject(new Error("The Excel reader loaded but was not available. Export the same Data Mart result as CSV and try again."));
        }
      };
      script.onerror = () => {
        global.clearTimeout(timer);
        script.remove();
        sheetJsPromise = null;
        reject(new Error("The Excel reader could not be loaded. It may be blocked by the browser or network. Export the same Data Mart result as CSV and try again."));
      };
      global.document.head.append(script);
    });
    return sheetJsPromise;
  }

  async function readRows(file, options = {}) {
    const ext = validateFile(file, options);

    // CSV does not need SheetJS. This keeps the tools usable even when the external
    // Excel reader is blocked or slow.
    if (ext === ".csv") {
      const rows = parseCsvText(await file.text());
      return { workbook: null, sheet: null, rows };
    }

    await ensureSheetJs();
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
    csvCell,
    parseCsvText,
    ensureSheetJs
  });
})(window);
