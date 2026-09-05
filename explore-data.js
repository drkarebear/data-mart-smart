"use strict";

const AWARDS_DEMO = [
  {district:"Los Angeles CCD",college:"East LA",awardType:"Associate in Arts for Transfer (A.A.-T) Degree",program:"English",top:"150100",count:24,period:"Annual 2025-2026"},
  {district:"Los Angeles CCD",college:"LA City",awardType:"Associate in Arts for Transfer (A.A.-T) Degree",program:"English",top:"150100",count:12,period:"Annual 2025-2026"},
  {district:"Los Angeles CCD",college:"LA City",awardType:"Associate of Arts (A.A.) degree",program:"English",top:"150100",count:2,period:"Annual 2025-2026"},
  {district:"Los Angeles CCD",college:"LA City",awardType:"Certificate requiring 16 to fewer than 30 semester units",program:"English",top:"150100",count:3,period:"Annual 2025-2026"},
  {district:"Los Angeles CCD",college:"LA Harbor",awardType:"Associate in Arts for Transfer (A.A.-T) Degree",program:"English",top:"150100",count:9,period:"Annual 2025-2026"},
  {district:"Los Angeles CCD",college:"LA Mission",awardType:"Associate in Arts for Transfer (A.A.-T) Degree",program:"English",top:"150100",count:12,period:"Annual 2025-2026"},
  {district:"Los Angeles CCD",college:"LA Pierce",awardType:"Associate in Arts for Transfer (A.A.-T) Degree",program:"English",top:"150100",count:15,period:"Annual 2025-2026"},
  {district:"Los Angeles CCD",college:"LA Swest",awardType:"Associate in Arts for Transfer (A.A.-T) Degree",program:"English",top:"150100",count:2,period:"Annual 2025-2026"},
  {district:"Los Angeles CCD",college:"LA Swest",awardType:"Associate of Arts (A.A.) degree",program:"English",top:"150100",count:1,period:"Annual 2025-2026"},
  {district:"Los Angeles CCD",college:"LA Trade",awardType:"Associate in Arts for Transfer (A.A.-T) Degree",program:"English",top:"150100",count:1,period:"Annual 2025-2026"},
  {district:"Los Angeles CCD",college:"LA Valley",awardType:"Associate in Arts for Transfer (A.A.-T) Degree",program:"English",top:"150100",count:21,period:"Annual 2025-2026"},
  {district:"Los Angeles CCD",college:"West LA",awardType:"Associate in Arts for Transfer (A.A.-T) Degree",program:"English",top:"150100",count:12,period:"Annual 2025-2026"}
];

const SUCCESS_DEMO = {
  kind:"retention-success",
  college:"LA Mission",
  period:"Fall 2025",
  reportTitle:"Credit Course Retention/Success Rate Summary Report",
  populations:["Credit"],
  records:[
    {college:"LA Mission",period:"Fall 2025",modality:"Delayed Interaction (Internet Based)",top2Name:"Humanities (Letters)",top2:"15",top4Name:"English",top4:"1501",program:"English",top:"150100",measures:{Credit:{enrollment:1124,retention:932,success:618,retentionRate:0.8291814947,successRate:0.5498220641}}},
    {college:"LA Mission",period:"Fall 2025",modality:"Non Distance Education Methods",top2Name:"Humanities (Letters)",top2:"15",top4Name:"English",top4:"1501",program:"English",top:"150100",measures:{Credit:{enrollment:904,retention:822,success:547,retentionRate:0.9092920354,successRate:0.6050884956}}},
    {college:"LA Mission",period:"Fall 2025",modality:"Simultaneous Interaction (Internet Based)",top2Name:"Humanities (Letters)",top2:"15",top4Name:"English",top4:"1501",program:"English",top:"150100",measures:{Credit:{enrollment:15,retention:15,success:15,retentionRate:1,successRate:1}}}
  ]
};



