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
  headcount:null,
  courseDetails:null,
  creditSections:null,
  generic:null,
  selectedColleges:new Set()
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  [
    "exploreFileInput","exploreDropZone","exploreBrowseButton","demoReportSelect","demoLoadButton","exploreStatus",
    "detectedReport","detectedReportName","detectedReportNote","exploreWorkspace","awardsModule","successModule","gradeModule","headcountModule","courseDetailsModule","creditSectionsModule","genericModule","unsupportedModule",
    "unsupportedTitle","unsupportedText","unsupportedGuideLink",
    "genericFileSummary","genericLabelColumn","genericMeasureColumn","genericSort","genericChartLimit","genericResultsTitle","genericResultMeta","genericWarning","genericBarChart","genericLabelHeader","genericMeasureHeader","genericResultsBody","genericMethodText","genericCopyMethod","genericDownloadCsv",
    "awardsFileSummary","awardsProgramSearch","awardsProgramOptions","awardsType","awardsCollegeFilters","awardsResultsTitle",
    "awardsResultMeta","awardsResultsBody","awardsBarChart","awardsMethodText","awardsCopyMethod","awardsDownloadCsv",
    "successFileSummary","successProgramSearch","successProgramOptions","successPopulation","successChartMeasure","successResultsTitle",
    "successResultMeta","successKpis","successSmallN","successBarChart","successResultsBody","successMethodText","successCopyMethod","successDownloadCsv",
    "exploreGradeFileSummary","exploreGradeProgramSearch","exploreGradeProgramOptions","exploreGradeMeasure","exploreGradeResultsTitle","exploreGradeResultMeta","exploreGradeKpis","exploreGradeWarning","exploreGradeBarChart","exploreGradeResultsBody","exploreGradeMethodText","exploreGradeCopyMethod","exploreGradeDownloadCsv",
    "headcountFileSummary","headcountBreakdown","headcountStatusFilter","headcountGenderFilter","headcountAgeFilter","headcountEthnicityFilter","headcountMeasure","headcountResultsTitle","headcountResultMeta","headcountKpis","headcountWarning","headcountBarChart","headcountCategoryHeader","headcountResultsBody","headcountMethodText","headcountCopyMethod","headcountDownloadCsv",
    "courseFileSummary","courseSearch","courseCreditFilter","courseTransferFilter","courseSamFilter","courseTableLimit","courseResultsTitle","courseResultMeta","courseKpis","courseBarChart","courseChartNote","courseResultsBody","courseMethodText","courseCopyMethod","courseDownloadCsv",
    "creditSectionsFileSummary","creditSectionsMeasure","creditSectionsResultsTitle","creditSectionsResultMeta","creditSectionsKpis","creditSectionsWarning","creditSectionsBarChart","creditSectionsResultsBody","creditSectionsMethodText","creditSectionsCopyMethod","creditSectionsDownloadCsv",
    "withinFileCompare","withinFileCompareIntro","withinCompareDimension","withinCompareContextWrap","withinCompareContextLabel","withinCompareContext","withinCompareExtraWrap","withinCompareExtraLabel","withinCompareExtra","withinCompareMeasure","withinCompareChoicesLegend","withinCompareChoices","withinCompareAvailability","withinCompareTitle","withinCompareMeta","withinCompareCaution","withinCompareChart","withinCompareCaption","withinCompareLabelHeader","withinCompareValueHeader","withinCompareBody"
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

  els.demoLoadButton.addEventListener("click", loadSelectedDemo);
  [els.withinCompareDimension, els.withinCompareContext, els.withinCompareExtra, els.withinCompareMeasure].forEach(control => control.addEventListener("change", () => {
    if (control === els.withinCompareDimension) setupWithinFileCompareControls();
    else renderWithinFileCompare();
  }));
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

  [els.headcountBreakdown,els.headcountStatusFilter,els.headcountGenderFilter,els.headcountAgeFilter,els.headcountEthnicityFilter,els.headcountMeasure].forEach(control => control.addEventListener("change", renderHeadcount));
  els.headcountCopyMethod.addEventListener("click", () => copyText(els.headcountMethodText.textContent));
  els.headcountDownloadCsv.addEventListener("click", downloadHeadcountCsv);

  [els.courseSearch,els.courseCreditFilter,els.courseTransferFilter,els.courseSamFilter,els.courseTableLimit].forEach(control => {
    control.addEventListener(control === els.courseSearch ? "input" : "change", renderCourseDetails);
  });
  els.courseCopyMethod.addEventListener("click", () => copyText(els.courseMethodText.textContent));
  els.courseDownloadCsv.addEventListener("click", downloadCourseDetailsCsv);

  els.creditSectionsMeasure.addEventListener("change", renderCreditSections);
  els.creditSectionsCopyMethod.addEventListener("click", () => copyText(els.creditSectionsMethodText.textContent));
  els.creditSectionsDownloadCsv.addEventListener("click", downloadCreditSectionsCsv);
  [els.genericLabelColumn,els.genericMeasureColumn,els.genericSort,els.genericChartLimit].forEach(control => control.addEventListener("change", renderGeneric));
  els.genericCopyMethod.addEventListener("click", () => copyText(els.genericMethodText.textContent));
  els.genericDownloadCsv.addEventListener("click", downloadGenericCsv);

  setStatus("Ready. Choose an Excel or CSV export, or try a sample.", "neutral");
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
    setStatus("Please choose an Excel .xlsx, .xls, or CSV file.", "error");
    return;
  }
  if (typeof XLSX === "undefined" || typeof DataMartParsers === "undefined") {
    setStatus("The spreadsheet reader did not load. Check your internet connection and reload the page.", "error");
    return;
  }

  setStatus(`Reading ${file.name} in your browser...`, "neutral");
  try {
    const {rows} = await DataMartFileSecurity.readRows(file, {allowCsv:true, defval:null});
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
      initWithinFileCompare("program-awards", parsed);
      setStatus(`Loaded ${parsed.records.length.toLocaleString()} program-award rows from ${file.name}. The file stayed in this browser tab.`, "success");
      return;
    }

    if (detected.kind === "retention-success") {
      const parsed = DataMartParsers.parseRetentionSuccess(rows);
      if (!parsed.records.length) throw new Error("The report was recognized, but no six-digit TOP outcome rows could be read from the current layout.");
      state.success = parsed;
      showDetected("Success & Retention detected", `${parsed.college || "College not detected"}, ${parsed.period || "period not detected"}. The working outcomes module is ready.`, true);
      initSuccess();
      initWithinFileCompare("retention-success", parsed);
      setStatus(`Loaded ${parsed.records.length.toLocaleString()} six-digit TOP outcome rows from ${file.name}. The file stayed in this browser tab.`, "success");
      return;
    }

    if (detected.kind === "grade-distribution") {
      const parsed = DataMartParsers.parseGradeDistribution(rows);
      if (!parsed.records.length) throw new Error("The report was recognized, but no six-digit TOP grade rows could be read from the current layout.");
      state.grade = parsed;
      showDetected("Grade Distribution detected", `${parsed.college || "College not detected"}, ${parsed.period || "period not detected"}. The grade composition module is ready.`, true);
      initExploreGrade();
      initWithinFileCompare("grade-distribution", parsed);
      setStatus(`Loaded ${parsed.records.length.toLocaleString()} grade-category rows from ${file.name}. The file stayed in this browser tab.`, "success");
      return;
    }

    if (detected.kind === "student-headcount") {
      const parsed = DataMartParsers.parseStudentHeadcount(rows);
      if (!parsed.records.length) throw new Error("The report was recognized, but no detailed headcount rows could be read from the current layout.");
      state.headcount = parsed;
      showDetected("Student Headcount detected", `${parsed.college || "College not detected"}, ${parsed.period || "period not detected"}. The demographic explorer is ready.`, true);
      initHeadcount();
      setStatus(`Loaded ${parsed.records.length.toLocaleString()} detailed headcount rows from ${file.name}. The file stayed in this browser tab.`, "success");
      return;
    }

    if (detected.kind === "course-details") {
      const parsed = DataMartParsers.parseCourseDetails(rows);
      if (!parsed.records.length) throw new Error("The report was recognized, but no course rows could be read from the current layout.");
      state.courseDetails = parsed;
      showDetected("Course Details detected", `${parsed.college || "College not detected"}, ${parsed.period || "period not detected"}. The course explorer is ready.`, true);
      initCourseDetails();
      initWithinFileCompare("course-details", parsed);
      setStatus(`Loaded ${parsed.records.length.toLocaleString()} course rows from ${file.name}. The file stayed in this browser tab.`, "success");
      return;
    }

    if (detected.kind === "credit-course-sections") {
      const parsed = DataMartParsers.parseCreditCourseSections(rows);
      if (!parsed.records.length) throw new Error("The report was recognized, but no course activity rows could be read from the current layout.");
      state.creditSections = parsed;
      showDetected("Credit Courses/Sections detected", `${parsed.period || "Period not detected"}. The course activity summary is ready.`, true);
      initCreditSections();
      setStatus(`Loaded ${parsed.records.length.toLocaleString()} course activity row${parsed.records.length === 1 ? "" : "s"} from ${file.name}. The file stayed in this browser tab.`, "success");
      return;
    }

    const generic = DataMartParsers.parseGenericTable(rows);
    if (generic.rows.length && generic.numericColumns.length) {
      state.kind = "generic-table";
      state.generic = generic;
      showDetected("Basic table view ready", `${generic.reportTitle || "Tabular export"}${generic.period ? `, ${generic.period}` : ""}. Choose the columns you want to visualize.`, true);
      initGeneric();
      setStatus(`Loaded ${generic.rows.length.toLocaleString()} table rows from ${file.name}. Report-specific definitions are not inferred in the basic table view.`, "success");
      return;
    }
    showDetected("Export opened, but no chartable table was detected", "The file did not contain a usable tabular layout with a numeric measure that the Flexible Explorer could identify.", false);
    showUnsupported("unknown", detected.label);
    setStatus("The file opened, but a usable table could not be detected automatically.", "error");
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
  initWithinFileCompare("program-awards", state.awards);
  setStatus("Program Awards demo loaded. The demo uses English award records from the earlier LACCD export.", "success");
}

