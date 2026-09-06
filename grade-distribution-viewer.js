"use strict";

const GRADE_DEMO = {
  kind: "grade-distribution",
  college: "LA Mission",
  collegeTotal: 22747,
  period: "Fall 2025",
  reportTitle: "Grades Distribution Summary Report",
  records: [
    {college:"LA Mission",period:"Fall 2025",program:"English",top:"150100",programTotal:2053,grade:"Excused Withdrawal",count:10,percent:10/2053},
    {college:"LA Mission",period:"Fall 2025",program:"English",top:"150100",programTotal:2053,grade:"Grade A",count:543,percent:543/2053},
    {college:"LA Mission",period:"Fall 2025",program:"English",top:"150100",programTotal:2053,grade:"Grade B",count:359,percent:359/2053},
    {college:"LA Mission",period:"Fall 2025",program:"English",top:"150100",programTotal:2053,grade:"Grade C",count:264,percent:264/2053},
    {college:"LA Mission",period:"Fall 2025",program:"English",top:"150100",programTotal:2053,grade:"Grade D",count:137,percent:137/2053},
    {college:"LA Mission",period:"Fall 2025",program:"English",top:"150100",programTotal:2053,grade:"Grade F",count:451,percent:451/2053},
    {college:"LA Mission",period:"Fall 2025",program:"English",top:"150100",programTotal:2053,grade:"Pass",count:14,percent:14/2053},
    {college:"LA Mission",period:"Fall 2025",program:"English",top:"150100",programTotal:2053,grade:"Withdrew",count:274,percent:274/2053},
    {college:"LA Mission",period:"Fall 2025",program:"English",top:"150100",programTotal:2053,grade:"Unlabeled / blank category",count:1,percent:1/2053}
  ]
};

const gradeState = { sourceName:"", parsed:null };
const gradeEls = {};

const GRADE_ORDER = ["Grade A","Grade B","Grade C","Grade D","Grade F","Pass","Withdrew","Excused Withdrawal","Unlabeled / blank category"];

document.addEventListener("DOMContentLoaded", () => {
  [
    "gradeFileInput","gradeDropZone","gradeBrowseButton","gradeDemoButton","gradeStatus","gradeWorkspace","gradeFileSummary",
    "gradeProgramSearch","gradeProgramOptions","gradeMeasure","gradeResultsTitle","gradeResultMeta","gradeKpis","gradeWarning",
    "gradeBarChart","gradeResultsBody","gradeMethodText","gradeCopyMethod","gradeDownloadCsv","gradeReset"
  ].forEach(id => gradeEls[id] = document.getElementById(id));

  gradeEls.gradeBrowseButton.addEventListener("click", () => gradeEls.gradeFileInput.click());
  gradeEls.gradeFileInput.addEventListener("change", e => {
    if (e.target.files && e.target.files[0]) loadGradeFile(e.target.files[0]);
  });
  ["dragenter","dragover"].forEach(evt => gradeEls.gradeDropZone.addEventListener(evt, e => {
    e.preventDefault();
    gradeEls.gradeDropZone.classList.add("is-dragging");
  }));
  ["dragleave","drop"].forEach(evt => gradeEls.gradeDropZone.addEventListener(evt, e => {
    e.preventDefault();
    gradeEls.gradeDropZone.classList.remove("is-dragging");
  }));
  gradeEls.gradeDropZone.addEventListener("drop", e => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) loadGradeFile(file);
  });
  gradeEls.gradeDemoButton.addEventListener("click", loadGradeDemo);
  gradeEls.gradeProgramSearch.addEventListener("input", renderGrade);
  gradeEls.gradeMeasure.addEventListener("change", renderGrade);
  gradeEls.gradeCopyMethod.addEventListener("click", () => copyGradeText(gradeEls.gradeMethodText.textContent));
  gradeEls.gradeDownloadCsv.addEventListener("click", downloadGradeCsv);
  gradeEls.gradeReset.addEventListener("click", resetGradeViewer);
  setGradeStatus("Ready. Choose a Grade Distribution Excel or CSV export, or try the English sample.", "neutral");
});