const EXPLORE_GRADE_DEMO = {
  kind:"grade-distribution", college:"LA Mission", collegeTotal:22747, period:"Fall 2025", reportTitle:"Grades Distribution Summary Report",
  records:[
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

const EXPLORE_GRADE_ORDER = ["Grade A","Grade B","Grade C","Grade D","Grade F","Pass","Withdrew","Excused Withdrawal","Unlabeled / blank category"];

const state = {
  sourceName:"",
  kind:"",
  awards:null,
  success:null,
  grade:null,
  selectedColleges:new Set()
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  [
    "exploreFileInput","exploreDropZone","exploreBrowseButton","demoSuccessButton","demoAwardsButton","demoGradeButton","exploreStatus",
    "detectedReport","detectedReportName","detectedReportNote","exploreWorkspace","awardsModule","successModule","gradeModule","unsupportedModule",
    "unsupportedTitle","unsupportedText","unsupportedGuideLink",
    "awardsFileSummary","awardsProgramSearch","awardsProgramOptions","awardsType","awardsCollegeFilters","awardsResultsTitle",
    "awardsResultMeta","awardsResultsBody","awardsBarChart","awardsMethodText","awardsCopyMethod","awardsDownloadCsv",
    "successFileSummary","successProgramSearch","successProgramOptions","successPopulation","successChartMeasure","successResultsTitle",
    "successResultMeta","successKpis","successSmallN","successBarChart","successResultsBody","successMethodText","successCopyMethod","successDownloadCsv",
    "exploreGradeFileSummary","exploreGradeProgramSearch","exploreGradeProgramOptions","exploreGradeMeasure","exploreGradeResultsTitle","exploreGradeResultMeta","exploreGradeKpis","exploreGradeWarning","exploreGradeBarChart","exploreGradeResultsBody","exploreGradeMethodText","exploreGradeCopyMethod","exploreGradeDownloadCsv"
  ].forEach(id => els[id] = document.getElementById(id));

  els.exploreBrowseButton.addEventListener("click", () => els.exploreFileInput.click());
  els.exploreFileInput.addEventListener("change", e => {
    if (e.target.files && e.target.files[0]) loadFile(e.target.files[0]);
  });

  ["dragenter","dragover"].forEach(evt => els.exploreDropZone.addEventListener(evt, e => {
    e.preventDefault();
    els.exploreDropZone.classList.add("is-dragging");
  }));
  ["dragleave","drop"].forEach(evt => els.exploreDropZone.addEventListener(evt, e => {
    e.preventDefault();
    els.exploreDropZone.classList.remove("is-dragging");
  }));
  els.exploreDropZone.addEventListener("drop", e => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) loadFile(file);
  });

  els.demoAwardsButton.addEventListener("click", loadAwardsDemo);
  els.demoSuccessButton.addEventListener("click", loadSuccessDemo);
  els.demoGradeButton.addEventListener("click", loadGradeDemo);
  document.querySelectorAll(".explore-reset").forEach(button => button.addEventListener("click", resetExplorer));

  els.awardsProgramSearch.addEventListener("input", renderAwards);
  els.awardsType.addEventListener("change", renderAwards);
  els.awardsCopyMethod.addEventListener("click", () => copyText(els.awardsMethodText.textContent));
  els.awardsDownloadCsv.addEventListener("click", downloadAwardsCsv);

  els.successProgramSearch.addEventListener("input", renderSuccess);
  els.successPopulation.addEventListener("change", renderSuccess);
  els.successChartMeasure.addEventListener("change", renderSuccess);
  els.successCopyMethod.addEventListener("click", () => copyText(els.successMethodText.textContent));
  els.successDownloadCsv.addEventListener("click", downloadSuccessCsv);

  els.exploreGradeProgramSearch.addEventListener("input", renderExploreGrade);
  els.exploreGradeMeasure.addEventListener("change", renderExploreGrade);
  els.exploreGradeCopyMethod.addEventListener("click", () => copyText(els.exploreGradeMethodText.textContent));
  els.exploreGradeDownloadCsv.addEventListener("click", downloadExploreGradeCsv);

  setStatus("Ready. Choose a Data Mart Excel or CSV export, or try a demo.", "neutral");
});

function preferredScrollBehavior() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function setStatus(message, kind="neutral") {
  els.exploreStatus.textContent = message;
  els.exploreStatus.dataset.kind = kind;
}

function showDetected(label, note, supported) {
  els.detectedReport.hidden = false;
  els.detectedReport.dataset.supported = supported ? "true" : "false";
  els.detectedReportName.textContent = label;
  els.detectedReportNote.textContent = note;
}