function loadSuccessDemo() {
  state.sourceName = "Included English Success & Retention demo";
  state.kind = "retention-success";
  state.success = JSON.parse(JSON.stringify(SUCCESS_DEMO));
  hideModules();
  showDetected("Success & Retention demo loaded", "LA Mission, Fall 2025. The working outcomes module is ready.", true);
  initSuccess();
  initWithinFileCompare("retention-success", state.success);
  setStatus("Success & Retention demo loaded. The demo uses English TOP 150100 records from the supplied LA Mission Fall 2025 export.", "success");
}

function loadGradeDemo() {
  state.sourceName = "Included English Grade Distribution demo";
  state.kind = "grade-distribution";
  state.grade = JSON.parse(JSON.stringify(EXPLORE_GRADE_DEMO));
  hideModules();
  showDetected("Grade Distribution demo loaded", "LA Mission, Fall 2025. The grade composition module is ready.", true);
  initExploreGrade();
  initWithinFileCompare("grade-distribution", state.grade);
  setStatus("Grade Distribution demo loaded. The demo uses English TOP 150100 records from the supplied LA Mission Fall 2025 export.", "success");
}


function loadSelectedDemo() {
  const kind = els.demoReportSelect.value;
  if (kind === "program-awards") return loadAwardsDemo();
  if (kind === "retention-success") return loadSuccessDemo();
  if (kind === "grade-distribution") return loadGradeDemo();
  if (!window.DMS_DEMOS) return setStatus("The sample data did not load. Reload the page and try again.", "error");

  hideModules();
  if (kind === "student-headcount") {
    state.sourceName = "Included LA Mission Student Headcount sample";
    state.kind = kind;
    state.headcount = JSON.parse(JSON.stringify(window.DMS_DEMOS.headcount));
    showDetected("Student Headcount sample loaded", "LA Mission, Fall 2025. The demographic explorer is ready.", true);
    initHeadcount();
    setStatus("Student Headcount sample loaded from the supplied LA Mission Fall 2025 export.", "success");
    return;
  }
  if (kind === "course-details") {
    state.sourceName = "Included LA Mission English Course Details sample";
    state.kind = kind;
    state.courseDetails = JSON.parse(JSON.stringify(window.DMS_DEMOS.courseDetails));
    showDetected("Course Details sample loaded", "LA Mission, Fall 2025. The course explorer is ready.", true);
    initCourseDetails();
    initWithinFileCompare("course-details", state.courseDetails);
    setStatus("Course Details sample loaded. It uses English course rows from the supplied LA Mission Fall 2025 export.", "success");
    return;
  }
  if (kind === "credit-course-sections") {
    state.sourceName = "Included LA Mission Credit Courses/Sections sample";
    state.kind = kind;
    state.creditSections = JSON.parse(JSON.stringify(window.DMS_DEMOS.creditSections));
    showDetected("Credit Courses/Sections sample loaded", "LA Mission, Fall 2025. The summary module is ready.", true);
    initCreditSections();
    setStatus("Credit Courses/Sections sample loaded from the supplied LA Mission Fall 2025 export.", "success");
  }
}

