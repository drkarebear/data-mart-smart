"use strict";

(function () {
  const state = { files: [], kind: "", demo: false };
  const $ = id => document.getElementById(id);
  const els = {
    input: $("districtFileInput"), browse: $("districtBrowseButton"), demo: $("districtDemoButton"),
    drop: $("districtDropZone"), status: $("districtStatus"), workspace: $("districtWorkspace"),
    districtWrap: $("districtFilterWrap"), district: $("districtFilter"), period: $("districtPeriod"),
    programWrap: $("districtProgramWrap"), program: $("districtProgram"), extraWrap: $("districtExtraWrap"),
    extraLabel: $("districtExtraLabel"), extra: $("districtExtra"), measure: $("districtMeasure"),
    focus: $("districtFocus"), choices: $("districtCollegeChoices"), stats: $("districtStats"),
    chart: $("districtChart"), body: $("districtResultsBody"), title: $("districtResultTitle"),
    meta: $("districtResultMeta"), caution: $("districtCaution"), meaning: $("districtMeaning"),
    method: $("districtMethod"), caption: $("districtCaption"), valueHeader: $("districtValueHeader"),
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
  [els.district, els.period, els.program, els.extra, els.measure, els.focus].forEach(el => el.addEventListener("change", () => { rebuildCollegeChoices(false); render(); }));
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
          ["East Los Angeles College",24],["Los Angeles City College",17],["Los Angeles Harbor College",9],["Los Angeles Mission College",12],["Los Angeles Pierce College",15],["Los Angeles Southwest College",5],["Los Angeles Trade-Technical College",2],["Los Angeles Valley College",21],["West Los Angeles College",12]
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

  function configureControls() {
    const records = allRecords();
    const districts = unique(records.map(r => r.district));
    els.districtWrap.hidden = districts.length < 2;
    setOptions(els.district, districts.length ? districts : [""]);

    let periods = unique(records.map(r => r.period || r.term));
    if (state.kind === "student-headcount" && !periods.length) periods = unique(state.files.map(f => f.parsed.period));
    setOptions(els.period, periods.length ? periods : ["Period not identified"]);
    if (state.kind === "program-awards" && periods.length) els.period.value = periods[periods.length - 1];

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
      setOptions(els.extra, ["All award types", ...unique(records.map(r => r.awardType).filter(v => v && v !== "All award types"))]);
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
    return { district: els.district.value, period: els.period.value, top: programParts[0] || "", extra: els.extra.value, measure: els.measure.value };
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

  function rebuildCollegeChoices(selectAll) {
    const values = valuesByCollege();
    const prior = new Set([...els.choices.querySelectorAll("input:checked")].map(x => x.value));
    const colleges = [...values.keys()].filter(Boolean).sort((a,b) => a.localeCompare(b));
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
    const results = selectedResults();
    if (!results.length) {
      els.chart.innerHTML = "<p class=\"empty-state\">Choose at least one college to display.</p>";
      els.body.innerHTML = ""; els.stats.innerHTML = ""; return;
    }
    const med = median(results.map(r => r.value));
    const total = results.reduce((sum,r) => sum+r.value, 0);
    const max = Math.max(...results.map(r => r.value), 0);
    const focus = els.focus.value;
    const districtName = els.districtWrap.hidden ? "Selected district" : els.district.value;
    const period = els.period.value;
    const label = measureLabel();
    els.title.textContent = `${programLabel()} across ${results.length} college${results.length === 1 ? "" : "s"}`;
    els.meta.textContent = `${label} • ${period}${els.districtWrap.hidden ? "" : ` • ${districtName}`}`;
    els.valueHeader.textContent = label;
    els.shareHeader.textContent = isRate() ? "Share not applicable" : "Share of selected total";
    els.caption.textContent = `${label} for ${programLabel()} across selected colleges`;
    els.caution.innerHTML = cautionText(results.length);
    els.stats.innerHTML = statCard("Colleges", results.length) + statCard("Median", formatValue(med)) + statCard("Highest", formatValue(results[0].value));

    els.chart.innerHTML = "";
    results.forEach((item,index) => {
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
    const results = selectedResults(); if (!results.length) return;
    const med = median(results.map(r => r.value)); const total = results.reduce((s,r)=>s+r.value,0);
    const rows = [["College",measureLabel(),"Difference from median",isRate()?"Share not applicable":"Share of selected total"]];
    results.forEach(r => rows.push([r.college, isRate() ? (r.value*100).toFixed(1)+"%" : r.value, r.value-med, isRate()?"":(total ? (r.value/total*100).toFixed(1)+"%":"")]));
    const csv = rows.map(row => row.map(DataMartFileSecurity.csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="data-mart-smart-district-comparison.csv"; document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
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