async function loadFile(file) {
  const lower = file.name.toLowerCase();
  if (![".xlsx",".xls",".csv"].some(ext => lower.endsWith(ext))) {
    setStatus("Please choose an Excel .xlsx, .xls, or CSV Data Mart export.", "error");
    return;
  }
  if (typeof XLSX === "undefined" || typeof DataMartParsers === "undefined") {
    setStatus("The spreadsheet reader did not load. Check your internet connection and reload the page.", "error");
    return;
  }

  setStatus(`Reading ${file.name} in your browser...`, "neutral");
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, {type:"array", cellDates:false});
    if (!workbook.SheetNames.length) throw new Error("No worksheets were found in this file.");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, {header:1, raw:true, defval:null});
    const detected = DataMartParsers.detectReport(rows);

    state.sourceName = file.name;
    state.kind = detected.kind;
    hideModules();

    if (detected.kind === "program-awards") {
      const parsed = DataMartParsers.parseProgramAwards(rows);
      if (!parsed.records.length) throw new Error("The report was recognized, but no program-level award rows could be read from the current layout.");
      state.awards = parsed;
      showDetected("Program Awards detected", `${parsed.period || "Period not detected"}. The working Program Awards module is ready.`, true);
      initAwards();
      setStatus(`Loaded ${parsed.records.length.toLocaleString()} program-award rows from ${file.name}. The file stayed in this browser tab.`, "success");
      return;
    }

    if (detected.kind === "retention-success") {
      const parsed = DataMartParsers.parseRetentionSuccess(rows);
      if (!parsed.records.length) throw new Error("The report was recognized, but no six-digit TOP outcome rows could be read from the current layout.");
      state.success = parsed;
      showDetected("Success & Retention detected", `${parsed.college || "College not detected"}, ${parsed.period || "period not detected"}. The working outcomes module is ready.`, true);
      initSuccess();
      setStatus(`Loaded ${parsed.records.length.toLocaleString()} six-digit TOP outcome rows from ${file.name}. The file stayed in this browser tab.`, "success");
      return;
    }

    if (detected.kind === "grade-distribution") {
      const parsed = DataMartParsers.parseGradeDistribution(rows);
      if (!parsed.records.length) throw new Error("The report was recognized, but no six-digit TOP grade rows could be read from the current layout.");
      state.grade = parsed;
      showDetected("Grade Distribution detected", `${parsed.college || "College not detected"}, ${parsed.period || "period not detected"}. The grade composition module is ready.`, true);
      initExploreGrade();
      setStatus(`Loaded ${parsed.records.length.toLocaleString()} grade-category rows from ${file.name}. The file stayed in this browser tab.`, "success");
      return;
    }

    showDetected(`${detected.label} detected`, "The report is recognized, but its visualization module is not built yet.", false);
    showUnsupported(detected.kind, detected.label);
    setStatus(`Recognized ${detected.label}. This report is in the next phase of Explore Data.`, "success");
  } catch (err) {
    console.error(err);
    setStatus(err.message || "I could not read this workbook.", "error");
  }
}

function loadAwardsDemo() {
  state.sourceName = "Included English Program Awards demo";
  state.kind = "program-awards";
  state.awards = {
    kind:"program-awards",
    records:AWARDS_DEMO.map(r => ({...r})),
    district:"Los Angeles CCD",
    period:"Annual 2025-2026",
    reportTitle:"Program Awards Summary Report"
  };
  hideModules();
  showDetected("Program Awards demo loaded", "Annual 2025-2026, Los Angeles CCD. The working Program Awards module is ready.", true);
  initAwards();
  setStatus("Program Awards demo loaded. The demo uses English award records from the earlier LACCD export.", "success");
}

function loadSuccessDemo() {
  state.sourceName = "Included English Success & Retention demo";
  state.kind = "retention-success";
  state.success = JSON.parse(JSON.stringify(SUCCESS_DEMO));
  hideModules();
  showDetected("Success & Retention demo loaded", "LA Mission, Fall 2025. The working outcomes module is ready.", true);
  initSuccess();
  setStatus("Success & Retention demo loaded. The demo uses English TOP 150100 records from the supplied LA Mission Fall 2025 export.", "success");
}

function loadGradeDemo() {
  state.sourceName = "Included English Grade Distribution demo";
  state.kind = "grade-distribution";
  state.grade = JSON.parse(JSON.stringify(EXPLORE_GRADE_DEMO));
  hideModules();
  showDetected("Grade Distribution demo loaded", "LA Mission, Fall 2025. The grade composition module is ready.", true);
  initExploreGrade();
  setStatus("Grade Distribution demo loaded. The demo uses English TOP 150100 records from the supplied LA Mission Fall 2025 export.", "success");
}

function hideModules() {
  els.exploreWorkspace.hidden = true;
  els.awardsModule.hidden = true;
  els.successModule.hidden = true;
  els.gradeModule.hidden = true;
  els.unsupportedModule.hidden = true;
}