function hideModules() {
  els.exploreWorkspace.hidden = true;
  if (els.withinFileCompare) { els.withinFileCompare.hidden = true; els.withinFileCompare.open = false; }
  els.awardsModule.hidden = true;
  els.successModule.hidden = true;
  els.gradeModule.hidden = true;
  els.headcountModule.hidden = true;
  els.courseDetailsModule.hidden = true;
  els.creditSectionsModule.hidden = true;
  els.genericModule.hidden = true;
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
    ["Course enrollments", formatInteger(overall.enrollment)],
    ["Successful enrollments", formatInteger(overall.success)],
    ["Course success", formatPercent(overall.successRate)],
    ["Course retention", formatPercent(overall.retentionRate)]
  ]);

  const smallRows = rows.filter(row => row.enrollment > 0 && row.enrollment < 30);
  if (smallRows.length) {
    els.successSmallN.hidden = false;
    els.successSmallN.innerHTML = `<strong>Small comparison group.</strong> ${smallRows.map(r => `${escapeHtml(r.modality)} (${formatInteger(r.enrollment)} enrollments)`).join(", ")} ${smallRows.length === 1 ? "is" : "are"} below 30 enrollments. CCC Data Smart flags this for context. It is not a CCCCO suppression rule.`;
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
    "Calculation: When modality rows are combined, CCC Data Smart sums the counts and recalculates each rate from the combined denominator. It does not average percentages.",
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
    const value = options.format === "percent" ? formatPercent(row.value) : options.format === "decimal" ? formatDecimal(row.value) : formatInteger(row.value);
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
    els.exploreGradeWarning.innerHTML = `<strong>Blank grade label preserved.</strong> ${formatInteger(blankCount)} selected record${blankCount === 1 ? "" : "s"} had no visible grade-category label in the export. CCC Data Smart keeps ${blankCount === 1 ? "it" : "them"} instead of silently dropping ${blankCount === 1 ? "it" : "them"}.`;
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
  downloadCsvFile("ccc-data-smart-grade-distribution.csv", [["Grade Category","Count","Percent"], ...rows.map(r => [r.grade,r.count,decimalPercent(r.percent)]), ["Total",total,"100.00%"]]);
  setStatus("Grade Distribution CSV downloaded.", "success");
}


function initHeadcount() {
  els.exploreWorkspace.hidden = false;
  els.headcountModule.hidden = false;
  const parsed = state.headcount;
  fillSummary(els.headcountFileSummary, [
    ["Report", parsed.reportTitle || "Student Headcount Summary Report"],
    ["Term", parsed.period || "Not detected"],
    ["College", parsed.college || "Not detected"],
    ["College headcount", formatInteger(parsed.collegeTotal)]
  ]);

  fillSelect(els.headcountStatusFilter, "All headcount statuses", uniqueValues(parsed.records, "status"));
  fillSelect(els.headcountGenderFilter, "All genders", uniqueValues(parsed.records, "gender"));
  fillSelect(els.headcountAgeFilter, "All age groups", orderedAgeValues(parsed.records));
  fillSelect(els.headcountEthnicityFilter, "All ethnicities", uniqueValues(parsed.records, "ethnicity"));
  els.headcountBreakdown.value = "gender";
  els.headcountMeasure.value = "percent";
  renderHeadcount();
  scrollWorkspace();
}

function uniqueValues(records, key) {
  return [...new Set((records || []).map(r => r[key]).filter(Boolean))].sort((a,b) => a.localeCompare(b));
}

function orderedAgeValues(records) {
  const order = ["19 or Less","20 to 24","25 to 29","30 to 34","35 to 39","40 to 49","50 +"];
  const present = new Set((records || []).map(r => r.age).filter(Boolean));
  return order.filter(x => present.has(x)).concat([...present].filter(x => !order.includes(x)).sort());
}

function fillSelect(select, allLabel, values) {
  const current = select.value;
  select.innerHTML = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = allLabel;
  select.appendChild(all);
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
  if ([...select.options].some(option => option.value === current)) select.value = current;
}

function headcountFilteredRecords() {
  return (state.headcount?.records || []).filter(r =>
    (!els.headcountStatusFilter.value || r.status === els.headcountStatusFilter.value) &&
    (!els.headcountGenderFilter.value || r.gender === els.headcountGenderFilter.value) &&
    (!els.headcountAgeFilter.value || r.age === els.headcountAgeFilter.value) &&
    (!els.headcountEthnicityFilter.value || r.ethnicity === els.headcountEthnicityFilter.value)
  );
}

function aggregateHeadcount() {
  const records = headcountFilteredRecords();
  const key = els.headcountBreakdown.value;
  const grouped = new Map();
  records.forEach(r => grouped.set(r[key] || "Unreported", (grouped.get(r[key] || "Unreported") || 0) + Number(r.count || 0)));
  const total = [...grouped.values()].reduce((sum,n) => sum+n, 0);
  let rows = [...grouped.entries()].map(([category,count]) => ({category,count,percent:total ? count/total : null}));
  if (key === "age") {
    const order = ["19 or Less","20 to 24","25 to 29","30 to 34","35 to 39","40 to 49","50 +"];
    rows.sort((a,b) => {
      const ai = order.indexOf(a.category), bi = order.indexOf(b.category);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi) || a.category.localeCompare(b.category);
    });
  } else {
    rows.sort((a,b) => b.count-a.count || a.category.localeCompare(b.category));
  }
  return {records,rows,total,key};
}