function setGradeStatus(message, kind="neutral") {
  gradeEls.gradeStatus.textContent = message;
  gradeEls.gradeStatus.dataset.kind = kind;
}

async function loadGradeFile(file) {
  const lower = file.name.toLowerCase();
  if (![".xlsx",".xls",".csv"].some(ext => lower.endsWith(ext))) {
    setGradeStatus("Please choose an Excel .xlsx, .xls, or CSV Grade Distribution export.", "error");
    return;
  }
  if (typeof XLSX === "undefined" || typeof DataMartParsers === "undefined") {
    setGradeStatus("The spreadsheet reader did not load. Check your internet connection and reload the page.", "error");
    return;
  }
  setGradeStatus(`Reading ${file.name} in your browser...`, "neutral");
  try {
    const {rows} = await DataMartFileSecurity.readRows(file, {allowCsv:true, defval:null});
    const detected = DataMartParsers.detectReport(rows);
    if (detected.kind !== "grade-distribution") throw new Error(`This looks like ${detected.label}, not a Grade Distribution export. Use Explore Data for automatic report detection.`);
    const parsed = DataMartParsers.parseGradeDistribution(rows);
    if (!parsed.records.length) throw new Error("The report was recognized, but no six-digit TOP grade rows could be read from the current layout.");
    gradeState.sourceName = file.name;
    gradeState.parsed = parsed;
    initGradeViewer();
    setGradeStatus(`Loaded ${parsed.records.length.toLocaleString()} grade-category rows from ${file.name}. The file stayed in this browser tab.`, "success");
  } catch (err) {
    console.error(err);
    setGradeStatus(err.message || "I could not read this workbook.", "error");
  }
}

function loadGradeDemo() {
  gradeState.sourceName = "Included English Grade Distribution sample";
  gradeState.parsed = JSON.parse(JSON.stringify(GRADE_DEMO));
  initGradeViewer();
  setGradeStatus("English sample loaded. It uses LA Mission Fall 2025 English TOP 150100 aggregate grade records from a CCC Data Mart export.", "success");
}

function initGradeViewer() {
  const parsed = gradeState.parsed;
  gradeEls.gradeWorkspace.hidden = false;
  fillGradeSummary(gradeEls.gradeFileSummary, [
    ["Report", parsed.reportTitle || "Grades Distribution Summary Report"],
    ["Term", parsed.period || "Not detected"],
    ["College", parsed.college || "Not detected"],
    ["TOP areas", gradePrograms().length.toLocaleString()]
  ]);
  gradeEls.gradeProgramOptions.innerHTML = "";
  const programs = gradePrograms();
  programs.forEach(p => {
    const option = document.createElement("option");
    option.value = `${p.program} · TOP ${p.top}`;
    gradeEls.gradeProgramOptions.appendChild(option);
  });
  const english = programs.find(p => p.top === "150100" || p.program.toLowerCase() === "english");
  gradeEls.gradeProgramSearch.value = english ? `${english.program} · TOP ${english.top}` : (programs[0] ? `${programs[0].program} · TOP ${programs[0].top}` : "");
  gradeEls.gradeMeasure.value = "percent";
  renderGrade();
  gradeEls.gradeWorkspace.scrollIntoView({behavior: preferredGradeScroll(), block:"start"});
}

function gradePrograms() {
  const map = new Map();
  (gradeState.parsed?.records || []).forEach(r => map.set(`${r.program}|${r.top}`, {program:r.program, top:r.top}));
  return [...map.values()].sort((a,b) => a.program.localeCompare(b.program) || a.top.localeCompare(b.top));
}

function gradeProgramQuery() {
  const text = gradeEls.gradeProgramSearch.value.trim();
  const topMatch = text.match(/\bTOP\s+(\d{6})\b/i);
  return {text, top:topMatch ? topMatch[1] : "", q:text.replace(/\s+·\s+TOP\s+\d{6}\s*$/i, "").trim().toLowerCase()};
}