function initAwards() {
  els.exploreWorkspace.hidden = false;
  els.awardsModule.hidden = false;
  const parsed = state.awards;
  fillSummary(els.awardsFileSummary, [
    ["Report", parsed.reportTitle || "Program Awards Summary Report"],
    ["Period", parsed.period || "Not detected"],
    ["District", parsed.district || "Not detected"],
    ["Parsed rows", parsed.records.length.toLocaleString()]
  ]);

  const programs = awardsPrograms();
  els.awardsProgramOptions.innerHTML = "";
  programs.forEach(p => {
    const option = document.createElement("option");
    option.value = `${p.program} · TOP ${p.top}`;
    els.awardsProgramOptions.appendChild(option);
  });

  const types = [...new Set(parsed.records.map(r => r.awardType).filter(Boolean))].sort();
  els.awardsType.innerHTML = '<option value="">All award types</option>';
  types.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    els.awardsType.appendChild(option);
  });

  const colleges = [...new Set(parsed.records.map(r => r.college).filter(Boolean))].sort();
  state.selectedColleges = new Set(colleges);
  els.awardsCollegeFilters.innerHTML = "";
  colleges.forEach((college, index) => {
    const id = `explore-awards-college-${index}`;
    const label = document.createElement("label");
    label.className = "check-chip";
    label.innerHTML = `<input type="checkbox" id="${id}" checked> <span>${escapeHtml(college)}</span>`;
    label.querySelector("input").addEventListener("change", e => {
      if (e.target.checked) state.selectedColleges.add(college);
      else state.selectedColleges.delete(college);
      renderAwards();
    });
    els.awardsCollegeFilters.appendChild(label);
  });

  const english = programs.find(p => p.top === "150100" || p.program.toLowerCase() === "english");
  els.awardsProgramSearch.value = english ? `${english.program} · TOP ${english.top}` : "";
  renderAwards();
  scrollWorkspace();
}

function awardsPrograms() {
  const map = new Map();
  (state.awards?.records || []).forEach(r => map.set(`${r.program}|${r.top}`, {program:r.program, top:r.top}));
  return [...map.values()].sort((a,b) => a.program.localeCompare(b.program) || a.top.localeCompare(b.top));
}

function awardsProgramQuery() {
  const text = els.awardsProgramSearch.value.trim();
  const topMatch = text.match(/\bTOP\s+(\d{6})\b/i);
  return {text, top:topMatch ? topMatch[1] : "", q:text.replace(/\s+·\s+TOP\s+\d{6}\s*$/i, "").trim().toLowerCase()};
}

function awardsMatchingRecords() {
  const {text, top, q} = awardsProgramQuery();
  const type = els.awardsType.value;
  return (state.awards?.records || []).filter(r => {
    const programMatch = !text || (top ? r.top === top : r.program.toLowerCase().includes(q) || r.top.includes(q));
    const typeMatch = !type || r.awardType === type;
    return programMatch && typeMatch && state.selectedColleges.has(r.college);
  });
}