function renderHeadcount() {
  if (!state.headcount) return;
  const sameFilter = {
    status: els.headcountStatusFilter,
    gender: els.headcountGenderFilter,
    age: els.headcountAgeFilter,
    ethnicity: els.headcountEthnicityFilter
  };
  Object.entries(sameFilter).forEach(([key,control]) => {
    const isBreakdown = key === els.headcountBreakdown.value;
    if (isBreakdown && control.value) control.value = "";
    control.disabled = isBreakdown;
  });

  const {records,rows,total,key} = aggregateHeadcount();
  const labels = {status:"Headcount status",gender:"Gender",age:"Age group",ethnicity:"Ethnicity"};
  const label = labels[key] || "Category";
  const collegeTotal = Number(state.headcount.collegeTotal || 0);
  const collegeShare = collegeTotal ? total/collegeTotal : null;
  els.headcountResultsTitle.textContent = label;
  els.headcountResultMeta.textContent = `${state.headcount.college || "College not detected"} · ${state.headcount.period || "Term not detected"} · ${formatInteger(total)} selected students`;
  els.headcountCategoryHeader.textContent = label;
  fillSummary(els.headcountKpis, [
    ["Distinct students", formatInteger(total)],
    ["Share of college headcount", formatPercent(collegeShare)],
    ["Categories shown", rows.length.toLocaleString()],
    ["College distinct students", formatInteger(collegeTotal)]
  ]);

  const unknownStatusCount = records.filter(r => /^X\s*-\s*Unknown$/i.test(r.status)).reduce((sum,r) => sum + Number(r.count || 0), 0);
  if (unknownStatusCount > 0 && !els.headcountStatusFilter.value) {
    els.headcountWarning.hidden = false;
    els.headcountWarning.innerHTML = `<strong>Unknown headcount status is included.</strong> ${formatInteger(unknownStatusCount)} selected student${unknownStatusCount === 1 ? "" : "s"} are in the reported X - Unknown headcount-status category. The tool keeps that category visible rather than redistributing it.`;
  } else {
    els.headcountWarning.hidden = true;
    els.headcountWarning.textContent = "";
  }

  const measure = els.headcountMeasure.value;
  renderBarRows(els.headcountBarChart, rows.map(r => ({label:r.category,value:measure === "percent" ? r.percent : r.count})), {format:measure === "percent" ? "percent" : "integer", fixedMax:measure === "percent" ? 1 : null});
  els.headcountResultsBody.innerHTML = "";
  if (!rows.length) {
    els.headcountResultsBody.innerHTML = '<tr><td colspan="3">No students match the selected filters.</td></tr>';
  } else {
    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<th scope="row">${escapeHtml(row.category)}</th><td>${formatInteger(row.count)}</td><td>${formatPercent(row.percent)}</td>`;
      els.headcountResultsBody.appendChild(tr);
    });
  }

  const filters = [
    ["Headcount status",els.headcountStatusFilter.value || "All"],
    ["Gender",els.headcountGenderFilter.value || "All"],
    ["Age group",els.headcountAgeFilter.value || "All"],
    ["Ethnicity",els.headcountEthnicityFilter.value || "All"]
  ].map(([a,b]) => `${a}: ${b}`).join("; ");
  els.headcountMethodText.textContent = [
    "Source: California Community Colleges Chancellor's Office Data Mart: Student Headcount Summary Report",
    `File: ${state.sourceName}`,
    `Term: ${state.headcount.period || "Not detected"}`,
    `College: ${state.headcount.college || "Not detected"}`,
    `Measure: Student Count`,
    `Breakdown: ${label}`,
    `Filters: ${filters}`,
    `Selected students: ${formatInteger(total)}`,
    `College headcount in export: ${formatInteger(collegeTotal)}`,
    "Caution: Student Count is not Enrollment Count. District and statewide distinct-student totals should not be reconstructed by adding college headcounts."
  ].join("\n");
}

function downloadHeadcountCsv() {
  const {rows,total,key} = aggregateHeadcount();
  const labels = {status:"Headcount Status",gender:"Gender",age:"Age Group",ethnicity:"Ethnicity"};
  if (!rows.length) return setStatus("There are no matching headcount rows to download.", "error");
  downloadCsvFile("ccc-data-smart-student-headcount.csv", [[labels[key] || "Category","Student Count","Percent"], ...rows.map(r => [r.category,r.count,decimalPercent(r.percent)]), ["Total",total,"100.0%"]]);
  setStatus("Student Headcount CSV downloaded.", "success");
}

function initCourseDetails() {
  els.exploreWorkspace.hidden = false;
  els.courseDetailsModule.hidden = false;
  const parsed = state.courseDetails;
  fillSummary(els.courseFileSummary, [
    ["Report", parsed.reportTitle || "Course Details Report"],
    ["Term", parsed.period || "Not detected"],
    ["College", parsed.college || "Not detected"],
    ["Course rows", parsed.records.length.toLocaleString()]
  ]);
  fillSelect(els.courseCreditFilter, "All credit statuses", uniqueValues(parsed.records,"creditStatus"));
  fillSelect(els.courseTransferFilter, "All transfer statuses", uniqueValues(parsed.records,"transferStatus"));
  fillSelect(els.courseSamFilter, "All SAM statuses", uniqueValues(parsed.records,"samStatus"));
  els.courseSearch.value = "";
  els.courseTableLimit.value = "50";
  renderCourseDetails();
  scrollWorkspace();
}

function matchingCourseDetails() {
  const rawQ = els.courseSearch.value.trim();
  const q = rawQ.toLowerCase();
  return (state.courseDetails?.records || []).filter(r => {
    const courseId = String(r.courseId || "").toLowerCase();
    let queryMatches = true;
    if (q) {
      if (/^\d{6}$/.test(rawQ)) queryMatches = String(r.top || "") === rawQ;
      else if (/^[A-Za-z]{2,10}$/.test(rawQ)) queryMatches = courseId.startsWith(q);
      else {
        const haystack = [r.courseId,r.title,r.topName,r.top,r.controlNumber].join(" ").toLowerCase();
        queryMatches = haystack.includes(q);
      }
    }
    return queryMatches &&
      (!els.courseCreditFilter.value || r.creditStatus === els.courseCreditFilter.value) &&
      (!els.courseTransferFilter.value || r.transferStatus === els.courseTransferFilter.value) &&
      (!els.courseSamFilter.value || r.samStatus === els.courseSamFilter.value);
  });
}

function renderCourseDetails() {
  if (!state.courseDetails) return;
  const records = matchingCourseDetails();
  const sections = records.reduce((sum,r) => sum + Number(r.sections || 0), 0);
  const topAreas = new Set(records.map(r => r.top).filter(Boolean)).size;
  const transferable = records.filter(r => /Transferable/i.test(r.transferStatus) && !/^Not transferable$/i.test(r.transferStatus)).length;
  els.courseResultsTitle.textContent = els.courseSearch.value.trim() ? `Courses matching "${els.courseSearch.value.trim()}"` : "All matching courses";
  els.courseResultMeta.textContent = `${state.courseDetails.college || "College not detected"} · ${state.courseDetails.period || "Term not detected"} · ${records.length.toLocaleString()} course rows`;
  fillSummary(els.courseKpis, [
    ["Course rows", records.length.toLocaleString()],
    ["Reported sections", formatInteger(sections)],
    ["Six-digit TOP areas", topAreas.toLocaleString()],
    ["Transferable course rows", transferable.toLocaleString()]
  ]);

  const chartRows = records.filter(r => Number(r.sections) > 0).sort((a,b) => Number(b.sections)-Number(a.sections) || a.courseId.localeCompare(b.courseId)).slice(0,15);
  renderBarRows(els.courseBarChart, chartRows.map(r => ({label:r.courseId,value:Number(r.sections)})), {format:"integer"});
  els.courseChartNote.textContent = records.length > 15 ? "The chart shows the 15 matching course rows with the highest reported section counts. The table and downloaded CSV retain the broader selection." : "";

  const limit = els.courseTableLimit.value === "all" ? records.length : Number(els.courseTableLimit.value || 50);
  const shown = records.slice().sort((a,b) => Number(b.sections||0)-Number(a.sections||0) || a.courseId.localeCompare(b.courseId)).slice(0,limit);
  els.courseResultsBody.innerHTML = "";
  if (!shown.length) {
    els.courseResultsBody.innerHTML = '<tr><td colspan="6">No course rows match the selected filters.</td></tr>';
  } else {
    shown.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<th scope="row">${escapeHtml(r.courseId)}</th><td>${escapeHtml(r.title)}</td><td>${escapeHtml(r.topName)}${r.top ? ` · ${escapeHtml(r.top)}` : ""}</td><td>${formatInteger(r.sections)}</td><td>${escapeHtml(r.creditStatus)}</td><td>${escapeHtml(r.transferStatus)}</td>`;
      els.courseResultsBody.appendChild(tr);
    });
  }

  els.courseMethodText.textContent = [
    "Source: California Community Colleges Chancellor's Office Data Mart: Course Details Report",
    `File: ${state.sourceName}`,
    `Term: ${state.courseDetails.period || "Not detected"}`,
    `College: ${state.courseDetails.college || "Not detected"}`,
    `Search: ${els.courseSearch.value.trim() || "None"}`,
    `Credit status: ${els.courseCreditFilter.value || "All"}`,
    `Transfer status: ${els.courseTransferFilter.value || "All"}`,
    `SAM status: ${els.courseSamFilter.value || "All"}`,
    `Matching course rows: ${records.length.toLocaleString()}`,
    `Reported sections across matching rows: ${formatInteger(sections)}`,
    "Caution: Course Details reports MIS section counts. Linked lecture/lab or other paired components may appear as separate reported sections. TOP is a classification and is not the same thing as a local subject prefix."
  ].join("\n");
}

