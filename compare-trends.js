"use strict";

(function () {
  const MAX_FILES = 20;
  const state = { datasets: [], kind: "", results: [], plan: null };

  const el = id => document.getElementById(id);
  const dropZone = el("compareDropZone");
  const browseButton = el("compareBrowseButton");
  const fileInput = el("compareFileInput");
  const status = el("compareStatus");
  const fileArea = el("compareFileArea");
  const fileList = el("compareFileList");
  const workspace = el("compareWorkspace");
  const controls = el("compareDynamicControls");
  const chart = el("compareChart");
  const body = el("compareResultsBody");
  const cautions = el("compareCautions");
  const stats = el("compareStats");
  const method = el("compareMethodText");

  function setStatus(message, kind) {
    status.textContent = message || "";
    if (kind) status.dataset.kind = kind;
    else delete status.dataset.kind;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
  }

  function clean(value) {
    return DataMartParsers.clean(value);
  }

  function parseRows(rows, kind) {
    const parsers = {
      "program-awards": DataMartParsers.parseProgramAwards,
      "retention-success": DataMartParsers.parseRetentionSuccess,
      "student-headcount": DataMartParsers.parseStudentHeadcount,
      "grade-distribution": DataMartParsers.parseGradeDistribution,
      "course-details": DataMartParsers.parseCourseDetails,
      "credit-course-sections": DataMartParsers.parseCreditCourseSections
    };
    return parsers[kind] ? parsers[kind](rows) : null;
  }

  async function readFile(file) {
    const {rows} = await DataMartFileSecurity.readRows(file, {allowCsv:true, defval:""});
    const detection = DataMartParsers.detectReport(rows);
    const parsed = detection.supported ? parseRows(rows, detection.kind) : null;
    return { file, fileName: file.name, rows, detection, parsed };
  }

  async function handleFiles(fileCollection) {
    const files = Array.from(fileCollection || []);
    if (files.length < 2) {
      setStatus("Choose at least two files so there is something to compare.", "error");
      return;
    }
    if (files.length > MAX_FILES) {
      setStatus(`Choose no more than ${MAX_FILES} files at a time.`, "error");
      return;
    }
    setStatus(`Reading ${files.length} files...`);
    workspace.hidden = true;
    try {
      const datasets = await Promise.all(files.map(readFile));
      state.datasets = datasets;
      renderFileList();
      validateSet();
    } catch (error) {
      console.error(error);
      setStatus("I could not read one of those files. Try the original Excel or CSV export from Data Mart.", "error");
    }
  }

  function reportLabel(kind) {
    return {
      "program-awards": "Program Awards",
      "retention-success": "Success & Retention",
      "student-headcount": "Student Headcount",
      "grade-distribution": "Grade Distribution",
      "course-details": "Course Details",
      "credit-course-sections": "Credit Courses/Sections"
    }[kind] || "Data Mart report";
  }

  function unique(values) {
    return [...new Set(values.filter(v => clean(v)).map(v => clean(v)))];
  }

  function institutionFor(ds) {
    const p = ds.parsed || {};
    if (p.kind === "program-awards") {
      const colleges = unique((p.records || []).map(r => r.college));
      if (colleges.length === 1) return colleges[0];
      if (p.district) return `${p.district} (${colleges.length} colleges)`;
      return colleges.length ? `${colleges.length} colleges` : "";
    }
    if (p.college) return p.college;
    if (p.kind === "credit-course-sections" && p.records && p.records.length === 1) return p.records[0].label || "";
    return "";
  }

  function periodFor(ds) {
    return clean(ds.parsed && ds.parsed.period);
  }

  function renderFileList() {
    fileArea.hidden = state.datasets.length === 0;
    fileList.innerHTML = state.datasets.map((ds, index) => {
      const label = ds.detection.supported ? ds.detection.label : ds.detection.label;
      const inst = ds.parsed ? institutionFor(ds) : "";
      const period = ds.parsed ? periodFor(ds) : "";
      const meta = [label, inst, period].filter(Boolean).join(" · ");
      return `<article class="compare-file-card">
        <div><strong>${esc(ds.fileName)}</strong><span>${esc(meta || "Unrecognized export")}</span></div>
        <button type="button" class="text-button remove-compare-file" data-index="${index}" aria-label="Remove ${esc(ds.fileName)}">Remove</button>
      </article>`;
    }).join("");
    fileList.querySelectorAll(".remove-compare-file").forEach(button => {
      button.addEventListener("click", () => {
        state.datasets.splice(Number(button.dataset.index), 1);
        renderFileList();
        if (state.datasets.length >= 2) validateSet();
        else {
          workspace.hidden = true;
          setStatus("Choose at least one more comparable export.", "error");
        }
      });
    });
  }

  function validateSet() {
    const unsupported = state.datasets.filter(ds => !ds.detection.supported || !ds.parsed || ds.parsed.error);
    if (unsupported.length) {
      workspace.hidden = true;
      setStatus("Multi-file comparison currently works only with the six tested report structures listed below. One or more selected files could not be recognized safely.", "error");
      return;
    }
    const kinds = unique(state.datasets.map(ds => ds.detection.kind));
    if (kinds.length !== 1) {
      workspace.hidden = true;
      setStatus("These files come from different Data Mart reports. Compare files from the same report so the measure and population stay consistent.", "error");
      return;
    }
    state.kind = kinds[0];
    setStatus(`${state.datasets.length} ${reportLabel(state.kind)} exports are ready to compare.`, "success");
    configureControls();
    workspace.hidden = false;
    updateResults();
  }

  function option(value, label, selected) {
    return `<option value="${esc(value)}"${selected ? " selected" : ""}>${esc(label ?? value)}</option>`;
  }

  function topChoices(records) {
    const map = new Map();
    records.forEach(r => { if (r.top) map.set(r.top, `${r.program || r.topName || "Program"} · ${r.top}`); });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }

  function configureControls() {
    const allRecords = state.datasets.flatMap(ds => ds.parsed.records || []);
    if (state.kind === "program-awards") {
      const tops = topChoices(allRecords);
      const awardTypes = unique(allRecords.map(r => r.awardType)).sort();
      const colleges = unique(allRecords.map(r => r.college)).sort();
      controls.innerHTML = `
        <label for="compareTop">Program or six-digit TOP</label>
        <select id="compareTop">${tops.map(([v,l],i) => option(v,l,i===0)).join("")}</select>
        <label for="compareAwardType">Award type</label>
        <select id="compareAwardType"><option value="">All award types</option>${awardTypes.map(v => option(v,v,false)).join("")}</select>
        <label for="compareCollege">College inside each export</label>
        <select id="compareCollege"><option value="">All colleges represented in each export</option>${colleges.map(v => option(v,v,false)).join("")}</select>
        <p class="field-help">Award Count is the measure. Award counts are not unique graduate headcounts.</p>`;
    } else if (state.kind === "retention-success") {
      const tops = topChoices(allRecords);
      const populations = unique(state.datasets.flatMap(ds => ds.parsed.populations || [])).sort();
      const modalities = unique(allRecords.map(r => r.modality)).sort();
      const defaultPopulation = populations.includes("Credit") ? "Credit" : (populations[0] || "");
      controls.innerHTML = `
        <label for="compareTop">Program or six-digit TOP</label>
        <select id="compareTop">${tops.map(([v,l],i) => option(v,l,i===0)).join("")}</select>
        <label for="comparePopulation">Population</label>
        <select id="comparePopulation">${populations.map(v => option(v,v,v===defaultPopulation)).join("")}</select>
        <label for="compareMetric">Measure</label>
        <select id="compareMetric">
          ${option("successRate","Success Rate",true)}${option("retentionRate","Retention Rate",false)}${option("enrollment","Enrollment Count",false)}${option("success","Success Count",false)}${option("retention","Retention Count",false)}
        </select>
        <label for="compareModality">Modality</label>
        <select id="compareModality"><option value="">All reported modalities</option>${modalities.map(v => option(v,v,false)).join("")}</select>
        <p class="field-help">When modalities are combined, rates are recalculated from the combined counts. Percentages are not averaged.</p>`;
    } else if (state.kind === "grade-distribution") {
      const tops = topChoices(allRecords);
      const grades = unique(allRecords.map(r => r.grade));
      const preferred = grades.includes("Grade A") ? "Grade A" : (grades.includes("A") ? "A" : (grades[0] || ""));
      controls.innerHTML = `
        <label for="compareTop">Program or six-digit TOP</label>
        <select id="compareTop">${tops.map(([v,l],i) => option(v,l,i===0)).join("")}</select>
        <label for="compareGrade">Grade category</label>
        <select id="compareGrade">${grades.map(v => option(v,v,v===preferred)).join("")}</select>
        <label for="compareMetric">Measure</label>
        <select id="compareMetric">${option("percent","Share of reported grades",true)}${option("count","Grade count",false)}</select>
        <p class="field-help">Shares are recalculated from the selected program total in each file. Blank grade categories remain visible as unlabeled categories.</p>`;
    } else if (state.kind === "student-headcount") {
      controls.innerHTML = `
        <label for="compareDimension">Student dimension</label>
        <select id="compareDimension">${option("gender","Gender",true)}${option("age","Age Group",false)}${option("ethnicity","Ethnicity",false)}${option("status","Headcount Status",false)}</select>
        <label for="compareCategory">Category</label>
        <select id="compareCategory"></select>
        <label for="compareMetric">Measure</label>
        <select id="compareMetric">${option("percent","Percent of college headcount",true)}${option("count","Student Count",false)}</select>
        <p class="field-help">The selected category is summed from the detailed demographic rows. Percent uses each file's reported college headcount as its denominator.</p>`;
      updateHeadcountCategories();
    } else if (state.kind === "course-details") {
      const credit = unique(allRecords.map(r => r.creditStatus)).sort();
      const transfer = unique(allRecords.map(r => r.transferStatus)).sort();
      controls.innerHTML = `
        <label for="compareCourseSearch">Course, prefix, title, or TOP</label>
        <input id="compareCourseSearch" type="search" placeholder="Try ENGL, C1000, English, or 150100">
        <p class="field-help">Enter the same course definition you want applied to every file. The tool sums Sections Count only for matching course records.</p>
        <label for="compareCreditStatus">Credit status</label>
        <select id="compareCreditStatus"><option value="">All credit statuses</option>${credit.map(v => option(v,v,false)).join("")}</select>
        <label for="compareTransferStatus">Transfer status</label>
        <select id="compareTransferStatus"><option value="">All transfer statuses</option>${transfer.map(v => option(v,v,false)).join("")}</select>
        <p class="field-help"><strong>Measure:</strong> reported Sections Count. A reported section is not automatically the same thing as one locally understood instructional class.</p>`;
    } else if (state.kind === "credit-course-sections") {
      const paths = new Map();
      allRecords.forEach(r => {
        const key = (r.path || [r.label]).join(" › ");
        if (key) paths.set(key, key);
      });
      const keys = [...paths.keys()].sort();
      controls.innerHTML = `
        <label for="compareSectionRow">Displayed report row</label>
        <select id="compareSectionRow">${keys.map((v,i) => option(v,v,i===0)).join("")}</select>
        <label for="compareMetric">Measure</label>
        <select id="compareMetric">${option("sections","Section Count",true)}${option("enrollment","Enrollment Count",false)}${option("ftes","FTES",false)}</select>
        <p class="field-help">The tool compares one exact displayed row from each export. It does not sum report hierarchies or assume that totals and subtotals can be added.</p>`;
    }

    controls.querySelectorAll("input, select").forEach(node => node.addEventListener("input", () => {
      if (node.id === "compareDimension") updateHeadcountCategories();
      updateResults();
    }));
    controls.querySelectorAll("select").forEach(node => node.addEventListener("change", () => {
      if (node.id === "compareDimension") updateHeadcountCategories();
      updateResults();
    }));
  }

  function updateHeadcountCategories() {
    const dimension = el("compareDimension");
    const category = el("compareCategory");
    if (!dimension || !category) return;
    const key = dimension.value;
    const values = unique(state.datasets.flatMap(ds => (ds.parsed.records || []).map(r => r[key]))).sort((a,b) => a.localeCompare(b, undefined, {numeric:true}));
    const old = category.value;
    category.innerHTML = values.map((v,i) => option(v,v,v===old || (!old && i===0))).join("");
  }

  function controlValue(id) {
    const node = el(id);
    return node ? node.value : "";
  }

  function summarizeDataset(ds) {
    const p = ds.parsed;
    if (state.kind === "program-awards") {
      const top = controlValue("compareTop");
      const awardType = controlValue("compareAwardType");
      const college = controlValue("compareCollege");
      const rows = (p.records || []).filter(r => r.top === top && (!awardType || r.awardType === awardType) && (!college || r.college === college));
      if (!rows.length) return { value: null, context: "No matching award rows" };
      return { value: rows.reduce((s,r) => s + (Number(r.count) || 0), 0), context: `${rows.length} award row${rows.length===1?"":"s"}` };
    }
    if (state.kind === "retention-success") {
      const top = controlValue("compareTop");
      const population = controlValue("comparePopulation");
      const metric = controlValue("compareMetric");
      const modality = controlValue("compareModality");
      const rows = (p.records || []).filter(r => r.top === top && (!modality || r.modality === modality));
      let enrollment = 0, success = 0, retention = 0, found = false;
      rows.forEach(r => {
        const m = r.measures && r.measures[population];
        if (!m) return;
        if (m.enrollment !== null && m.enrollment !== undefined) { enrollment += Number(m.enrollment) || 0; found = true; }
        if (m.success !== null && m.success !== undefined) success += Number(m.success) || 0;
        if (m.retention !== null && m.retention !== undefined) retention += Number(m.retention) || 0;
      });
      if (!found) return { value: null, context: "Population not available" };
      const values = { enrollment, success, retention, successRate: enrollment ? success / enrollment * 100 : null, retentionRate: enrollment ? retention / enrollment * 100 : null };
      return { value: values[metric], context: `N = ${enrollment.toLocaleString()}`, denominator: enrollment };
    }
    if (state.kind === "grade-distribution") {
      const top = controlValue("compareTop");
      const grade = controlValue("compareGrade");
      const metric = controlValue("compareMetric");
      const rows = (p.records || []).filter(r => r.top === top);
      if (!rows.length) return { value: null, context: "Program not available" };
      const selected = rows.filter(r => r.grade === grade);
      if (!selected.length) return { value: null, context: "Grade category not available" };
      const count = selected.reduce((s,r) => s + (Number(r.count) || 0), 0);
      const denominator = Number(rows[0].programTotal) || rows.reduce((s,r) => s + (Number(r.count) || 0), 0);
      const value = metric === "percent" ? (denominator ? count / denominator * 100 : null) : count;
      return { value, context: `Program total = ${denominator.toLocaleString()}`, denominator };
    }
    if (state.kind === "student-headcount") {
      const dimension = controlValue("compareDimension");
      const category = controlValue("compareCategory");
      const metric = controlValue("compareMetric");
      const rows = (p.records || []).filter(r => r[dimension] === category);
      if (!rows.length) return { value: null, context: "Category not available" };
      const count = rows.reduce((s,r) => s + (Number(r.count) || 0), 0);
      const denominator = Number(p.collegeTotal) || null;
      const value = metric === "percent" ? (denominator ? count / denominator * 100 : null) : count;
      return { value, context: denominator ? `College headcount = ${denominator.toLocaleString()}` : "College total unavailable", denominator };
    }
    if (state.kind === "course-details") {
      const query = clean(controlValue("compareCourseSearch")).toLowerCase();
      const creditStatus = controlValue("compareCreditStatus");
      const transferStatus = controlValue("compareTransferStatus");
      if (!query) return { value: null, context: "Enter a course definition" };
      const rows = (p.records || []).filter(r => {
        const courseId = clean(r.courseId).toLowerCase();
        const rawQuery = clean(controlValue("compareCourseSearch"));
        let matches = false;
        if (/^\d{6}$/.test(rawQuery)) matches = clean(r.top) === rawQuery;
        else if (/^[A-Za-z]{2,10}$/.test(rawQuery)) matches = courseId.startsWith(rawQuery.toLowerCase());
        else {
          const haystack = [r.courseId, r.title, r.topName, r.top, r.controlNumber].map(clean).join(" ").toLowerCase();
          matches = haystack.includes(query);
        }
        return matches && (!creditStatus || r.creditStatus === creditStatus) && (!transferStatus || r.transferStatus === transferStatus);
      });
      if (!rows.length) return { value: null, context: "No matching course records", matched: 0 };
      const value = rows.reduce((s,r) => s + (Number(r.sections) || 0), 0);
      return { value, context: `${rows.length} matched course record${rows.length===1?"":"s"}`, matched: rows.length };
    }
    if (state.kind === "credit-course-sections") {
      const key = controlValue("compareSectionRow");
      const metric = controlValue("compareMetric");
      const rows = (p.records || []).filter(r => (r.path || [r.label]).join(" › ") === key);
      if (rows.length !== 1) return { value: null, context: rows.length ? "Displayed row is not unique" : "Displayed row not available" };
      const value = rows[0][metric];
      return { value: value === null || value === undefined ? null : Number(value), context: "Exact displayed report row" };
    }
    return { value: null, context: "Unsupported" };
  }

  function periodOrder(period) {
    const p = clean(period);
    let m = p.match(/^(Winter|Spring|Summer|Fall)\s+(\d{4})$/i);
    if (m) {
      const order = { winter:0, spring:1, summer:2, fall:3 }[m[1].toLowerCase()];
      return Number(m[2]) * 10 + order;
    }
    m = p.match(/(?:Annual\s+)?(\d{4})-(\d{4})/i);
    if (m) return Number(m[1]) * 10 + 5;
    return Number.MAX_SAFE_INTEGER;
  }

  function comparisonPlan(results) {
    const periods = unique(results.map(r => r.period));
    const institutions = unique(results.map(r => r.institution));
    const allHavePeriod = results.every(r => r.period);
    const allHaveInstitution = results.every(r => r.institution);
    if (allHavePeriod && periods.length >= 2 && allHaveInstitution && institutions.length === 1) {
      return { mode: "trend", label: "Trend over time", sort: true, warning: "" };
    }
    if (allHaveInstitution && institutions.length >= 2 && allHavePeriod && periods.length === 1) {
      return { mode: "compare", label: "College comparison", sort: false, warning: "" };
    }
    let warning = "";
    if (periods.length > 1 && institutions.length > 1) warning = "Both the institution and the period change across these files. Treat this as a side-by-side comparison, not a clean trend or a clean same-period college comparison.";
    else if (!allHavePeriod || !allHaveInstitution) warning = "At least one file is missing an institution or period label, so the tool cannot confirm a clean time-only or institution-only comparison.";
    return { mode: "compare", label: "Side-by-side comparison", sort: false, warning };
  }

  function metricInfo() {
    if (state.kind === "program-awards") return { label: "Award Count", percent: false };
    if (state.kind === "retention-success") {
      const metric = controlValue("compareMetric");
      const labels = {successRate:"Success Rate",retentionRate:"Retention Rate",enrollment:"Enrollment Count",success:"Success Count",retention:"Retention Count"};
      return { label: labels[metric], percent: /Rate$/.test(labels[metric]) };
    }
    if (state.kind === "grade-distribution") return { label: controlValue("compareMetric") === "percent" ? "Share of reported grades" : "Grade Count", percent: controlValue("compareMetric") === "percent" };
    if (state.kind === "student-headcount") return { label: controlValue("compareMetric") === "percent" ? "Percent of College Headcount" : "Student Count", percent: controlValue("compareMetric") === "percent" };
    if (state.kind === "course-details") return { label: "Sections Count", percent: false };
    if (state.kind === "credit-course-sections") {
      const metric = controlValue("compareMetric");
      return { label: {sections:"Section Count",enrollment:"Enrollment Count",ftes:"FTES"}[metric], percent:false, decimals: metric === "ftes" ? 2 : 0 };
    }
    return { label: "Value", percent:false };
  }

  function selectionLabel() {
    if (state.kind === "program-awards") return `TOP ${controlValue("compareTop")}${controlValue("compareAwardType") ? ` · ${controlValue("compareAwardType")}` : ""}`;
    if (state.kind === "retention-success") return `TOP ${controlValue("compareTop")} · ${controlValue("comparePopulation")}${controlValue("compareModality") ? ` · ${controlValue("compareModality")}` : ""}`;
    if (state.kind === "grade-distribution") return `TOP ${controlValue("compareTop")} · ${controlValue("compareGrade")}`;
    if (state.kind === "student-headcount") return `${el("compareDimension")?.selectedOptions[0]?.textContent || "Category"}: ${controlValue("compareCategory")}`;
    if (state.kind === "course-details") return controlValue("compareCourseSearch") ? `Course match: ${controlValue("compareCourseSearch")}` : "Enter a course definition";
    if (state.kind === "credit-course-sections") return controlValue("compareSectionRow");
    return "";
  }

  function formatValue(value, info) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return "Not available";
    const n = Number(value);
    if (info.percent) return `${n.toFixed(1)}%`;
    if (info.decimals === 2) return n.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    return n.toLocaleString(undefined, {maximumFractionDigits:1});
  }

  function updateResults() {
    if (!state.datasets.length || !state.kind) return;
    const info = metricInfo();
    let results = state.datasets.map(ds => {
      const summary = summarizeDataset(ds);
      return {
        fileName: ds.fileName,
        institution: institutionFor(ds),
        period: periodFor(ds),
        value: summary.value,
        context: summary.context || "",
        matched: summary.matched,
        denominator: summary.denominator
      };
    });
    const plan = comparisonPlan(results);
    if (plan.sort) results = [...results].sort((a,b) => periodOrder(a.period) - periodOrder(b.period));
    state.results = results;
    state.plan = plan;

    el("compareModeLabel").textContent = plan.label;
    el("compareResultsTitle").textContent = `${info.label}: ${selectionLabel()}`;
    el("compareResultMeta").textContent = `${reportLabel(state.kind)} · ${results.length} files`;
    el("compareTableCaption").textContent = `${info.label} across selected Data Mart exports`;

    renderStats(results, info, plan);
    renderCautions(results, info, plan);
    renderChart(results, info, plan);
    renderTable(results, info);
    renderMethod(results, info, plan);
  }

  function renderStats(results, info, plan) {
    const valid = results.filter(r => Number.isFinite(Number(r.value)));
    let change = "Not available";
    if (plan.mode === "trend" && valid.length >= 2) {
      const first = Number(valid[0].value), last = Number(valid[valid.length - 1].value);
      if (info.percent) change = `${(last - first).toFixed(1)} percentage points`;
      else if (first !== 0) change = `${((last - first) / first * 100).toFixed(1)}%`;
      else change = `${formatValue(last - first, info)} difference`;
    }
    stats.innerHTML = `
      <div class="viewer-stat"><span>Files</span><strong>${results.length}</strong></div>
      <div class="viewer-stat"><span>Report</span><strong>${esc(reportLabel(state.kind))}</strong></div>
      <div class="viewer-stat"><span>View</span><strong>${esc(plan.label)}</strong></div>
      <div class="viewer-stat"><span>${plan.mode === "trend" ? "First to latest" : "Available values"}</span><strong>${plan.mode === "trend" ? esc(change) : `${valid.length} of ${results.length}`}</strong></div>`;
  }

  function renderCautions(results, info, plan) {
    const notes = [];
    if (plan.warning) notes.push(plan.warning);
    if (results.some(r => r.value === null || r.value === undefined || !Number.isFinite(Number(r.value)))) notes.push("At least one selected file does not contain the chosen category or measure. Missing values are shown as not available, not zero.");
    if (state.kind === "program-awards") notes.push("Award Count counts awards, not unique graduates. One student may receive more than one award.");
    if (state.kind === "retention-success") notes.push("Success and retention rates are recalculated from the underlying counts after the selected filters are applied. The tool does not average percentages.");
    if (state.kind === "course-details") {
      const matchCounts = unique(results.map(r => r.matched === undefined ? "" : String(r.matched)));
      if (matchCounts.length > 1) notes.push("The course search matches a different number of course records across files. Review the matched records before treating the section totals as directly equivalent, especially when course numbering or curriculum changed.");
      notes.push("Sections Count represents reported section records. Linked lecture, lab, support, or paired structures may require local reconciliation if your question is about locally understood classes.");
    }
    if (state.kind === "grade-distribution" && controlValue("compareGrade") === "Unlabeled / blank category") notes.push("You selected the unlabeled grade category. Preserve it as unlabeled unless current CCCCO documentation establishes what it represents.");
    if (state.kind === "credit-course-sections") notes.push("The tool compares one exact report row from each file. Do not add totals and subtotals unless the report documentation establishes that they are mutually exclusive.");
    if (state.kind === "student-headcount") notes.push("Student Count is not Enrollment Count. The percentage shown here uses each file's reported college headcount as the denominator.");
    cautions.innerHTML = notes.length ? notes.map(n => `<div class="comparison-caution"><strong>Data caution</strong><p>${esc(n)}</p></div>`).join("") : `<div class="comparison-ok"><strong>Comparison check:</strong> The files appear to hold one key dimension constant while varying ${plan.mode === "trend" ? "time" : "institution"}.</div>`;
  }

  function sourceLabel(row, plan) {
    if (plan.mode === "trend" && row.period) return row.period;
    if (row.institution && unique(state.results.map(r => r.institution)).length > 1) return row.institution;
    return [row.institution, row.period].filter(Boolean).join(" · ") || row.fileName;
  }

  function renderChart(results, info, plan) {
    const valid = results.filter(r => Number.isFinite(Number(r.value)));
    chart.innerHTML = "";
    if (!valid.length) {
      chart.innerHTML = `<div class="boundary-box"><strong>No comparable values yet.</strong><p>Adjust the selection so the same category or measure is available in the selected files.</p></div>`;
      return;
    }
    if (plan.mode === "trend" && valid.length >= 2) renderLineChart(valid, info);
    else renderBarChart(valid, info, plan);
  }

  function renderBarChart(rows, info, plan) {
    const max = Math.max(...rows.map(r => Number(r.value)), 0) || 1;
    chart.innerHTML = `<div class="bar-chart" aria-hidden="true">${rows.map(r => {
      const width = Math.max(1, Number(r.value) / max * 100);
      return `<div class="bar-row"><div class="bar-label">${esc(sourceLabel(r, plan))}</div><div class="bar-track"><div class="bar-fill" style="width:${width.toFixed(2)}%"></div></div><div class="bar-value">${esc(formatValue(r.value, info))}</div></div>`;
    }).join("")}</div><p class="small-note">Exact values and source details are available in the table below.</p>`;
  }

  function renderLineChart(rows, info) {
    const width = 820, height = 340, left = 70, right = 30, top = 34, bottom = 64;
    const values = rows.map(r => Number(r.value));
    const maxRaw = Math.max(...values, info.percent ? 100 : 0);
    const max = info.percent ? 100 : (maxRaw > 0 ? maxRaw * 1.12 : 1);
    const x = i => left + (rows.length === 1 ? 0 : i * (width - left - right) / (rows.length - 1));
    const y = v => top + (max - v) / max * (height - top - bottom);
    const points = rows.map((r,i) => `${x(i)},${y(Number(r.value))}`).join(" ");
    const grid = [0,.25,.5,.75,1].map(frac => {
      const value = max * frac;
      const yy = y(value);
      return `<line x1="${left}" y1="${yy}" x2="${width-right}" y2="${yy}" class="trend-grid"></line><text x="${left-10}" y="${yy+4}" text-anchor="end" class="trend-axis-label">${esc(formatValue(value, info))}</text>`;
    }).join("");
    const marks = rows.map((r,i) => {
      const xx=x(i), yy=y(Number(r.value));
      return `<g><circle cx="${xx}" cy="${yy}" r="5" class="trend-point"></circle><text x="${xx}" y="${yy-12}" text-anchor="middle" class="trend-value-label">${esc(formatValue(r.value, info))}</text><text x="${xx}" y="${height-bottom+26}" text-anchor="middle" class="trend-x-label">${esc(r.period || r.fileName)}</text></g>`;
    }).join("");
    chart.innerHTML = `<div class="trend-chart-scroll" role="region" tabindex="0" aria-label="Scrollable trend chart"><svg class="trend-chart" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="trendTitle trendDesc"><title id="trendTitle">${esc(info.label)} trend</title><desc id="trendDesc">${esc(rows.map(r => `${r.period || r.fileName}: ${formatValue(r.value, info)}`).join("; "))}</desc>${grid}<polyline points="${points}" class="trend-line"></polyline>${marks}</svg></div><p class="small-note">Exact values, institutions, periods, and context are available in the table below.</p>`;
  }

  function renderTable(results, info) {
    body.innerHTML = results.map(r => `<tr><td>${esc(r.fileName)}</td><td>${esc(r.institution || "Not identified")}</td><td>${esc(r.period || "Not identified")}</td><td class="numeric">${esc(formatValue(r.value, info))}</td><td>${esc(r.context || "")}</td></tr>`).join("");
  }

  function renderMethod(results, info, plan) {
    const periods = unique(results.map(r => r.period));
    const institutions = unique(results.map(r => r.institution));
    const lines = [
      `Question: Compare ${info.label} for ${selectionLabel()}.`,
      `Source: CCC Data Mart`,
      `Report: ${reportLabel(state.kind)}`,
      `Files: ${results.map(r => r.fileName).join("; ")}`,
      `Time period(s): ${periods.join("; ") || "Not identified in export"}`,
      `Institution(s): ${institutions.join("; ") || "Not identified in export"}`,
      `Measure: ${info.label}`,
      `Selection: ${selectionLabel()}`,
      `Comparison type: ${plan.label}`
    ];
    if (state.kind === "retention-success" && /Rate$/.test(info.label)) lines.push("Calculation: Rate recalculated from summed numerator and enrollment denominator after filters; percentages not averaged.");
    if (state.kind === "course-details") lines.push("Special handling: Course search applied independently to every file; matched course-record counts should be reviewed for equivalence.");
    if (state.kind === "program-awards") lines.push("Caution: Award Count is not unique graduate headcount.");
    if (plan.warning) lines.push(`Caution: ${plan.warning}`);
    method.textContent = lines.join("\n");
  }

  function csvEscape(value) { return DataMartFileSecurity.csvCell(value); }

  function downloadCsv() {
    const info = metricInfo();
    const rows = [["Source File","Institution","Period",info.label,"Context"], ...state.results.map(r => [r.fileName,r.institution,r.period,r.value === null || r.value === undefined ? "" : r.value,r.context])];
    const blob = new Blob([rows.map(r => r.map(csvEscape).join(",")).join("\n")], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-mart-smart-comparison.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setStatus("Method copied.", "success");
    } catch (error) {
      console.error(error);
      setStatus("Copy did not work in this browser. Select the method text and copy it manually.", "error");
    }
  }

  function clearAll() {
    state.datasets = [];
    state.kind = "";
    state.results = [];
    state.plan = null;
    fileInput.value = "";
    fileList.innerHTML = "";
    fileArea.hidden = true;
    workspace.hidden = true;
    setStatus("");
    browseButton.focus();
  }

  browseButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => handleFiles(fileInput.files));
  el("clearCompareFiles").addEventListener("click", clearAll);
  el("resetCompare").addEventListener("click", clearAll);
  el("downloadCompareCsv").addEventListener("click", downloadCsv);
  el("copyCompareMethod").addEventListener("click", () => copyText(method.textContent));

  ["dragenter","dragover"].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault();
    dropZone.classList.add("is-dragging");
  }));
  ["dragleave","drop"].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault();
    dropZone.classList.remove("is-dragging");
  }));
  dropZone.addEventListener("drop", event => handleFiles(event.dataTransfer.files));
})();
