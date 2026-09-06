
"use strict";

const DEMO_RECORDS = [{"district": "Los Angeles CCD", "college": "East LA", "awardType": "Associate in Arts for Transfer (A.A.-T) Degree", "program": "English", "top": "150100", "count": 24, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA City", "awardType": "Associate in Arts for Transfer (A.A.-T) Degree", "program": "English", "top": "150100", "count": 12, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA City", "awardType": "Associate of Arts (A.A.) degree", "program": "English", "top": "150100", "count": 2, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA City", "awardType": "Certificate requiring 16 to fewer than 30 semester units", "program": "English", "top": "150100", "count": 3, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA Harbor", "awardType": "Associate in Arts for Transfer (A.A.-T) Degree", "program": "English", "top": "150100", "count": 9, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA Mission", "awardType": "Associate in Arts for Transfer (A.A.-T) Degree", "program": "English", "top": "150100", "count": 12, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA Pierce", "awardType": "Associate in Arts for Transfer (A.A.-T) Degree", "program": "English", "top": "150100", "count": 15, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA Swest", "awardType": "Associate in Arts for Transfer (A.A.-T) Degree", "program": "English", "top": "150100", "count": 2, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA Swest", "awardType": "Associate of Arts (A.A.) degree", "program": "English", "top": "150100", "count": 1, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA Swest", "awardType": "Noncredit award requiring from 48 to < 96 hours", "program": "English", "top": "150100", "count": 2, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA Trade", "awardType": "Associate in Arts for Transfer (A.A.-T) Degree", "program": "English", "top": "150100", "count": 1, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA Trade", "awardType": "Associate of Arts (A.A.) degree", "program": "English", "top": "150100", "count": 1, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "LA Valley", "awardType": "Associate in Arts for Transfer (A.A.-T) Degree", "program": "English", "top": "150100", "count": 21, "period": "Annual 2025-2026"}, {"district": "Los Angeles CCD", "college": "West LA", "awardType": "Associate in Arts for Transfer (A.A.-T) Degree", "program": "English", "top": "150100", "count": 12, "period": "Annual 2025-2026"}];

const state = {
  records: [],
  sourceName: "",
  reportTitle: "",
  period: "",
  district: "",
  selectedColleges: new Set(),
};

const els = {};
document.addEventListener("DOMContentLoaded", () => {
  [
    "fileInput","dropZone","browseButton","demoButton","status","workspace","programSearch",
    "programOptions","awardType","collegeFilters","resultsTitle","resultMeta","resultsBody",
    "barChart","methodText","copyMethod","downloadCsv","resetButton","fileSummary"
  ].forEach(id => els[id] = document.getElementById(id));

  els.browseButton.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", e => {
    if (e.target.files && e.target.files[0]) loadWorkbookFile(e.target.files[0]);
  });
  ["dragenter","dragover"].forEach(evt => els.dropZone.addEventListener(evt, e => {
    e.preventDefault();
    els.dropZone.classList.add("is-dragging");
  }));
  ["dragleave","drop"].forEach(evt => els.dropZone.addEventListener(evt, e => {
    e.preventDefault();
    els.dropZone.classList.remove("is-dragging");
  }));
  els.dropZone.addEventListener("drop", e => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) loadWorkbookFile(file);
  });
  els.demoButton.addEventListener("click", loadDemo);
  els.programSearch.addEventListener("input", renderResults);
  els.awardType.addEventListener("change", renderResults);
  els.copyMethod.addEventListener("click", copyMethod);
  els.downloadCsv.addEventListener("click", downloadCsv);
  els.resetButton.addEventListener("click", resetViewer);

  setStatus("Ready. Choose the included demo or drop a CCCCO Program Awards Excel export.", "neutral");
});

function preferredScrollBehavior() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function setStatus(message, kind="neutral") {
  els.status.textContent = message;
  els.status.dataset.kind = kind;
}

function loadDemo() {
  state.records = DEMO_RECORDS.map(x => ({...x}));
  state.sourceName = "Included demo from ProgAwardsSumm workbook";
  state.reportTitle = "Program Awards Summary Report";
  state.period = "Annual 2025-2026";
  state.district = "Los Angeles CCD";
  initializeWorkspace("English · TOP 150100");
  setStatus("Demo loaded. These are English award records from the supplied Annual 2025-2026 LACCD export.", "success");
}