function matchingGradeRecords() {
  const {text, top, q} = gradeProgramQuery();
  return (gradeState.parsed?.records || []).filter(r => !text || (top ? r.top === top : r.program.toLowerCase().includes(q) || r.top.includes(q)));
}

function aggregateGrade() {
  const records = matchingGradeRecords();
  const grouped = new Map();
  records.forEach(record => grouped.set(record.grade, (grouped.get(record.grade) || 0) + Number(record.count || 0)));
  const total = [...grouped.values()].reduce((sum, n) => sum + n, 0);
  const orderIndex = label => {
    const i = GRADE_ORDER.indexOf(label);
    return i >= 0 ? i : GRADE_ORDER.length;
  };
  const rows = [...grouped.entries()].map(([grade,count]) => ({
    grade,
    count,
    percent: total ? count / total : null
  })).sort((a,b) => orderIndex(a.grade) - orderIndex(b.grade) || a.grade.localeCompare(b.grade));
  return {records, rows, total};
}

function renderGrade() {
  if (!gradeState.parsed) return;
  const {records, rows, total} = aggregateGrade();
  const query = gradeProgramQuery();
  const label = query.text || "All six-digit TOP areas";
  const selectedPrograms = [...new Map(records.map(r => [`${r.program}|${r.top}`, {program:r.program,top:r.top}])).values()];
  gradeEls.gradeResultsTitle.textContent = label;
  gradeEls.gradeResultMeta.textContent = `${gradeState.parsed.college || "College not detected"} · ${gradeState.parsed.period || "Term not detected"} · ${formatGradeInteger(total)} reported grade records`;

  const byName = Object.fromEntries(rows.map(r => [r.grade, r.count]));
  const blankCount = byName["Unlabeled / blank category"] || 0;
  fillGradeSummary(gradeEls.gradeKpis, [
    ["Grade records", formatGradeInteger(total)],
    ["Categories", rows.length.toLocaleString()],
    ["Withdrew", formatGradeInteger(byName["Withdrew"] || 0)],
    ["Excused withdrawal", formatGradeInteger(byName["Excused Withdrawal"] || 0)]
  ]);

  if (blankCount > 0) {
    gradeEls.gradeWarning.hidden = false;
    gradeEls.gradeWarning.innerHTML = `<strong>Blank grade label preserved.</strong> ${formatGradeInteger(blankCount)} record${blankCount === 1 ? "" : "s"} in this selection had no visible grade-category label in the export. Data Mart Smart keeps ${blankCount === 1 ? "it" : "them"} instead of treating ${blankCount === 1 ? "it" : "them"} as zero or silently dropping ${blankCount === 1 ? "it" : "them"}.`;
  } else {
    gradeEls.gradeWarning.hidden = true;
    gradeEls.gradeWarning.textContent = "";
  }

  const measure = gradeEls.gradeMeasure.value;
  const chartRows = rows.map(row => ({label:row.grade, value:measure === "percent" ? row.percent : row.count}));
  renderGradeBars(gradeEls.gradeBarChart, chartRows, {format:measure, fixedMax:measure === "percent" ? 1 : null});

  gradeEls.gradeResultsBody.innerHTML = "";
  if (!rows.length) {
    gradeEls.gradeResultsBody.innerHTML = '<tr><td colspan="3">No matching grade rows. Try a program name or TOP code from the suggestions.</td></tr>';
  } else {
    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<th scope="row">${escapeGradeHtml(row.grade)}</th><td class="numeric">${formatGradeInteger(row.count)}</td><td class="numeric">${formatGradePercent(row.percent)}</td>`;
      gradeEls.gradeResultsBody.appendChild(tr);
    });
  }

  const topNote = selectedPrograms.length === 1 ? `TOP ${selectedPrograms[0].top}` : `${selectedPrograms.length} matching six-digit TOP areas`;
  const method = [
    "Source: California Community Colleges Chancellor's Office Data Mart: Grades Distribution Summary Report",
    `File: ${gradeState.sourceName}`,
    `Term: ${gradeState.parsed.period || "Not detected"}`,
    `College: ${gradeState.parsed.college || "Not detected"}`,
    `Program filter: ${label} (${topNote})`,
    `Measure: Credit Grade Count and share of selected grade records`,
    `Selected grade records: ${formatGradeInteger(total)}`,
    blankCount ? `Data quality note: ${formatGradeInteger(blankCount)} selected record${blankCount === 1 ? "" : "s"} had a blank grade-category label in the export and ${blankCount === 1 ? "was" : "were"} preserved as Unlabeled / blank category.` : "Data quality note: No blank grade-category labels were present in the selected rows.",
    "Caution: Grade Distribution shows grade composition. Use the CCCCO Enrollment Retention and Success Rate report when you need the Chancellor's Office success or retention measures."
  ].join("\n");
  gradeEls.gradeMethodText.textContent = method;
}

function renderGradeBars(container, rows, options={}) {
  container.innerHTML = "";
  const valid = rows.filter(row => Number.isFinite(row.value));
  if (!valid.length) return;
  const max = options.fixedMax || Math.max(...valid.map(row => row.value), 1);
  valid.forEach(row => {
    const width = Math.max(2, Math.min(100, (row.value / max) * 100));
    const value = options.format === "percent" ? formatGradePercent(row.value) : formatGradeInteger(row.value);
    const item = document.createElement("div");
    item.className = "bar-row explorer-bar-row";
    item.innerHTML = `<div class="bar-label">${escapeGradeHtml(row.label)}</div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${width}%"></div></div><div class="bar-value">${value}</div>`;
    container.appendChild(item);
  });
}