function renderAwards() {
  if (!state.awards) return;
  const records = awardsMatchingRecords();
  const grouped = new Map();
  records.forEach(r => grouped.set(r.college, (grouped.get(r.college) || 0) + r.count));
  const rows = [...grouped.entries()].map(([college,count]) => ({college,count})).sort((a,b) => b.count - a.count || a.college.localeCompare(b.college));
  const query = awardsProgramQuery();
  const label = query.text || "All programs";
  const total = rows.reduce((sum,row) => sum + row.count, 0);

  els.awardsResultsTitle.textContent = label;
  els.awardsResultMeta.textContent = `${rows.length} college${rows.length === 1 ? "" : "s"} · ${total.toLocaleString()} award${total === 1 ? "" : "s"} in the selected filters`;
  els.awardsResultsBody.innerHTML = "";
  if (!rows.length) {
    els.awardsResultsBody.innerHTML = '<tr><td colspan="2">No matching award records. Try a program name or TOP code from the suggestions.</td></tr>';
  } else {
    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<th scope="row">${escapeHtml(row.college)}</th><td>${formatInteger(row.count)}</td>`;
      els.awardsResultsBody.appendChild(tr);
    });
  }
  renderBarRows(els.awardsBarChart, rows.map(r => ({label:r.college, value:r.count})), {format:"integer"});

  const method = [
    "Source: California Community Colleges Chancellor's Office Data Mart: Program Awards Summary Report",
    `File: ${state.sourceName}`,
    `Period: ${state.awards.period || "Not detected"}`,
    `Geography: ${state.awards.district || "Not detected"}; ${rows.length} selected college${rows.length === 1 ? "" : "s"}`,
    `Program filter: ${label}`,
    `Award type: ${els.awardsType.value || "All award types"}`,
    "Measure: Award Count, not unique graduates",
    `Selected awards: ${formatInteger(total)}`,
    "Caution: One student can receive more than one award. Do not describe this count as unique graduates."
  ].join("\n");
  els.awardsMethodText.textContent = method;
}

function initSuccess() {
  els.exploreWorkspace.hidden = false;
  els.successModule.hidden = false;
  const parsed = state.success;
  fillSummary(els.successFileSummary, [
    ["Report", parsed.reportTitle || "Enrollment Retention and Success Rate"],
    ["Term", parsed.period || "Not detected"],
    ["College", parsed.college || "Not detected"],
    ["TOP rows", parsed.records.length.toLocaleString()]
  ]);

  const programs = successPrograms();
  els.successProgramOptions.innerHTML = "";
  programs.forEach(p => {
    const option = document.createElement("option");
    option.value = `${p.program} · TOP ${p.top}`;
    els.successProgramOptions.appendChild(option);
  });

  els.successPopulation.innerHTML = "";
  (parsed.populations || []).forEach(pop => {
    const option = document.createElement("option");
    option.value = pop;
    option.textContent = pop;
    els.successPopulation.appendChild(option);
  });
  if ([...els.successPopulation.options].some(o => o.value === "Credit")) els.successPopulation.value = "Credit";

  const english = programs.find(p => p.top === "150100" || p.program.toLowerCase() === "english");
  els.successProgramSearch.value = english ? `${english.program} · TOP ${english.top}` : "";
  els.successChartMeasure.value = "successRate";
  renderSuccess();
  scrollWorkspace();
}

function successPrograms() {
  const map = new Map();
  (state.success?.records || []).forEach(r => map.set(`${r.program}|${r.top}`, {program:r.program, top:r.top}));
  return [...map.values()].sort((a,b) => a.program.localeCompare(b.program) || a.top.localeCompare(b.top));
}

function successProgramQuery() {
  const text = els.successProgramSearch.value.trim();
  const topMatch = text.match(/\bTOP\s+(\d{6})\b/i);
  return {text, top:topMatch ? topMatch[1] : "", q:text.replace(/\s+·\s+TOP\s+\d{6}\s*$/i, "").trim().toLowerCase()};
}

function successMatchingRecords() {
  const {text, top, q} = successProgramQuery();
  return (state.success?.records || []).filter(r => !text || (top ? r.top === top : r.program.toLowerCase().includes(q) || r.top.includes(q)));
}

function aggregateSuccess() {
  const population = els.successPopulation.value;
  const records = successMatchingRecords();
  const grouped = new Map();

  records.forEach(record => {
    const m = record.measures?.[population];
    if (!m || m.enrollment === null || m.enrollment === undefined) return;
    if (!grouped.has(record.modality)) grouped.set(record.modality, {modality:record.modality,enrollment:0,retention:0,success:0});
    const row = grouped.get(record.modality);
    row.enrollment += Number(m.enrollment || 0);
    row.retention += Number(m.retention || 0);
    row.success += Number(m.success || 0);
  });

  const rows = [...grouped.values()].map(row => ({
    ...row,
    retentionRate:row.enrollment ? row.retention / row.enrollment : null,
    successRate:row.enrollment ? row.success / row.enrollment : null
  })).sort((a,b) => b.enrollment - a.enrollment || a.modality.localeCompare(b.modality));

  const overall = rows.reduce((acc,row) => {
    acc.enrollment += row.enrollment;
    acc.retention += row.retention;
    acc.success += row.success;
    return acc;
  }, {enrollment:0,retention:0,success:0});
  overall.retentionRate = overall.enrollment ? overall.retention / overall.enrollment : null;
  overall.successRate = overall.enrollment ? overall.success / overall.enrollment : null;
  return {rows, overall, records, population};
}

function renderSuccess() {
  if (!state.success) return;
  const {rows, overall, records, population} = aggregateSuccess();
  const query = successProgramQuery();
  const label = query.text || "All six-digit TOP areas";
  els.successResultsTitle.textContent = label;
  els.successResultMeta.textContent = `${state.success.college || "College not detected"} · ${state.success.period || "Term not detected"} · ${population}`;

  fillSummary(els.successKpis, [
    ["Enrollments", formatInteger(overall.enrollment)],
    ["Successful", formatInteger(overall.success)],
    ["Success rate", formatPercent(overall.successRate)],
    ["Retention rate", formatPercent(overall.retentionRate)]
  ]);

  const smallRows = rows.filter(row => row.enrollment > 0 && row.enrollment < 30);
  if (smallRows.length) {
    els.successSmallN.hidden = false;
    els.successSmallN.innerHTML = `<strong>Small comparison group.</strong> ${smallRows.map(r => `${escapeHtml(r.modality)} (${formatInteger(r.enrollment)} enrollments)`).join(", ")} ${smallRows.length === 1 ? "is" : "are"} below 30 enrollments. Data Mart Smart flags this for context. It is not a CCCCO suppression rule.`;
  } else {
    els.successSmallN.hidden = true;
    els.successSmallN.textContent = "";
  }

  const measure = els.successChartMeasure.value;
  const chartRows = rows.map(row => ({label:row.modality, value:row[measure]}));
  const isRate = measure === "successRate" || measure === "retentionRate";
  renderBarRows(els.successBarChart, chartRows, {format:isRate ? "percent" : "integer", fixedMax:isRate ? 1 : null});

  els.successResultsBody.innerHTML = "";
  if (!rows.length) {
    els.successResultsBody.innerHTML = '<tr><td colspan="6">No matching rows for this program and course population.</td></tr>';
  } else {
    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <th scope="row">${escapeHtml(row.modality)}</th>
        <td class="numeric">${formatInteger(row.enrollment)}</td>
        <td class="numeric">${formatInteger(row.retention)}</td>
        <td class="numeric">${formatPercent(row.retentionRate)}</td>
        <td class="numeric">${formatInteger(row.success)}</td>
        <td class="numeric">${formatPercent(row.successRate)}</td>`;
      els.successResultsBody.appendChild(tr);
    });
  }

  const topCodes = [...new Set(records.map(r => r.top))];
  const topNote = topCodes.length === 1 ? `TOP ${topCodes[0]}` : `${topCodes.length} matching six-digit TOP codes`;
  const smallNote = smallRows.length ? ` Display note: ${smallRows.length} modality group${smallRows.length === 1 ? "" : "s"} below 30 enrollments flagged for context; this is not a CCCCO suppression rule.` : "";
  const method = [
    "Source: California Community Colleges Chancellor's Office Data Mart: Credit Course Retention/Success Rate Summary Report",
    `File: ${state.sourceName}`,
    `Term: ${state.success.period || "Not detected"}`,
    `College: ${state.success.college || "Not detected"}`,
    `Program filter: ${label} (${topNote})`,
    `Course population: ${population}`,
    `Enrollment count: ${formatInteger(overall.enrollment)}`,
    `Retention count and rate: ${formatInteger(overall.retention)}; ${formatPercent(overall.retentionRate)}`,
    `Success count and rate: ${formatInteger(overall.success)}; ${formatPercent(overall.successRate)}`,
    "Calculation: When modality rows are combined, Data Mart Smart sums the counts and recalculates each rate from the combined denominator. It does not average percentages.",
    `Caution: These are grade-defined enrollment outcomes, not unique students.${smallNote}`
  ].join("\n");
  els.successMethodText.textContent = method;
}