function downloadCourseDetailsCsv() {
  const records = matchingCourseDetails();
  if (!records.length) return setStatus("There are no matching course rows to download.", "error");
  downloadCsvFile("ccc-data-smart-course-details.csv", [
    ["District","College","Term","Course ID","Control Number","Course Title","Sections Count","TOP Name","TOP Code","Credit Status","Transfer Status","Minimum Units","Maximum Units","SAM Status"],
    ...records.map(r => [r.district,r.college,r.term,r.courseId,r.controlNumber,r.title,r.sections,r.topName,r.top,r.creditStatus,r.transferStatus,r.minUnits,r.maxUnits,r.samStatus])
  ]);
  setStatus("Course Details CSV downloaded.", "success");
}

function initCreditSections() {
  els.exploreWorkspace.hidden = false;
  els.creditSectionsModule.hidden = false;
  const parsed = state.creditSections;
  fillSummary(els.creditSectionsFileSummary, [
    ["Report", parsed.reportTitle || "Credit Courses/Sections"],
    ["Term", parsed.period || "Not detected"],
    ["Rows", parsed.records.length.toLocaleString()],
    ["Mode", parsed.records.length === 1 ? "Summary" : "Export rows"]
  ]);
  els.creditSectionsMeasure.value = "sections";
  renderCreditSections();
  scrollWorkspace();
}