function fillGradeSummary(container, items) {
  container.innerHTML = "";
  items.forEach(([label,value]) => {
    const div = document.createElement("div");
    div.className = "viewer-stat";
    div.innerHTML = `<span>${escapeGradeHtml(label)}</span><strong>${escapeGradeHtml(String(value))}</strong>`;
    container.appendChild(div);
  });
}

function downloadGradeCsv() {
  const {rows,total} = aggregateGrade();
  if (!rows.length) return setGradeStatus("There are no matching grade rows to download.", "error");
  const data = [["Grade Category","Count","Percent"], ...rows.map(r => [r.grade,r.count,(r.percent*100).toFixed(2) + "%"]), ["Total",total,"100.00%"]];
  const text = data.map(row => row.map(csvGradeCell).join(",")).join("\r\n");
  const blob = new Blob([text], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data-mart-smart-grade-distribution.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setGradeStatus("Cleaned Grade Distribution CSV downloaded.", "success");
}

async function copyGradeText(text) {
  try {
    await navigator.clipboard.writeText(text);
    setGradeStatus("Method copied to the clipboard.", "success");
  } catch {
    setGradeStatus("Your browser blocked automatic copying. Select and copy the method text manually.", "error");
  }
}

function resetGradeViewer() {
  gradeState.sourceName = "";
  gradeState.parsed = null;
  gradeEls.gradeFileInput.value = "";
  gradeEls.gradeWorkspace.hidden = true;
  gradeEls.gradeProgramSearch.value = "";
  gradeEls.gradeBarChart.innerHTML = "";
  gradeEls.gradeResultsBody.innerHTML = "";
  setGradeStatus("Ready. Choose another Grade Distribution export, or try the English sample.", "neutral");
  gradeEls.gradeDropZone.scrollIntoView({behavior:preferredGradeScroll(), block:"center"});
  gradeEls.gradeBrowseButton.focus();
}

function formatGradeInteger(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)).toLocaleString() : "Not available";
}
function formatGradePercent(value) {
  return Number.isFinite(Number(value)) ? `${(Number(value)*100).toFixed(1)}%` : "Not available";
}
function preferredGradeScroll() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
function escapeGradeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
}
function csvGradeCell(value) { return DataMartFileSecurity.csvCell(value); }