function renderBarRows(container, rows, options={}) {
  container.innerHTML = "";
  const valid = rows.filter(row => Number.isFinite(row.value));
  if (!valid.length) return;
  const max = options.fixedMax || Math.max(...valid.map(row => row.value), 1);
  valid.forEach(row => {
    const width = Math.max(2, Math.min(100, (row.value / max) * 100));
    const value = options.format === "percent" ? formatPercent(row.value) : formatInteger(row.value);
    const item = document.createElement("div");
    item.className = "bar-row explorer-bar-row";
    item.innerHTML = `
      <div class="bar-label">${escapeHtml(row.label)}</div>
      <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${width}%"></div></div>
      <div class="bar-value">${value}</div>`;
    container.appendChild(item);
  });
}


function initExploreGrade() {
  els.exploreWorkspace.hidden = false;
  els.gradeModule.hidden = false;
  const parsed = state.grade;
  fillSummary(els.exploreGradeFileSummary, [
    ["Report", parsed.reportTitle || "Grades Distribution Summary Report"],
    ["Term", parsed.period || "Not detected"],
    ["College", parsed.college || "Not detected"],
    ["TOP areas", exploreGradePrograms().length.toLocaleString()]
  ]);
  els.exploreGradeProgramOptions.innerHTML = "";
  const programs = exploreGradePrograms();
  programs.forEach(p => {
    const option = document.createElement("option");
    option.value = `${p.program} · TOP ${p.top}`;
    els.exploreGradeProgramOptions.appendChild(option);
  });
  const english = programs.find(p => p.top === "150100" || p.program.toLowerCase() === "english");
  els.exploreGradeProgramSearch.value = english ? `${english.program} · TOP ${english.top}` : (programs[0] ? `${programs[0].program} · TOP ${programs[0].top}` : "");
  els.exploreGradeMeasure.value = "percent";
  renderExploreGrade();
  scrollWorkspace();
}

function exploreGradePrograms() {
  const map = new Map();
  (state.grade?.records || []).forEach(r => map.set(`${r.program}|${r.top}`, {program:r.program, top:r.top}));
  return [...map.values()].sort((a,b) => a.program.localeCompare(b.program) || a.top.localeCompare(b.top));
}

