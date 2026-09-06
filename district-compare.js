"use strict";

(function () {
  const state = { files: [], kind: "", demo: false };
  const $ = id => document.getElementById(id);
  const els = {
    input: $("districtFileInput"), browse: $("districtBrowseButton"), demo: $("districtDemoButton"),
    drop: $("districtDropZone"), status: $("districtStatus"), workspace: $("districtWorkspace"),
    view: $("districtView"), viewHelp: $("districtViewHelp"),
    districtWrap: $("districtFilterWrap"), district: $("districtFilter"),
    periodWrap: $("districtPeriodWrap"), period: $("districtPeriod"),
    trendWrap: $("districtTrendWrap"), trendPreset: $("districtTrendPreset"), trendStart: $("districtTrendStart"), trendEnd: $("districtTrendEnd"),
    programWrap: $("districtProgramWrap"), program: $("districtProgram"), extraWrap: $("districtExtraWrap"),
    extraLabel: $("districtExtraLabel"), extra: $("districtExtra"), measure: $("districtMeasure"),
    focus: $("districtFocus"), choices: $("districtCollegeChoices"), stats: $("districtStats"),
    chart: $("districtChart"), body: $("districtResultsBody"), title: $("districtResultTitle"),
    meta: $("districtResultMeta"), caution: $("districtCaution"), meaning: $("districtMeaning"),
    method: $("districtMethod"), caption: $("districtCaption"), tableHead: $("districtTableHead"), valueHeader: $("districtValueHeader"),
    shareHeader: $("districtShareHeader"), download: $("districtDownloadCsv"), copy: $("districtCopyMethod"),
    reset: $("districtReset")
  };

  const kindLabels = {
    "course-details": "Course Details",
    "program-awards": "Program Awards",
    "retention-success": "Success & Retention",
    "grade-distribution": "Grade Distribution",
    "student-headcount": "Student Headcount"
  };

  els.browse.addEventListener("click", () => els.input.click());
  els.input.addEventListener("change", () => loadFiles([...els.input.files]));
  els.demo.addEventListener("click", loadDemo);
  els.reset.addEventListener("click", resetAll);
  [els.view, els.district, els.period, els.trendStart, els.trendEnd, els.program, els.extra, els.measure, els.focus].forEach(node => node.addEventListener("change", () => {
    if (node === els.trendStart || node === els.trendEnd) syncTrendPreset();
    if (node === els.view || node === els.trendStart || node === els.trendEnd) updateViewControls();
    rebuildCollegeChoices(false);
    render();
  }));
  els.trendPreset.addEventListener("change", () => {
    applyTrendPreset(els.trendPreset.value);
    rebuildCollegeChoices(false);
    render();
  });
  els.choices.addEventListener("change", render);
  els.download.addEventListener("click", downloadCsv);
  els.copy.addEventListener("click", copyMethod);
  ["dragenter", "dragover"].forEach(type => els.drop.addEventListener(type, event => { event.preventDefault(); els.drop.classList.add("dragover"); }));
  ["dragleave", "drop"].forEach(type => els.drop.addEventListener(type, event => { event.preventDefault(); els.drop.classList.remove("dragover"); }));
  els.drop.addEventListener("drop", event => loadFiles([...event.dataTransfer.files]));

  setStatus("District Compare is ready. Choose files or try the built-in example.");
  if (new URLSearchParams(globalThis.location ? globalThis.location.search : "").get("demo") === "1") loadDemo();

  function parseRows(rows, kind) {
    if (kind === "course-details") return DataMartParsers.parseCourseDetails(rows);
    if (kind === "program-awards") return DataMartParsers.parseProgramAwards(rows);
    if (kind === "retention-success") return DataMartParsers.parseRetentionSuccess(rows);
    if (kind === "grade-distribution") return DataMartParsers.parseGradeDistribution(rows);
    if (kind === "student-headcount") return DataMartParsers.parseStudentHeadcount(rows);
    return null;
  }

  async function loadFiles(files) {
    if (!files.length) return;
    if (files.length > 20) return setStatus("Choose no more than 20 files at a time.", true);
    setStatus(`Reading ${files.length} file${files.length === 1 ? "" : "s"}...`);
    const loaded = [];
    try {
      for (const file of files) {
        const { rows } = await DataMartFileSecurity.readRows(file, { allowCsv: true, defval: "" });
        const detection = DataMartParsers.detectReport(rows);
        if (!kindLabels[detection.kind]) throw new Error(`${file.name}: District Compare does not yet have report-specific support for this export.`);
        const parsed = parseRows(rows, detection.kind);
        if (!parsed || parsed.error) throw new Error(`${file.name}: ${parsed && parsed.error ? parsed.error : "The report structure could not be read."}`);
        loaded.push({ name: file.name, kind: detection.kind, parsed, rows });
      }
      const kinds = [...new Set(loaded.map(item => item.kind))];
      if (kinds.length !== 1) throw new Error("These files come from different Data Mart reports. Use files from the same report for one district comparison.");
      state.files = loaded;
      state.kind = kinds[0];
      state.demo = false;
      initialize();
      setStatus(`${loaded.length} ${kindLabels[state.kind]} file${loaded.length === 1 ? "" : "s"} ready.`);
    } catch (error) {
      state.files = [];
      state.kind = "";
      els.workspace.hidden = true;
      setStatus(error.message || "The files could not be read.", true);
    }
  }

  function loadDemo() {
    state.demo = true;
    state.kind = "program-awards";
    state.files = [{
      name: "Built-in LACCD English awards example",
      kind: "program-awards",
      rows: [],
      parsed: {
        kind: "program-awards", district: "Los Angeles CCD", period: "Annual 2025-2026", reportTitle: "Program Awards Summary Report",
        records: [
          ["East LA",24],["LA City",17],["LA Harbor",9],["LA Mission",12],["LA Pierce",15],["LA Southwest",5],["LA Trade",2],["LA Valley",21],["West LA",12]
        ].map(([college,count]) => ({district:"Los Angeles CCD",college,awardType:"All award types",program:"English",top:"150100",count,period:"Annual 2025-2026"}))
      }
    }];
    initialize();
    setStatus("9-college LACCD example loaded. This is a built-in demonstration from a previously tested Program Awards export, not a live Data Mart feed.");
  }

  function initialize() {
    els.workspace.hidden = false;
    configureControls();
    rebuildCollegeChoices(true);
    render();
    els.workspace.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function allRecords() {
    return state.files.flatMap(file => file.parsed.records || []);
  }

  function unique(values) {
    return [...new Set(values.filter(value => value !== null && value !== undefined && String(value).trim() !== "").map(value => String(value).trim()))].sort((a,b) => a.localeCompare(b));
  }

  const LACCD_COLLEGES = ["East LA", "LA City", "LA Harbor", "LA Mission", "LA Pierce", "LA Southwest", "LA Trade", "LA Valley", "West LA"];

  function awardTypeLabel(value) {
    const text = String(value || "").trim();
    if (text === "All award types") return "All award types";
    if (/Associate of Arts \(A\.A\.\)/i.test(text)) return "Associate of Arts (A.A.)";
    if (/Associate in Arts for Transfer \(A\.A\.-T\)/i.test(text)) return "Associate in Arts for Transfer (A.A.-T)";
    if (/Associate of Science \(A\.S\.\)/i.test(text)) return "Associate of Science (A.S.)";
    if (/Associate in Science for Transfer \(A\.S\.-T\)/i.test(text)) return "Associate in Science for Transfer (A.S.-T)";
    return text.replace(/\s+degree$/i, "").trim();
  }

  function setOptions(select, values, labeler) {
    const prior = select.value;
    select.innerHTML = "";
    values.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = labeler ? labeler(value) : value;
      select.append(option);
    });
    if (values.includes(prior)) select.value = prior;
  }

  function periodOrder(period) {
    const text = String(period || "").trim();
    let match = text.match(/(?:Annual\s+)?(\d{4})-(\d{4})/i);
    if (match) return Number(match[1]) * 10 + 5;
    match = text.match(/^(Winter|Spring|Summer|Fall)\s+(\d{4})$/i);
    if (match) {
      const term = {winter:0,spring:1,summer:2,fall:3}[match[1].toLowerCase()];
      return Number(match[2]) * 10 + term;
    }
    return Number.MAX_SAFE_INTEGER;
  }

  function sortedPeriods(records) {
    return unique(records.map(r => r.period || r.term)).sort((a,b) => periodOrder(a) - periodOrder(b) || a.localeCompare(b));
  }

  function isTrendMode() {
    return els.view.value === "trend" && state.kind === "program-awards" && !els.view.options[1].disabled;
  }

  function updateViewControls() {
    const trend = isTrendMode();
    els.periodWrap.hidden = trend;
    els.trendWrap.hidden = !trend;
    els.viewHelp.textContent = state.kind === "program-awards" && !els.view.options[1].disabled
      ? "Compare one year with bars, or follow the same colleges across several annual periods with a line graph."
      : "Trend view is currently available for Program Awards exports that contain two or more annual periods.";
  }

  function applyTrendPreset(value) {
    const periods = sortedPeriods(allRecords());
    if (!periods.length || value === "custom") return;
    els.trendEnd.value = periods[periods.length - 1];
    if (value === "all") els.trendStart.value = periods[0];
    else if (value === "latest10") els.trendStart.value = periods[Math.max(0, periods.length - 10)];
    else els.trendStart.value = periods[Math.max(0, periods.length - 5)];
    updateViewControls();
  }

  function syncTrendPreset() {
    const periods = sortedPeriods(allRecords());
    if (!periods.length) return;
    const start = els.trendStart.value;
    const end = els.trendEnd.value;
    const last = periods[periods.length - 1];
    if (end !== last) { els.trendPreset.value = "custom"; return; }
    if (start === periods[0]) { els.trendPreset.value = "all"; return; }
    if (start === periods[Math.max(0, periods.length - 10)]) { els.trendPreset.value = "latest10"; return; }
    if (start === periods[Math.max(0, periods.length - 5)]) { els.trendPreset.value = "latest5"; return; }
    els.trendPreset.value = "custom";
  }

  function configureControls() {
    const records = allRecords();
    const districts = unique(records.map(r => r.district));
    els.districtWrap.hidden = districts.length < 2;
    setOptions(els.district, districts.length ? districts : [""]);

    let periods = sortedPeriods(records);
    if (state.kind === "student-headcount" && !periods.length) periods = unique(state.files.map(f => f.parsed.period)).sort((a,b) => periodOrder(a) - periodOrder(b));
    setOptions(els.period, periods.length ? periods : ["Period not identified"]);
    setOptions(els.trendStart, periods.length ? periods : ["Period not identified"]);
    setOptions(els.trendEnd, periods.length ? periods : ["Period not identified"]);
    const trendOption = els.view.querySelector('option[value="trend"]');
    const trendAvailable = state.kind === "program-awards" && periods.length >= 2;
    trendOption.disabled = !trendAvailable;
    if (!trendAvailable) els.view.value = "compare";
    if (periods.length) {
      els.period.value = periods[periods.length - 1];
      els.trendEnd.value = periods[periods.length - 1];
      els.trendStart.value = periods[Math.max(0, periods.length - 5)];
    }
    els.trendPreset.value = "latest5";
    updateViewControls();

    if (state.kind === "student-headcount") {
      els.programWrap.hidden = true;
      setOptions(els.program, ["All students"]);
    } else {
      els.programWrap.hidden = false;
      const programs = unique(records.map(r => r.top ? `${r.top}|${r.program || r.topName || "Program"}` : ""));
      setOptions(els.program, programs, value => { const [top,name] = value.split("|"); return `${name} (${top})`; });
    }

    els.extraWrap.hidden = true;
    if (state.kind === "program-awards") {
      els.extraWrap.hidden = false;
      els.extraLabel.textContent = "Award type";
      setOptions(els.extra, ["All award types", ...unique(records.map(r => r.awardType).filter(v => v && v !== "All award types"))], awardTypeLabel);
      setOptions(els.measure, ["awards"], () => "Awards granted");
    } else if (state.kind === "retention-success") {
      els.extraWrap.hidden = false;
      els.extraLabel.textContent = "Course population";
      const pops = unique(records.flatMap(r => Object.keys(r.measures || {})));
      setOptions(els.extra, pops.length ? pops : ["Credit"]);
      setOptions(els.measure, ["successRate","retentionRate","enrollment"], value => ({successRate:"Course success",retentionRate:"Course retention",enrollment:"Course enrollments"}[value]));
    } else if (state.kind === "course-details") {
      setOptions(els.measure, ["sections","courses"], value => value === "sections" ? "Reported sections" : "Course records");
    } else if (state.kind === "grade-distribution") {
      setOptions(els.measure, ["grades"], () => "Reported grade records");
    } else if (state.kind === "student-headcount") {
      setOptions(els.measure, ["headcount"], () => "Distinct students");
    }
  }

  function currentFilter() {
    const programParts = els.program.value.split("|");
    return {
      district: els.district.value, period: els.period.value, top: programParts[0] || "",
      extra: els.extra.value, measure: els.measure.value,
      trendStart: els.trendStart.value, trendEnd: els.trendEnd.value
    };
  }

  function filteredRecords() {
    const f = currentFilter();
    return allRecords().filter(r => {
      if (f.district && r.district && r.district !== f.district) return false;
      const period = r.period || r.term || "";
      if (f.period && f.period !== "Period not identified" && period && period !== f.period) return false;
      if (!els.programWrap.hidden && f.top && r.top !== f.top) return false;
      return true;
    });
  }

  function valuesByCollege() {
    const f = currentFilter();
    if (state.kind === "student-headcount") return headcountValues(f.period);
    const records = filteredRecords();
    const map = new Map();
    if (state.kind === "program-awards") {
      records.forEach(r => {
        if (f.extra !== "All award types" && r.awardType !== f.extra) return;
        map.set(r.college, (map.get(r.college) || 0) + (Number(r.count) || 0));
      });
    } else if (state.kind === "course-details") {
      records.forEach(r => {
        const current = map.get(r.college) || { sections: 0, courses: 0 };
        current.sections += Number(r.sections) || 0;
        current.courses += 1;
        map.set(r.college, current);
      });
      for (const [college, v] of map) map.set(college, f.measure === "sections" ? v.sections : v.courses);
    } else if (state.kind === "grade-distribution") {
      records.forEach(r => map.set(r.college, (map.get(r.college) || 0) + (Number(r.count) || 0)));
    } else if (state.kind === "retention-success") {
      const agg = new Map();
      records.forEach(r => {
        const m = (r.measures || {})[f.extra];
        if (!m) return;
        const current = agg.get(r.college) || { enrollment:0, retention:0, success:0 };
        current.enrollment += Number(m.enrollment) || 0;
        current.retention += Number(m.retention) || 0;
        current.success += Number(m.success) || 0;
        agg.set(r.college, current);
      });
      for (const [college, v] of agg) {
        const value = f.measure === "successRate" ? (v.enrollment ? v.success / v.enrollment : null) : f.measure === "retentionRate" ? (v.enrollment ? v.retention / v.enrollment : null) : v.enrollment;
        if (value !== null) map.set(college, value);
      }
    }
    return map;
  }

  function headcountValues(period) {
    const map = new Map();
    state.files.forEach(file => {
      const rows = file.rows || [];
      const headerIndex = rows.findIndex(row => (row || []).map(DataMartParsers.clean).includes("Student Count"));
      if (headerIndex < 0) return;
      const header = rows[headerIndex] || [];
      const countCol = header.findIndex(cell => DataMartParsers.clean(cell) === "Student Count");
      for (let i = headerIndex + 1; i < rows.length; i += 1) {
        const row = rows[i] || [];
        const label = DataMartParsers.clean(row[0]);
        const count = DataMartParsers.numberValue(row[countCol]);
        if (!label || !/\sTotal$/i.test(label) || count === null) continue;
        const college = DataMartParsers.normalizeCollegeName(label.replace(/\s+Total$/i, "").trim());
        if (/statewide|districtwide|\bCCD\b|district$/i.test(college)) continue;
        map.set(college, count);
      }
    });
    return map;
  }

  function trendPeriods() {
    const f = currentFilter();
    const periods = sortedPeriods(allRecords());
    if (!periods.length) return [];
    const startOrder = periodOrder(f.trendStart);
    const endOrder = periodOrder(f.trendEnd);
    const low = Math.min(startOrder, endOrder);
    const high = Math.max(startOrder, endOrder);
    return periods.filter(p => { const order = periodOrder(p); return order >= low && order <= high; });
  }

  function trendSeriesByCollege() {
    if (!isTrendMode()) return new Map();
    const f = currentFilter();
    const periods = trendPeriods();
    const allowed = new Set(periods);
    const records = allRecords().filter(r => {
      if (f.district && r.district && r.district !== f.district) return false;
      if (f.top && r.top !== f.top) return false;
      if (!allowed.has(r.period || r.term || "")) return false;
      if (f.extra !== "All award types" && r.awardType !== f.extra) return false;
      return true;
    });
    const series = new Map();
    records.forEach(r => {
      if (!r.college) return;
      if (!series.has(r.college)) series.set(r.college, new Map());
      const collegeMap = series.get(r.college);
      const period = r.period || r.term || "";
      collegeMap.set(period, (collegeMap.get(period) || 0) + (Number(r.count) || 0));
    });
    return series;
  }

  function collegeUniverse() {
    if (isTrendMode()) {
      const found = [...trendSeriesByCollege().keys()];
      const f = currentFilter();
      const districtName = f.district || unique(allRecords().map(r => r.district))[0] || "";
      if (/Los Angeles CCD/i.test(districtName)) return unique([...LACCD_COLLEGES, ...found]);
      return found;
    }
    return [...valuesByCollege().keys()];
  }

  function rebuildCollegeChoices(selectAll) {
    const prior = new Set([...els.choices.querySelectorAll("input:checked")].map(x => x.value));
    const colleges = collegeUniverse().filter(Boolean).sort((a,b) => a.localeCompare(b));
    els.choices.innerHTML = "";
    colleges.forEach(college => {
      const label = document.createElement("label"); label.className = "check-chip";
      const input = document.createElement("input"); input.type = "checkbox"; input.value = college; input.checked = selectAll || prior.size === 0 || prior.has(college);
      const span = document.createElement("span"); span.textContent = college;
      label.append(input, span); els.choices.append(label);
    });
    const focusPrior = els.focus.value;
    setOptions(els.focus, ["", ...colleges], value => value || "No highlight");
    if (colleges.includes(focusPrior)) els.focus.value = focusPrior;
  }

  function selectedTrendSeries() {
    const selected = new Set([...els.choices.querySelectorAll("input:checked")].map(x => x.value));
    const periods = trendPeriods();
    const all = trendSeriesByCollege();
    return [...selected]
      .map(college => {
        const values = all.get(college) || new Map();
        return {
          college,
          points: periods.map(period => ({ period, value: values.has(period) ? values.get(period) : null }))
        };
      })
      .sort((a,b) => a.college.localeCompare(b.college));
  }

  function selectedResults() {
    const selected = new Set([...els.choices.querySelectorAll("input:checked")].map(x => x.value));
    const values = valuesByCollege();
    return [...values.entries()].filter(([college]) => selected.has(college)).map(([college,value]) => ({college,value})).filter(x => Number.isFinite(x.value)).sort((a,b) => b.value - a.value || a.college.localeCompare(b.college));
  }

  function median(values) {
    if (!values.length) return null;
    const sorted = [...values].sort((a,b) => a-b); const mid = Math.floor(sorted.length/2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
  }

  function isRate() { return state.kind === "retention-success" && ["successRate","retentionRate"].includes(els.measure.value); }
  function formatValue(value) { return isRate() ? `${(value * 100).toFixed(1)}%` : Number(value).toLocaleString(undefined,{maximumFractionDigits:2}); }
  function measureLabel() { return els.measure.options[els.measure.selectedIndex] ? els.measure.options[els.measure.selectedIndex].textContent : "Value"; }
  function programLabel() { return els.programWrap.hidden ? "All students" : (els.program.options[els.program.selectedIndex] ? els.program.options[els.program.selectedIndex].textContent : "Selected program"); }

  function render() {
    if (els.workspace.hidden) return;
    if (isTrendMode()) {
      renderTrend();
      return;
    }
    renderComparison();
  }

  function resetComparisonHead() {
    els.tableHead.innerHTML = `<tr><th scope="col">College</th><th id="districtValueHeader" scope="col">${escapeHtml(measureLabel())}</th><th scope="col">Difference from median</th><th id="districtShareHeader" scope="col">${isRate() ? "Share not applicable" : "Share of selected total"}</th></tr>`;
    els.valueHeader = $("districtValueHeader");
    els.shareHeader = $("districtShareHeader");
  }

  function renderComparison() {
    const results = selectedResults();
    if (!results.length) {
      els.chart.innerHTML = "<p class=\"empty-state\">Choose at least one college to display.</p>";
      els.body.innerHTML = ""; els.stats.innerHTML = ""; return;
    }
    resetComparisonHead();
    const med = median(results.map(r => r.value));
    const total = results.reduce((sum,r) => sum+r.value, 0);
    const max = Math.max(...results.map(r => r.value), 0);
    const focus = els.focus.value;
    const districtName = els.districtWrap.hidden ? "Selected district" : els.district.value;
    const period = els.period.value;
    const label = measureLabel();
    els.title.textContent = `${programLabel()} across ${results.length} college${results.length === 1 ? "" : "s"}`;
    els.meta.textContent = `${label} • ${period}${els.districtWrap.hidden ? "" : ` • ${districtName}`}`;
    els.caption.textContent = `${label} for ${programLabel()} across selected colleges`;
    els.caution.innerHTML = cautionText(results.length);
    els.stats.innerHTML = statCard("Colleges", results.length) + statCard("Median", formatValue(med)) + statCard("Highest", formatValue(results[0].value));
    els.chart.setAttribute("aria-label", "College comparison bar chart");

    els.chart.innerHTML = "";
    results.forEach(item => {
      const row = document.createElement("div"); row.className = "district-bar-row" + (item.college === focus ? " is-focus" : "");
      const name = document.createElement("div"); name.className = "district-bar-label"; name.textContent = `${item.college === focus ? "★ " : ""}${item.college}`;
      const track = document.createElement("div"); track.className = "district-bar-track";
      const fill = document.createElement("div"); fill.className = "district-bar-fill"; fill.style.width = `${max ? Math.max(2, item.value / max * 100) : 0}%`;
      const value = document.createElement("span"); value.className = "district-bar-value"; value.textContent = formatValue(item.value);
      track.append(fill); row.append(name, track, value); els.chart.append(row);
    });

    els.body.innerHTML = "";
    results.forEach(item => {
      const tr = document.createElement("tr"); if (item.college === focus) tr.className = "focus-row";
      const diff = item.value - med;
      const share = isRate() ? "Not applicable" : (total ? `${(item.value / total * 100).toFixed(1)}%` : "Not available");
      [item.college === focus ? `★ ${item.college}` : item.college, formatValue(item.value), `${diff >= 0 ? "+" : ""}${formatValue(diff)}`, share].forEach((text,i) => { const cell = document.createElement(i===0 ? "th" : "td"); if (i===0) cell.scope="row"; cell.textContent=text; tr.append(cell); });
      els.body.append(tr);
    });

    const high = results[0], low = results[results.length-1];
    els.meaning.textContent = results.length > 1 ? `Among the ${results.length} selected colleges, ${high.college} has the highest reported ${label.toLowerCase()} (${formatValue(high.value)}), while ${low.college} has the lowest (${formatValue(low.value)}). This is a descriptive comparison, not a quality ranking.` : `The selected college reports ${formatValue(high.value)} for ${label.toLowerCase()}. Add more colleges to create a district comparison.`;
    els.method.textContent = buildMethod(results);
    setStatus(`Comparison updated: ${results.length} college${results.length === 1 ? "" : "s"}, ${label}, ${period}.`);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
  }

  function renderTrend() {
    const series = selectedTrendSeries();
    const periods = trendPeriods();
    if (!series.length || periods.length < 2) {
      els.chart.innerHTML = `<p class="empty-state">Choose at least one college and at least two periods to build a trend.</p>`;
      els.body.innerHTML = ""; els.stats.innerHTML = ""; return;
    }
    const label = measureLabel();
    const validValues = series.flatMap(s => s.points.map(p => p.value).filter(v => Number.isFinite(Number(v))));
    const latestPeriod = periods[periods.length - 1];
    const firstPeriod = periods[0];
    const latestValues = series.map(s => ({college:s.college, value:s.points[s.points.length-1].value})).filter(x => Number.isFinite(Number(x.value)));
    const changes = series.map(s => {
      const first = s.points.find(p => Number.isFinite(Number(p.value)));
      const last = [...s.points].reverse().find(p => Number.isFinite(Number(p.value)));
      return { college:s.college, first:first ? first.value : null, last:last ? last.value : null, change:first && last ? Number(last.value)-Number(first.value) : null };
    }).filter(x => Number.isFinite(Number(x.change)));
    const largestIncrease = [...changes].sort((a,b) => b.change-a.change)[0];
    const awardLabel = state.kind === "program-awards" ? awardTypeLabel(els.extra.value) : "";
    els.title.textContent = `${awardLabel && awardLabel !== "All award types" ? `${awardLabel} awards in ` : ""}${programLabel()} across ${series.length} college${series.length === 1 ? "" : "s"} over time`;
    els.meta.textContent = `${label}${awardLabel ? ` • ${awardLabel}` : ""} • ${firstPeriod} to ${latestPeriod}`;
    els.caption.textContent = `${label} by college from ${firstPeriod} through ${latestPeriod}`;
    els.caution.innerHTML = trendCautionText(series, periods);
    const latestTotal = latestValues.reduce((sum,item)=>sum+Number(item.value),0);
    const collegesWithData = series.filter(s => s.points.some(p => Number.isFinite(Number(p.value)))).length;
    els.stats.innerHTML = statCard("Colleges selected", series.length) + statCard("With returned data", collegesWithData) + statCard("Periods", periods.length) + statCard(`Selected total, ${latestPeriod.replace(/^Annual\s+/i,"")}`, formatValue(latestTotal));
    els.chart.setAttribute("aria-label", `Line chart following ${series.length} colleges from ${firstPeriod} through ${latestPeriod}`);
    renderMultiLineChart(series, periods, label);
    renderTrendTable(series, periods);
    if (largestIncrease) {
      const direction = largestIncrease.change > 0 ? "increased" : largestIncrease.change < 0 ? "decreased" : "did not change";
      els.meaning.textContent = `This view follows each selected college across the same ${periods.length} annual periods. ${largestIncrease.college} has the largest numeric increase among colleges with values at both ends of the selected range (${largestIncrease.change >= 0 ? "+" : ""}${formatValue(largestIncrease.change)}). Use the lines to see direction and volatility, not to rank program quality.`;
    } else {
      els.meaning.textContent = `This view follows each selected college across the same ${periods.length} annual periods. Missing values stay missing, so a line may have a gap rather than an invented zero.`;
    }
    els.method.textContent = buildTrendMethod(series, periods);
    setStatus(`Trend updated: ${series.length} college${series.length === 1 ? "" : "s"}, ${periods.length} annual periods, ${firstPeriod} through ${latestPeriod}.`);
  }

  function trendCautionText(series, periods) {
    const expectedCells = series.length * periods.length;
    const observed = series.reduce((sum,s) => sum + s.points.filter(p => Number.isFinite(Number(p.value))).length, 0);
    let text = `<strong>Follow the pattern, not just the endpoints.</strong> The same Program Awards definition and award filter are applied across ${periods.length} annual periods.`;
    if (observed < expectedCells) text += " At least one college-period value is absent from the export. Missing values are left blank and are not converted to zero.";
    text += " Award count is not unique graduate headcount. A college omitted from the export is not assumed to have zero awards.";
    if (state.demo) text += " The built-in example is a demonstration and is not a live data feed.";
    return text;
  }

  function renderTrendTable(series, periods) {
    els.tableHead.innerHTML = `<tr><th scope="col">College</th>${periods.map(p => `<th scope="col">${escapeHtml(p.replace(/^Annual\s+/i,""))}</th>`).join("")}<th scope="col">First to latest</th></tr>`;
    const focus = els.focus.value;
    els.body.innerHTML = "";
    series.forEach(s => {
      const tr = document.createElement("tr"); if (s.college === focus) tr.className = "focus-row";
      const th = document.createElement("th"); th.scope = "row"; th.textContent = `${s.college === focus ? "★ " : ""}${s.college}`; tr.append(th);
      s.points.forEach(p => { const td=document.createElement("td"); td.className="numeric"; td.textContent = Number.isFinite(Number(p.value)) ? formatValue(p.value) : "Not available"; tr.append(td); });
      const first = s.points.find(p => Number.isFinite(Number(p.value)));
      const last = [...s.points].reverse().find(p => Number.isFinite(Number(p.value)));
      const td=document.createElement("td"); td.className="numeric"; td.textContent = first && last ? `${Number(last.value)-Number(first.value) >= 0 ? "+" : ""}${formatValue(Number(last.value)-Number(first.value))}` : "Not available"; tr.append(td);
      els.body.append(tr);
    });
  }

  function renderMultiLineChart(series, periods, label) {
    const width = 920, height = 500, left = 64, right = 28, top = 30, bottom = 60;
    const values = series.flatMap(s => s.points.map(p => Number(p.value)).filter(Number.isFinite));
    const maxRaw = Math.max(...values, 0);

    const niceStep = value => {
      if (!(value > 0)) return 1;
      const rough = value / 4;
      const magnitude = 10 ** Math.floor(Math.log10(rough));
      const normalized = rough / magnitude;
      const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
      return Math.max(1, nice * magnitude);
    };
    const step = niceStep(maxRaw);
    const max = maxRaw > 0 ? Math.ceil(maxRaw / step) * step : step;
    const tickCount = Math.max(1, Math.round(max / step));
    const ticks = Array.from({length: tickCount + 1}, (_, i) => i * step);

    const x = i => left + (periods.length === 1 ? 0 : i * (width-left-right)/(periods.length-1));
    const y = v => top + (max-v)/max*(height-top-bottom);
    const colors = ["#1f5f99","#8b3f87","#087c78","#9a6700","#7b4b2a","#4b6584","#b03a2e","#526b2d","#6a5acd"];
    const dashes = ["","10 4","3 4","12 3 3 3","16 5","6 3","14 3 2 3","8 2 2 2","2 3"];
    const compactPeriod = period => {
      const clean = String(period || "").replace(/^Annual\s+/i, "");
      const match = clean.match(/^(\d{4})-(\d{4})$/);
      return match ? `${match[1]}–${match[2].slice(2)}` : clean;
    };

    const grid = ticks.map(value => {
      const yy = y(value);
      return `<line x1="${left}" y1="${yy}" x2="${width-right}" y2="${yy}" class="trend-grid"></line><text x="${left-10}" y="${yy+4}" text-anchor="end" class="trend-axis-label">${escapeHtml(formatValue(value))}</text>`;
    }).join("");
    const xLabels = periods.map((p,i)=>`<text x="${x(i)}" y="${height-bottom+32}" text-anchor="middle" class="trend-x-label">${escapeHtml(compactPeriod(p))}</text>`).join("");
    const focus = els.focus.value;
    let paths = "";
    const legendItems = [];

    series.forEach((s,idx) => {
      const color = colors[idx % colors.length];
      const dash = dashes[idx % dashes.length];
      const segments = [];
      let current = [];
      s.points.forEach((p,i)=>{
        if (Number.isFinite(Number(p.value))) current.push(`${x(i)},${y(Number(p.value))}`);
        else if (current.length) { segments.push(current); current=[]; }
      });
      if (current.length) segments.push(current);
      const opacity = focus && s.college !== focus ? .76 : .94;
      const lineWidth = s.college === focus ? 5.5 : 3.2;
      segments.forEach(seg => {
        if (seg.length >= 2) paths += `<polyline points="${seg.join(" ")}" fill="none" stroke="${color}" stroke-width="${lineWidth}" ${dash ? `stroke-dasharray="${dash}"` : ""} opacity="${opacity}" vector-effect="non-scaling-stroke" class="district-trend-line"></polyline>`;
      });
      s.points.forEach((p,i)=>{
        if (Number.isFinite(Number(p.value))) paths += `<circle cx="${x(i)}" cy="${y(Number(p.value))}" r="${s.college===focus ? 5.5 : 4}" fill="${color}" stroke="#fff" stroke-width="1.6" opacity="${opacity}" vector-effect="non-scaling-stroke"><title>${escapeHtml(`${s.college}, ${p.period}: ${formatValue(p.value)}`)}</title></circle>`;
      });
      const last = [...s.points].reverse().find(p => Number.isFinite(Number(p.value)));
      legendItems.push({
        college: s.college,
        value: last ? formatValue(last.value) : "Not available",
        color,
        dash,
        opacity,
        focused: s.college === focus
      });
    });

    const legend = legendItems.map(item => `
      <div class="district-trend-legend-item${item.focused ? " is-focus" : ""}" role="listitem">
        <svg class="district-trend-legend-swatch" viewBox="0 0 36 10" aria-hidden="true" focusable="false"><line x1="2" y1="5" x2="34" y2="5" stroke="${item.color}" stroke-width="3" ${item.dash ? `stroke-dasharray="${item.dash}"` : ""} opacity="${item.opacity}" vector-effect="non-scaling-stroke"></line></svg>
        <span class="district-trend-legend-name">${escapeHtml(item.focused ? `★ ${item.college}` : item.college)}</span>
        <span class="district-trend-legend-value" aria-label="Latest returned value ${escapeHtml(item.value)}">${escapeHtml(item.value)}</span>
      </div>`).join("");

    const desc = `Line chart comparing ${series.length} selected colleges across ${periods.length} annual periods. Each college uses a distinct color and line pattern. Missing values remain missing. Exact values are provided in the table following the chart.`;
    els.chart.innerHTML = `<div class="district-trend-frame"><div class="trend-chart-scroll" role="region" tabindex="0" aria-label="Scrollable district trend chart"><svg class="district-trend-chart" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="districtTrendTitle districtTrendDesc"><title id="districtTrendTitle">${escapeHtml(label)} by college over time</title><desc id="districtTrendDesc">${escapeHtml(desc)}</desc>${grid}${xLabels}${paths}</svg></div><div class="district-trend-legend" role="list" aria-label="College line legend and latest returned value">${legend}</div></div><p class="small-note">Each college keeps the same color and line pattern across years. Hover a point for its value, or use the table below for exact values. “Highlight my college” emphasizes one line without hiding the others.</p>`;
  }

  function buildTrendMethod(series, periods) {
    return [
      `Source: CCC Data Mart`,
      `Report: ${kindLabels[state.kind]}`,
      `Periods: ${periods.join("; ")}`,
      `District: ${els.districtWrap.hidden ? "District represented by the selected export(s)" : els.district.value}`,
      `Program: ${programLabel()}`,
      `${els.extraWrap.hidden ? "" : `${els.extraLabel.textContent}: ${els.extra.value}\n`}Measure: ${measureLabel()}`,
      `Trend range preset: ${els.trendPreset.options[els.trendPreset.selectedIndex] ? els.trendPreset.options[els.trendPreset.selectedIndex].textContent : "Custom"}`,
      `Colleges followed: ${series.map(s => s.college).join(", ")}`,
      `Files used: ${state.files.map(f => f.name).join(", ")}`,
      `Special handling: Missing college-period values remain missing and are not converted to zero. Award counts are not unique graduate headcounts.`
    ].filter(Boolean).join("\n");
  }

  function cautionText(count) {
    let text = `<strong>Use the comparison descriptively.</strong> These ${count} colleges are being compared with the same report, period, program selection, and measure.`;
    if (state.kind === "course-details") text += " Reported section records may not equal locally understood classes when linked instructional components are involved.";
    if (state.kind === "program-awards") text += " Award count is not unique graduate headcount.";
    if (state.kind === "retention-success") text += " Rates are recalculated from enrollment, retention, and success counts. Displayed percentages are not averaged.";
    if (state.kind === "student-headcount") text += " Do not add college headcounts to recreate a districtwide distinct-student total because a student can attend more than one college.";
    if (state.demo) text += " The LACCD example is a built-in demonstration and is not a live data feed.";
    return text;
  }

  function statCard(label,value) { return `<div class="district-stat"><span>${label}</span><strong>${value}</strong></div>`; }

  function buildMethod(results) {
    return [
      `Source: CCC Data Mart`,
      `Report: ${kindLabels[state.kind]}`,
      `Period: ${els.period.value}`,
      `District: ${els.districtWrap.hidden ? "District represented by the selected export(s)" : els.district.value}`,
      `Program: ${programLabel()}`,
      `${els.extraWrap.hidden ? "" : `${els.extraLabel.textContent}: ${els.extra.value}\n`}Measure: ${measureLabel()}`,
      `Colleges compared: ${results.map(r => r.college).join(", ")}`,
      `Files used: ${state.files.map(f => f.name).join(", ")}`,
      `Special handling: ${state.kind === "retention-success" ? "Rates recalculated from underlying counts across included modality rows." : "Values aggregated only within the selected report, program, period, and measure."}`
    ].filter(Boolean).join("\n");
  }

  function downloadCsv() {
    let rows;
    if (isTrendMode()) {
      const periods = trendPeriods();
      const series = selectedTrendSeries();
      if (!series.length) return;
      rows = [["College", ...periods, "First to latest"]];
      series.forEach(s => {
        const first = s.points.find(p => Number.isFinite(Number(p.value)));
        const last = [...s.points].reverse().find(p => Number.isFinite(Number(p.value)));
        const change = first && last ? Number(last.value)-Number(first.value) : "";
        rows.push([s.college, ...s.points.map(p => Number.isFinite(Number(p.value)) ? p.value : ""), change]);
      });
    } else {
      const results = selectedResults(); if (!results.length) return;
      const med = median(results.map(r => r.value)); const total = results.reduce((s,r)=>s+r.value,0);
      rows = [["College",measureLabel(),"Difference from median",isRate()?"Share not applicable":"Share of selected total"]];
      results.forEach(r => rows.push([r.college, isRate() ? (r.value*100).toFixed(1)+"%" : r.value, r.value-med, isRate()?"":(total ? (r.value/total*100).toFixed(1)+"%":"")]));
    }
    const csv = rows.map(row => row.map(DataMartFileSecurity.csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=isTrendMode()?"data-mart-smart-district-trend.csv":"data-mart-smart-district-comparison.csv"; document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  async function copyMethod() {
    try { await navigator.clipboard.writeText(els.method.textContent); els.copy.textContent = "Method copied"; setTimeout(()=>els.copy.textContent="Copy method",1800); }
    catch { setStatus("Your browser did not allow automatic copying. Select the method text and copy it manually.", true); }
  }

  function resetAll() {
    state.files=[]; state.kind=""; state.demo=false; els.input.value=""; els.workspace.hidden=true; els.status.textContent=""; els.browse.focus();
  }

  function setStatus(message,error=false) { els.status.textContent=message; els.status.classList.toggle("status-error",error); }
})();