function renderCreditSections() {
  if (!state.creditSections) return;
  const records = state.creditSections.records || [];
  const one = records.length === 1 ? records[0] : null;
  els.creditSectionsResultsTitle.textContent = one ? one.label : "Credit Course Activity";
  els.creditSectionsResultMeta.textContent = `${state.creditSections.period || "Term not detected"} · ${records.length.toLocaleString()} export row${records.length === 1 ? "" : "s"}`;
  if (one) {
    fillSummary(els.creditSectionsKpis, [
      ["Credit sections", formatInteger(one.sections)],
      ["Enrollment count", formatInteger(one.enrollment)],
      ["Section FTES", formatDecimal(one.ftes)],
      ["Rows", "1 summary row"]
    ]);
    els.creditSectionsWarning.hidden = true;
  } else {
    fillSummary(els.creditSectionsKpis, [
      ["Export rows", records.length.toLocaleString()],
      ["Measure shown", creditSectionsMeasureLabel()],
      ["Automatic total", "Not calculated"],
      ["Reason", "Rows may overlap"]
    ]);
    els.creditSectionsWarning.hidden = false;
    els.creditSectionsWarning.innerHTML = "<strong>Rows are not automatically added.</strong> A detailed Data Mart export can contain totals, subtotals, or overlapping classifications. CCC Data Smart shows the rows but does not assume that summing them is methodologically valid.";
  }
  const measure = els.creditSectionsMeasure.value;
  renderBarRows(els.creditSectionsBarChart, records.map(r => ({label:r.label,value:Number(r[measure])})).filter(r => Number.isFinite(r.value)), {format:measure === "ftes" ? "decimal" : "integer"});
  els.creditSectionsResultsBody.innerHTML = "";
  records.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<th scope="row">${escapeHtml(r.label)}</th><td>${formatInteger(r.sections)}</td><td>${formatInteger(r.enrollment)}</td><td>${formatDecimal(r.ftes)}</td>`;
    els.creditSectionsResultsBody.appendChild(tr);
  });
  els.creditSectionsMethodText.textContent = [
    "Source: California Community Colleges Chancellor's Office Data Mart: Credit Courses/Sections",
    `File: ${state.sourceName}`,
    `Term: ${state.creditSections.period || "Not detected"}`,
    `Export rows shown: ${records.length.toLocaleString()}`,
    `Chart measure: ${creditSectionsMeasureLabel()}`,
    one ? `Reported summary: ${formatInteger(one.sections)} credit sections; ${formatInteger(one.enrollment)} enrollments; ${formatDecimal(one.ftes)} section FTES.` : "No automatic grand total was calculated because detailed export rows may contain overlapping categories or subtotals.",
    "Caution: Enrollment Count is not Student Count. Reported Section Count may include linked components. Data Mart FTES is not the same methodology as CCFS-320 FTES."
  ].join("\n");
}

function creditSectionsMeasureLabel() {
  return {sections:"Reported sections",enrollment:"Course enrollments",ftes:"Instructional activity (FTES)"}[els.creditSectionsMeasure.value] || "Section count";
}

function downloadCreditSectionsCsv() {
  const records = state.creditSections?.records || [];
  if (!records.length) return setStatus("There are no Credit Courses/Sections rows to download.", "error");
  downloadCsvFile("ccc-data-smart-credit-course-sections.csv", [["Row","Credit Sections Count","Enrollment Count","Credit Sections FTES"], ...records.map(r => [r.label,r.sections,r.enrollment,r.ftes])]);
  setStatus("Credit Courses/Sections CSV downloaded.", "success");
}


function initGeneric() {
  hideModules();
  els.exploreWorkspace.hidden = false;
  els.genericModule.hidden = false;
  const data = state.generic;
  fillSummary(els.genericFileSummary, [
    ["Rows", data.rows.length.toLocaleString()],
    ["Columns", data.columns.length.toLocaleString()],
    ["Numeric fields", data.numericColumns.length.toLocaleString()],
    ["Period", data.period || "Not detected"]
  ]);
  els.genericLabelColumn.innerHTML = "";
  data.labelColumns.forEach(col => {
    const opt = document.createElement("option"); opt.value = String(col.index); opt.textContent = col.name; els.genericLabelColumn.appendChild(opt);
  });
  els.genericMeasureColumn.innerHTML = "";
  data.numericColumns.forEach(col => {
    const opt = document.createElement("option"); opt.value = String(col.index); opt.textContent = col.name; els.genericMeasureColumn.appendChild(opt);
  });
  const preferredLabel = data.labelColumns.find(c => /name|college|district|program|top|classification|gender|ethnicity|age|status|service|year|term|category/i.test(c.name)) || data.labelColumns[0];
  const preferredMeasure = data.numericColumns.find(c => /count|rate|ftes|wage|amount|total|enrollment|award|transfer|percent/i.test(c.name)) || data.numericColumns[0];
  if (preferredLabel) els.genericLabelColumn.value = String(preferredLabel.index);
  if (preferredMeasure) els.genericMeasureColumn.value = String(preferredMeasure.index);
  renderGeneric();
  scrollWorkspace();
}

function genericSelection() {
  const data = state.generic;
  if (!data) return {rows:[], labelCol:null, measureCol:null};
  const labelIndex = Number(els.genericLabelColumn.value);
  const measureIndex = Number(els.genericMeasureColumn.value);
  const labelCol = data.columns.find(c => c.index === labelIndex);
  const measureCol = data.columns.find(c => c.index === measureIndex);
  let rows = data.rows.map(r => ({
    rowNumber:r.rowNumber,
    label:DataMartParsers.clean(r.cells[labelIndex]) || `(row ${r.rowNumber})`,
    raw:r.cells[measureIndex],
    value:DataMartParsers.flexibleNumberValue(r.cells[measureIndex])
  })).filter(r => r.value !== null);
  if (els.genericSort.value === "desc") rows.sort((a,b) => b.value - a.value || a.rowNumber - b.rowNumber);
  if (els.genericSort.value === "asc") rows.sort((a,b) => a.value - b.value || a.rowNumber - b.rowNumber);
  return {rows,labelCol,measureCol};
}

function formatFlexibleValue(value, header="") {
  if (!Number.isFinite(value)) return "Not reported";
  if (/rate|percent|percentage|%/i.test(header)) {
    const pct = Math.abs(value) <= 1.000001 ? value * 100 : value;
    return `${pct.toLocaleString(undefined,{maximumFractionDigits:1})}%`;
  }
  if (/wage|salary|amount|dollar|earn/i.test(header)) return value.toLocaleString(undefined,{style:"currency",currency:"USD",maximumFractionDigits:0});
  return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined,{maximumFractionDigits:2});
}

function renderGeneric() {
  const {rows,labelCol,measureCol} = genericSelection();
  if (!labelCol || !measureCol) return;
  const limit = Math.max(1, Number(els.genericChartLimit.value) || 25);
  const chartRows = rows.slice(0, limit);
  els.genericResultsTitle.textContent = `${measureCol.name} by ${labelCol.name}`;
  els.genericResultMeta.textContent = `${state.generic.reportTitle || "Tabular export"}${state.generic.period ? ` · ${state.generic.period}` : ""} · ${rows.length.toLocaleString()} numeric row${rows.length === 1 ? "" : "s"}`;
  els.genericLabelHeader.textContent = labelCol.name;
  els.genericMeasureHeader.textContent = measureCol.name;
  els.genericWarning.hidden = rows.length <= limit;
  if (rows.length > limit) els.genericWarning.innerHTML = `<strong>Chart limited to ${limit} rows.</strong> The table below still shows all ${rows.length.toLocaleString()} numeric rows for the selected measure.`;
  renderBarRows(els.genericBarChart, chartRows.map(r => ({label:r.label,value:r.value})), {format:/rate|percent|percentage|%/i.test(measureCol.name) ? "percent-flex" : "decimal-flex"});
  els.genericResultsBody.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    const th = document.createElement("th"); th.scope = "row"; th.textContent = r.label;
    const td = document.createElement("td"); td.textContent = formatFlexibleValue(r.value, measureCol.name);
    tr.append(th,td); els.genericResultsBody.appendChild(tr);
  });
  els.genericMethodText.textContent = [
    "Source: User-provided Excel or CSV export (source not identified by CCC Data Smart)",
    `File: ${state.sourceName}`,
    `Detected title: ${state.generic.reportTitle || "Not detected"}`,
    `Period: ${state.generic.period || "Not detected"}`,
    `Label column: ${labelCol.name}`,
    `Measure column: ${measureCol.name}`,
    `Numeric rows displayed: ${rows.length.toLocaleString()}`,
    "Method note: Basic table view visualized the selected columns only. It did not determine whether rows are mutually exclusive, whether totals/subtotals overlap, how the denominator is defined, or whether suppressed/blank values have report-specific meaning.",
    "Verification: Confirm the file's original source, measure definition, population, denominator, and any suppression or subtotal rules before using the result consequentially."
  ].join("\n");
}

function downloadGenericCsv() {
  const {rows,labelCol,measureCol} = genericSelection();
  if (!rows.length || !labelCol || !measureCol) return setStatus("There are no selected numeric rows to download.", "error");
  downloadCsvFile("ccc-data-smart-flexible-view.csv", [[labelCol.name,measureCol.name], ...rows.map(r => [r.label,r.value])]);
  setStatus("Basic table CSV downloaded.", "success");
}

function showUnsupported(kind, label) {
  els.exploreWorkspace.hidden = false;
  els.unsupportedModule.hidden = false;
  const info = {
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
  downloadCsvFile("ccc-data-smart-program-awards.csv", [["College","Award Count"], ...rows]);
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
  downloadCsvFile("ccc-data-smart-success-retention.csv", data);
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

function csvCell(value) { return DataMartFileSecurity.csvCell(value); }

function decimalPercent(value) {
  return Number.isFinite(value) ? (value * 100).toFixed(1) + "%" : "";
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "Not available";
}

function formatInteger(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)).toLocaleString() : "Not available";
}

function formatDecimal(value) {
  return Number.isFinite(Number(value)) ? Number(value).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) : "Not available";
}

function scrollWorkspace() {
  els.exploreWorkspace.scrollIntoView({behavior:preferredScrollBehavior(), block:"start"});
}


function uniquePrograms(records) {
  const map = new Map();
  (records || []).forEach(r => {
    const top = r.top || "";
    const name = r.program || r.topName || top || "Unlabeled program";
    if (top || name) map.set(`${name}|${top}`, {key:`${name}|${top}`, name, top});
  });
  return [...map.values()].sort((a,b) => a.name.localeCompare(b.name) || a.top.localeCompare(b.top));
}

function uniqueColleges(records) {
  return [...new Set((records || []).map(r => r.college).filter(Boolean))].sort((a,b) => a.localeCompare(b));
}

function comparisonRecords(kind, parsed) {
  if (kind === "course-details" || kind === "program-awards" || kind === "retention-success" || kind === "grade-distribution") return parsed.records || [];
  return [];
}

function initWithinFileCompare(kind, parsed) {
  const records = comparisonRecords(kind, parsed);
  if (!records.length) return;
  const programs = uniquePrograms(records);
  const colleges = uniqueColleges(records);
  if (programs.length < 2 && colleges.length < 2) return;
  state.withinCompare = {kind, parsed, selected:new Set()};
  els.withinFileCompare.hidden = false;
  els.withinCompareDimension.innerHTML = "";
  const p = document.createElement("option");
  p.value = "programs"; p.textContent = "Programs"; p.disabled = programs.length < 2;
  const c = document.createElement("option");
  c.value = "colleges"; c.textContent = "Colleges"; c.disabled = colleges.length < 2;
  els.withinCompareDimension.append(p,c);
  els.withinCompareDimension.value = programs.length >= 2 ? "programs" : "colleges";
  els.withinCompareAvailability.textContent = colleges.length < 2
    ? "This file contains one college. To compare colleges, use a district-wide export or Compare Files."
    : "Only items already contained in this export are offered here.";
  setupWithinFileCompareControls();
}

function setupWithinFileCompareControls() {
  if (!state.withinCompare) return;
  const {kind, parsed} = state.withinCompare;
  const records = comparisonRecords(kind, parsed);
  const programs = uniquePrograms(records);
  const colleges = uniqueColleges(records);
  const dimension = els.withinCompareDimension.value;
  const comparePrograms = dimension === "programs";

  els.withinCompareContext.innerHTML = "";
  const contexts = comparePrograms ? colleges : programs;
  contexts.forEach(item => {
    const option = document.createElement("option");
    if (comparePrograms) { option.value = item; option.textContent = item; }
    else { option.value = item.key; option.textContent = `${item.name}${item.top ? ` · TOP ${item.top}` : ""}`; }
    els.withinCompareContext.appendChild(option);
  });
  els.withinCompareContextLabel.textContent = comparePrograms ? "College" : "Program";
  els.withinCompareContextWrap.hidden = contexts.length <= 1;

  els.withinCompareMeasure.innerHTML = "";
  const measures = [];
  if (kind === "course-details") measures.push(["sections","Reported sections"]);
  if (kind === "program-awards") measures.push(["awards","Awards granted"]);
  if (kind === "retention-success") measures.push(["successRate","Course success"],["retentionRate","Course retention"],["enrollment","Course enrollments"]);
  if (kind === "grade-distribution") measures.push(["gradeRecords","Reported grade records"]);
  measures.forEach(([value,label]) => { const o=document.createElement("option"); o.value=value; o.textContent=label; els.withinCompareMeasure.appendChild(o); });

  els.withinCompareExtraWrap.hidden = true;
  els.withinCompareExtra.innerHTML = "";
  if (kind === "retention-success") {
    els.withinCompareExtraWrap.hidden = false;
    els.withinCompareExtraLabel.textContent = "Course population";
    (parsed.populations || []).forEach(pop => { const o=document.createElement("option"); o.value=pop; o.textContent=pop; els.withinCompareExtra.appendChild(o); });
  } else if (kind === "program-awards") {
    const types = [...new Set(records.map(r => r.awardType).filter(Boolean))].sort();
    if (types.length > 1) {
      els.withinCompareExtraWrap.hidden = false;
      els.withinCompareExtraLabel.textContent = "Award type";
      const all=document.createElement("option"); all.value=""; all.textContent="All award types"; els.withinCompareExtra.appendChild(all);
      types.forEach(type => { const o=document.createElement("option"); o.value=type; o.textContent=type; els.withinCompareExtra.appendChild(o); });
    }
  }

  const choices = comparePrograms ? programs : colleges.map(name => ({key:name,name,top:""}));
  state.withinCompare.selected = new Set(choices.slice(0, Math.min(8, choices.length)).map(x => x.key));
  els.withinCompareChoices.innerHTML = "";
  choices.forEach((item,index) => {
    const id=`within-compare-${dimension}-${index}`;
    const label=document.createElement("label");
    label.className="check-chip";
    const checked=state.withinCompare.selected.has(item.key);
    label.innerHTML=`<input type="checkbox" id="${id}" ${checked ? "checked" : ""}> <span>${escapeHtml(item.name)}${item.top ? ` <small>TOP ${escapeHtml(item.top)}</small>` : ""}</span>`;
    const input=label.querySelector("input");
    input.addEventListener("change", e => { if(e.target.checked) state.withinCompare.selected.add(item.key); else state.withinCompare.selected.delete(item.key); renderWithinFileCompare(); });
    els.withinCompareChoices.appendChild(label);
  });
  els.withinCompareChoicesLegend.textContent = comparePrograms ? "Programs to show" : "Colleges to show";
  renderWithinFileCompare();
}

function renderWithinFileCompare() {
  if (!state.withinCompare) return;
  const {kind, parsed} = state.withinCompare;
  const records = comparisonRecords(kind, parsed);
  const dimension = els.withinCompareDimension.value;
  const comparePrograms = dimension === "programs";
  const context = els.withinCompareContext.value;
  const measure = els.withinCompareMeasure.value;
  const extra = els.withinCompareExtra.value;
  let filtered = records.slice();

  if (comparePrograms && context) filtered = filtered.filter(r => r.college === context);
  if (!comparePrograms && context) {
    const [program,top] = context.split("|");
    filtered = filtered.filter(r => (r.program || r.topName || r.top || "") === program && (r.top || "") === top);
  }
  if (kind === "program-awards" && extra) filtered = filtered.filter(r => r.awardType === extra);

  const groups = new Map();
  function groupKey(r) { return comparePrograms ? `${r.program || r.topName || r.top || "Unlabeled program"}|${r.top || ""}` : (r.college || "College not labeled"); }
  function groupLabel(key) { if (!comparePrograms) return key; const [name,top] = key.split("|"); return `${name}${top ? ` (TOP ${top})` : ""}`; }

  if (kind === "course-details") {
    filtered.forEach(r => { const key=groupKey(r); const g=groups.get(key)||{value:0,has:false}; if(r.sections!==null){g.value+=r.sections;g.has=true;} groups.set(key,g); });
  } else if (kind === "program-awards") {
    filtered.forEach(r => { const key=groupKey(r); const g=groups.get(key)||{value:0,has:false}; if(r.count!==null){g.value+=r.count;g.has=true;} groups.set(key,g); });
  } else if (kind === "retention-success") {
    const pop = extra || (parsed.populations || [])[0];
    filtered.forEach(r => {
      const m=(r.measures||{})[pop]||{}; const key=groupKey(r); const g=groups.get(key)||{enrollment:0,retention:0,success:0,has:false};
      if(m.enrollment!==null && m.enrollment!==undefined){g.enrollment+=m.enrollment;g.has=true;}
      if(m.retention!==null && m.retention!==undefined)g.retention+=m.retention;
      if(m.success!==null && m.success!==undefined)g.success+=m.success;
      groups.set(key,g);
    });
  } else if (kind === "grade-distribution") {
    filtered.forEach(r => { const key=groupKey(r); const g=groups.get(key)||{value:null}; const total=r.programTotal; if(total!==null && total!==undefined) g.value = g.value===null ? total : Math.max(g.value,total); groups.set(key,g); });
  }

  let rows=[];
  groups.forEach((g,key) => {
    if (!state.withinCompare.selected.has(key)) return;
    let value=null;
    if (kind === "retention-success") {
      if (measure === "enrollment") value=g.has ? g.enrollment : null;
      if (measure === "successRate") value=g.enrollment ? g.success/g.enrollment : null;
      if (measure === "retentionRate") value=g.enrollment ? g.retention/g.enrollment : null;
    } else value=g.value;
    if (value!==null && Number.isFinite(value)) rows.push({label:groupLabel(key),value,key});
  });
  rows.sort((a,b)=>b.value-a.value || a.label.localeCompare(b.label));

  const measureLabel = els.withinCompareMeasure.options[els.withinCompareMeasure.selectedIndex]?.textContent || "Value";
  const dimLabel = comparePrograms ? "programs" : "colleges";
  els.withinCompareTitle.textContent = `${measureLabel} by ${comparePrograms ? "program" : "college"}`;
  els.withinCompareMeta.textContent = `${rows.length} selected ${dimLabel}${parsed.period ? ` · ${parsed.period}` : ""}`;
  els.withinCompareLabelHeader.textContent = comparePrograms ? "Program" : "College";
  els.withinCompareValueHeader.textContent = measureLabel;
  els.withinCompareCaption.textContent = `${measureLabel} for selected ${dimLabel}`;

  let caution = "Keep the report, period, population, and measure consistent before treating differences as meaningful.";
  if (kind === "program-awards") caution = "Award counts are not unique graduate counts. One student may receive more than one award.";
  if (kind === "retention-success") caution = "Rates are recalculated from the underlying enrollment counts. They are not averages of displayed percentages.";
  if (kind === "course-details") caution = "Reported section records may not equal the number of locally understood classes when linked instructional components are involved.";
  if (kind === "grade-distribution") caution = "Reported grade records are enrollment records, not unique students.";
  els.withinCompareCaution.innerHTML = `<strong>Watch for:</strong> ${escapeHtml(caution)}`;

  els.withinCompareBody.innerHTML = "";
  if (!rows.length) els.withinCompareBody.innerHTML = '<tr><td colspan="2">Choose at least one item that has data for these filters.</td></tr>';
  rows.forEach(row => { const tr=document.createElement("tr"); const formatted=(measure.endsWith("Rate"))?formatPercent(row.value):formatInteger(row.value); tr.innerHTML=`<th scope="row">${escapeHtml(row.label)}</th><td>${escapeHtml(formatted)}</td>`; els.withinCompareBody.appendChild(tr); });
  renderBarRows(els.withinCompareChart, rows, {format:measure.endsWith("Rate") ? "percent" : "integer"});
}

function resetExplorer() {
  state.sourceName = "";
  state.kind = "";
  state.awards = null;
  state.success = null;
  state.grade = null;
  state.headcount = null;
  state.courseDetails = null;
  state.creditSections = null;
  state.selectedColleges = new Set();
  els.exploreFileInput.value = "";
  els.detectedReport.hidden = true;
  hideModules();
  setStatus("Ready. Choose an Excel or CSV export, or try a sample.", "neutral");
  window.scrollTo({top:0, behavior:preferredScrollBehavior()});
  els.exploreBrowseButton.focus();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}