async function loadWorkbookFile(file) {
  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
    setStatus("Please choose an Excel .xlsx or .xls Data Mart export.", "error");
    return;
  }
  if (typeof XLSX === "undefined") {
    setStatus("The spreadsheet reader did not load. Check your internet connection and reload this page.", "error");
    return;
  }

  setStatus(`Reading ${file.name} in your browser…`, "neutral");
  try {
    const {rows} = await DataMartFileSecurity.readRows(file, {allowCsv:false, defval:null});
    const parsed = parseProgramAwards(rows);

    if (parsed.records.length === 0) {
      throw new Error("I could not find program-level award rows in the expected CCCCO Program Awards Summary layout.");
    }

    state.records = parsed.records;
    state.sourceName = file.name;
    state.reportTitle = parsed.reportTitle || "Program Awards Summary Report";
    state.period = parsed.period || "Period not detected";
    state.district = parsed.district || "District not detected";

    const english = uniquePrograms().find(p => p.top === "150100" || p.program.toLowerCase() === "english");
    initializeWorkspace(english ? `${english.program} · TOP ${english.top}` : "");
    setStatus(`Loaded ${state.records.length.toLocaleString()} program-award rows from ${file.name}. The file stayed in this browser tab.`, "success");
  } catch (err) {
    console.error(err);
    setStatus(err.message || "I could not read this workbook.", "error");
  }
}

function parseProgramAwards(rows) {
  let district = "";
  let college = "";
  let awardType = "";
  let period = "";
  let reportTitle = "";
  const records = [];

  for (const sourceRow of rows) {
    const row = Array.isArray(sourceRow) ? sourceRow : [];
    const a = clean(row[0]), b = clean(row[1]), c = clean(row[2]), d = clean(row[3]);
    const f = row[5];

    for (const cell of row) {
      const text = clean(cell);
      if (!reportTitle && /Program Awards Summary Report/i.test(text)) reportTitle = text;
      if (!period && /(?:Annual\s+)?\d{4}-\d{4}/i.test(text)) {
        const m = text.match(/(?:Annual\s+)?\d{4}-\d{4}/i);
        if (m) period = m[0];
      }
    }

    if (a && /\sTotal$/i.test(a)) district = a.replace(/\sTotal$/i, "").trim();
    if (b && /\sTotal$/i.test(b)) college = b.replace(/\sTotal$/i, "").trim();
    if (c && /\sTotal$/i.test(c)) awardType = c.replace(/\s+Total$/i, "").trim();

    if (d) {
      const match = d.match(/^(.*)-(\d{6})$/);
      const count = Number(f);
      if (match && Number.isFinite(count)) {
        records.push({
          district,
          college,
          awardType,
          program: match[1].trim(),
          top: match[2],
          count,
          period
        });
      }
    }
  }
  return {records, district, period, reportTitle};
}

function clean(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function uniquePrograms() {
  const map = new Map();
  state.records.forEach(r => map.set(`${r.program}|${r.top}`, {program:r.program, top:r.top}));
  return [...map.values()].sort((a,b) => a.program.localeCompare(b.program) || a.top.localeCompare(b.top));
}

function initializeWorkspace(defaultProgram="") {
  els.workspace.hidden = false;
  els.fileSummary.innerHTML = "";
  const items = [
    ["Report", state.reportTitle || "Program Awards Summary Report"],
    ["Period", state.period || "Not detected"],
    ["District", state.district || "Not detected"],
    ["Parsed rows", state.records.length.toLocaleString()]
  ];
  items.forEach(([label,value]) => {
    const div = document.createElement("div");
    div.className = "viewer-stat";
    div.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
    els.fileSummary.appendChild(div);
  });

  populatePrograms();
  populateAwardTypes();
  populateColleges();

  els.programSearch.value = defaultProgram;
  renderResults();
  els.workspace.scrollIntoView({behavior:preferredScrollBehavior(), block:"start"});
}

function populatePrograms() {
  els.programOptions.innerHTML = "";
  uniquePrograms().forEach(p => {
    const option = document.createElement("option");
    option.value = `${p.program} · TOP ${p.top}`;
    els.programOptions.appendChild(option);
  });
}

function populateAwardTypes() {
  const current = els.awardType.value;
  const types = [...new Set(state.records.map(r => r.awardType).filter(Boolean))].sort();
  els.awardType.innerHTML = `<option value="">All award types</option>`;
  types.forEach(t => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;
    els.awardType.appendChild(option);
  });
  if ([...els.awardType.options].some(o => o.value === current)) els.awardType.value = current;
}

function populateColleges() {
  const colleges = [...new Set(state.records.map(r => r.college).filter(Boolean))].sort();
  state.selectedColleges = new Set(colleges);
  els.collegeFilters.innerHTML = "";
  colleges.forEach((college, i) => {
    const id = `college-${i}`;
    const label = document.createElement("label");
    label.className = "check-chip";
    label.innerHTML = `<input type="checkbox" id="${id}" value="${escapeAttr(college)}" checked> <span>${escapeHtml(college)}</span>`;
    label.querySelector("input").addEventListener("change", e => {
      if (e.target.checked) state.selectedColleges.add(college);
      else state.selectedColleges.delete(college);
      renderResults();
    });
    els.collegeFilters.appendChild(label);
  });
}