function exploreGradeProgramQuery() {
  const text = els.exploreGradeProgramSearch.value.trim();
  const topMatch = text.match(/\bTOP\s+(\d{6})\b/i);
  return {text, top:topMatch ? topMatch[1] : "", q:text.replace(/\s+·\s+TOP\s+\d{6}\s*$/i, "").trim().toLowerCase()};
}

function aggregateExploreGrade() {
  const {text, top, q} = exploreGradeProgramQuery();
  const records = (state.grade?.records || []).filter(r => !text || (top ? r.top === top : r.program.toLowerCase().includes(q) || r.top.includes(q)));
  const grouped = new Map();
  records.forEach(record => grouped.set(record.grade, (grouped.get(record.grade) || 0) + Number(record.count || 0)));
  const total = [...grouped.values()].reduce((sum,n) => sum + n, 0);
  const orderIndex = label => {
    const i = EXPLORE_GRADE_ORDER.indexOf(label);
    return i >= 0 ? i : EXPLORE_GRADE_ORDER.length;
  };
  const rows = [...grouped.entries()].map(([grade,count]) => ({grade,count,percent:total ? count/total : null})).sort((a,b) => orderIndex(a.grade)-orderIndex(b.grade) || a.grade.localeCompare(b.grade));
  return {records,rows,total};
}

function renderExploreGrade() {
  if (!state.grade) return;
  const {records,rows,total} = aggregateExploreGrade();
  const query = exploreGradeProgramQuery();
  const label = query.text || "All six-digit TOP areas";
  els.exploreGradeResultsTitle.textContent = label;
  els.exploreGradeResultMeta.textContent = `${state.grade.college || "College not detected"} · ${state.grade.period || "Term not detected"} · ${formatInteger(total)} reported grade records`;
  const byName = Object.fromEntries(rows.map(r => [r.grade,r.count]));
  const blankCount = byName["Unlabeled / blank category"] || 0;
  fillSummary(els.exploreGradeKpis, [["Grade records",formatInteger(total)],["Categories",rows.length.toLocaleString()],["Withdrew",formatInteger(byName["Withdrew"]||0)],["Excused withdrawal",formatInteger(byName["Excused Withdrawal"]||0)]]);
  if (blankCount) {
    els.exploreGradeWarning.hidden = false;
    els.exploreGradeWarning.innerHTML = `<strong>Blank grade label preserved.</strong> ${formatInteger(blankCount)} selected record${blankCount === 1 ? "" : "s"} had no visible grade-category label in the export. Data Mart Smart keeps ${blankCount === 1 ? "it" : "them"} instead of silently dropping ${blankCount === 1 ? "it" : "them"}.`;
  } else {
    els.exploreGradeWarning.hidden = true;
    els.exploreGradeWarning.textContent = "";
  }
  const measure = els.exploreGradeMeasure.value;
  renderBarRows(els.exploreGradeBarChart, rows.map(r => ({label:r.grade,value:measure === "percent" ? r.percent : r.count})), {format:measure === "percent" ? "percent" : "integer", fixedMax:measure === "percent" ? 1 : null});
  els.exploreGradeResultsBody.innerHTML = "";
  if (!rows.length) els.exploreGradeResultsBody.innerHTML = '<tr><td colspan="3">No matching grade rows. Try a program name or TOP code from the suggestions.</td></tr>';
  else rows.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<th scope="row">${escapeHtml(row.grade)}</th><td class="numeric">${formatInteger(row.count)}</td><td class="numeric">${formatPercent(row.percent)}</td>`;
    els.exploreGradeResultsBody.appendChild(tr);
  });
  const selectedPrograms = [...new Map(records.map(r => [`${r.program}|${r.top}`, {program:r.program,top:r.top}])).values()];
  const topNote = selectedPrograms.length === 1 ? `TOP ${selectedPrograms[0].top}` : `${selectedPrograms.length} matching six-digit TOP areas`;
  els.exploreGradeMethodText.textContent = [
    "Source: California Community Colleges Chancellor's Office Data Mart: Grades Distribution Summary Report",
    `File: ${state.sourceName}`,
    `Term: ${state.grade.period || "Not detected"}`,
    `College: ${state.grade.college || "Not detected"}`,
    `Program filter: ${label} (${topNote})`,
    "Measure: Credit Grade Count and share of selected grade records",
    `Selected grade records: ${formatInteger(total)}`,
    blankCount ? `Data quality note: ${formatInteger(blankCount)} selected record${blankCount === 1 ? "" : "s"} had a blank grade-category label and ${blankCount === 1 ? "was" : "were"} preserved as Unlabeled / blank category.` : "Data quality note: No blank grade-category labels were present in the selected rows.",
    "Caution: Grade Distribution shows grade composition. Use the CCCCO Enrollment Retention and Success Rate report when you need the Chancellor's Office success or retention measures."
  ].join("\n");
}

function downloadExploreGradeCsv() {
  const {rows,total} = aggregateExploreGrade();
  if (!rows.length) return setStatus("There are no matching grade rows to download.", "error");
  downloadCsvFile("data-mart-smart-grade-distribution.csv", [["Grade Category","Count","Percent"], ...rows.map(r => [r.grade,r.count,decimalPercent(r.percent)]), ["Total",total,"100.00%"]]);
  setStatus("Grade Distribution CSV downloaded.", "success");
}

function showUnsupported(kind, label) {
  els.exploreWorkspace.hidden = false;
  els.unsupportedModule.hidden = false;
  const info = {
    "student-headcount": {title:"Student Headcount is recognized", text:"The file structure is recognized. The next module will turn the nested headcount, gender, age, ethnicity, and status hierarchy into clearer demographic views.", href:"student-headcount.html", link:"Open the Student Headcount guide"},
    "course-details": {title:"Course Details is recognized", text:"The file structure is recognized. The planned module will support course search, six-digit TOP, transferability, credit status, units, and reported section counts.", href:"reports.html", link:"Browse the course guides"},
    "credit-course-sections": {title:"Credit Courses/Sections is recognized", text:"The file structure is recognized. The planned module will visualize sections, enrollments, FTES, TOP areas, and college or term comparisons when those dimensions are present in the export.", href:"sections-across-colleges.html", link:"Open the section comparison guide"},
    "unknown": {title:"This export was not recognized yet", text:"The file does not match one of the Data Mart layouts currently known to Explore Data. Keep the original export and use the report guides to confirm which report produced it.", href:"reports.html", link:"Browse How-To Guides"}
  }[kind] || {title:`${label} is recognized`, text:"This report does not have a visualization module yet.", href:"reports.html", link:"Browse How-To Guides"};

  els.unsupportedTitle.textContent = info.title;
  els.unsupportedText.textContent = info.text;
  els.unsupportedGuideLink.href = info.href;
  els.unsupportedGuideLink.textContent = info.link;
  scrollWorkspace();
}

function fillSummary(container, items) {
  container.innerHTML = "";
  items.forEach(([label,value]) => {
    const div = document.createElement("div");
    div.className = "viewer-stat";
    div.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
    container.appendChild(div);
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Method copied to the clipboard.", "success");
  } catch {
    setStatus("Your browser blocked automatic copying. Select and copy the method text manually.", "error");
  }
}

function downloadAwardsCsv() {
  const records = awardsMatchingRecords();
  const grouped = new Map();
  records.forEach(r => grouped.set(r.college, (grouped.get(r.college) || 0) + r.count));
  const rows = [...grouped.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (!rows.length) return setStatus("There are no matching award rows to download.", "error");
  downloadCsvFile("data-mart-smart-program-awards.csv", [["College","Award Count"], ...rows]);
  setStatus("Program Awards comparison CSV downloaded.", "success");
}

function downloadSuccessCsv() {
  const {rows, overall, population} = aggregateSuccess();
  if (!rows.length) return setStatus("There are no matching success and retention rows to download.", "error");
  const data = [
    ["Modality","Enrollment Count","Retention Count","Retention Rate","Success Count","Success Rate","Course Population"],
    ...rows.map(r => [r.modality,r.enrollment,r.retention,decimalPercent(r.retentionRate),r.success,decimalPercent(r.successRate),population]),
    ["Overall",overall.enrollment,overall.retention,decimalPercent(overall.retentionRate),overall.success,decimalPercent(overall.successRate),population]
  ];
  downloadCsvFile("data-mart-smart-success-retention.csv", data);
  setStatus("Success and Retention CSV downloaded.", "success");
}

function downloadCsvFile(filename, rows) {
  const csv = rows.map(row => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function decimalPercent(value) {
  return Number.isFinite(value) ? (value * 100).toFixed(1) + "%" : "";
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "Not available";
}

function formatInteger(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)).toLocaleString() : "Not available";
}

function scrollWorkspace() {
  els.exploreWorkspace.scrollIntoView({behavior:preferredScrollBehavior(), block:"start"});
}

function resetExplorer() {
  state.sourceName = "";
  state.kind = "";
  state.awards = null;
  state.success = null;
  state.selectedColleges = new Set();
  els.exploreFileInput.value = "";
  els.detectedReport.hidden = true;
  hideModules();
  setStatus("Ready. Choose a Data Mart Excel or CSV export, or try a demo.", "neutral");
  window.scrollTo({top:0, behavior:preferredScrollBehavior()});
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}