function programQuery() {
  const text = els.programSearch.value.trim();
  const topMatch = text.match(/\bTOP\s+(\d{6})\b/i);
  return {text, top: topMatch ? topMatch[1] : ""};
}

function matchingRecords() {
  const {text, top} = programQuery();
  let q = text.replace(/\s+·\s+TOP\s+\d{6}\s*$/i, "").trim().toLowerCase();
  const award = els.awardType.value;

  return state.records.filter(r => {
    const programMatch = !text || (top ? r.top === top : r.program.toLowerCase().includes(q) || r.top.includes(q));
    const awardMatch = !award || r.awardType === award;
    const collegeMatch = state.selectedColleges.has(r.college);
    return programMatch && awardMatch && collegeMatch;
  });
}

function renderResults() {
  if (!state.records.length) return;
  const records = matchingRecords();
  const grouped = new Map();
  records.forEach(r => grouped.set(r.college, (grouped.get(r.college) || 0) + r.count));
  const rows = [...grouped.entries()].map(([college,count]) => ({college,count}))
    .sort((a,b) => b.count - a.count || a.college.localeCompare(b.college));

  const {text, top} = programQuery();
  const label = text || "All programs";
  els.resultsTitle.textContent = label;
  const total = rows.reduce((s,r) => s + r.count, 0);
  els.resultMeta.textContent = `${rows.length} college${rows.length === 1 ? "" : "s"} · ${total.toLocaleString()} award record${total === 1 ? "" : "s"} in the selected filters`;

  els.resultsBody.innerHTML = "";
  if (!rows.length) {
    els.resultsBody.innerHTML = `<tr><td colspan="2">No matching award records. Try a program name or TOP code from the suggestions.</td></tr>`;
  } else {
    rows.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<th scope="row">${escapeHtml(r.college)}</th><td>${r.count.toLocaleString()}</td>`;
      els.resultsBody.appendChild(tr);
    });
  }
  renderBars(rows);
  updateMethod(records, rows, label, total);
}

function renderBars(rows) {
  els.barChart.innerHTML = "";
  if (!rows.length) return;
  const max = Math.max(...rows.map(r => r.count), 1);
  rows.forEach(r => {
    const item = document.createElement("div");
    item.className = "bar-row";
    const width = Math.max(2, (r.count / max) * 100);
    item.innerHTML = `
      <div class="bar-label">${escapeHtml(r.college)}</div>
      <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${width}%"></div></div>
      <div class="bar-value">${r.count.toLocaleString()}</div>`;
    els.barChart.appendChild(item);
  });
}

function updateMethod(records, rows, label, total) {
  const types = els.awardType.value || "All award types";
  const measure = "Award Count (not unique graduates)";
  const method = [
    `Source: California Community Colleges Chancellor's Office Data Mart: Program Awards Summary Report`,
    `File: ${state.sourceName}`,
    `Period: ${state.period}`,
    `Geography: ${state.district}; ${rows.length} selected college${rows.length === 1 ? "" : "s"}`,
    `Program filter: ${label}`,
    `Award type: ${types}`,
    `Measure: ${measure}`,
    `Selected award records: ${total.toLocaleString()}`,
    `Caution: One student can receive more than one award. These counts should not be described as unique graduates.`
  ].join("\n");
  els.methodText.textContent = method;
}

async function copyMethod() {
  try {
    await navigator.clipboard.writeText(els.methodText.textContent);
    const old = els.copyMethod.textContent;
    els.copyMethod.textContent = "Copied";
    setStatus("Method copied to the clipboard.", "success");
    setTimeout(() => els.copyMethod.textContent = old, 1400);
  } catch {
    setStatus("Your browser blocked automatic copying. You can select and copy the method text manually.", "error");
  }
}

function downloadCsv() {
  const records = matchingRecords();
  if (!records.length) { setStatus("There are no matching rows to download. Adjust the filters and try again.", "error"); return; }
  const grouped = new Map();
  records.forEach(r => grouped.set(r.college, (grouped.get(r.college) || 0) + r.count));
  const rows = [...grouped.entries()].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
  const csv = [
    ["College","Award Count"],
    ...rows
  ].map(row => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data-mart-smart-program-awards.csv";
  a.click();
  URL.revokeObjectURL(url);
  setStatus("Comparison CSV downloaded.", "success");
}

function csvCell(value) { return DataMartFileSecurity.csvCell(value); }

function resetViewer() {
  state.records = [];
  state.sourceName = "";
  state.period = "";
  state.district = "";
  state.selectedColleges = new Set();
  els.workspace.hidden = true;
  els.fileInput.value = "";
  els.programSearch.value = "";
  setStatus("Reset. Choose the included demo or drop a CCCCO Program Awards Excel export.", "neutral");
  window.scrollTo({top:0, behavior:preferredScrollBehavior()});
  els.browseButton.focus();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}
function escapeAttr(value) {
  return escapeHtml(value);
}
