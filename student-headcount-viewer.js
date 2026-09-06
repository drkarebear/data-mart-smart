"use strict";

const headcountPageState = {
  sourceName:"",
  parsed:null
};

const headcountPageEls = {};

document.addEventListener("DOMContentLoaded", () => {
  [
    "headcountPageFileInput","headcountPageDropZone","headcountPageBrowseButton","headcountPageDemoButton","headcountPageStatus",
    "headcountPageWorkspace","headcountPageFileSummary","headcountPageBreakdown","headcountPageStatusFilter","headcountPageGenderFilter",
    "headcountPageAgeFilter","headcountPageEthnicityFilter","headcountPageMeasure","headcountPageResultsTitle","headcountPageResultMeta",
    "headcountPageKpis","headcountPageWarning","headcountPageBarChart","headcountPageCategoryHeader","headcountPageResultsBody",
    "headcountPageMethodText","headcountPageCopyMethod","headcountPageDownloadCsv","headcountPageReset"
  ].forEach(id => headcountPageEls[id] = document.getElementById(id));

  if (!headcountPageEls.headcountPageFileInput) return;

  headcountPageEls.headcountPageBrowseButton.addEventListener("click", () => headcountPageEls.headcountPageFileInput.click());
  headcountPageEls.headcountPageFileInput.addEventListener("change", e => {
    if (e.target.files && e.target.files[0]) loadHeadcountPageFile(e.target.files[0]);
  });

  ["dragenter","dragover"].forEach(evt => headcountPageEls.headcountPageDropZone.addEventListener(evt, e => {
    e.preventDefault();
    headcountPageEls.headcountPageDropZone.classList.add("is-dragging");
  }));
  ["dragleave","drop"].forEach(evt => headcountPageEls.headcountPageDropZone.addEventListener(evt, e => {
    e.preventDefault();
    headcountPageEls.headcountPageDropZone.classList.remove("is-dragging");
  }));
  headcountPageEls.headcountPageDropZone.addEventListener("drop", e => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) loadHeadcountPageFile(file);
  });

  [headcountPageEls.headcountPageBreakdown,headcountPageEls.headcountPageStatusFilter,headcountPageEls.headcountPageGenderFilter,
   headcountPageEls.headcountPageAgeFilter,headcountPageEls.headcountPageEthnicityFilter,headcountPageEls.headcountPageMeasure]
    .forEach(control => control.addEventListener("change", renderHeadcountPage));

  headcountPageEls.headcountPageDemoButton.addEventListener("click", loadHeadcountPageDemo);
  headcountPageEls.headcountPageReset.addEventListener("click", resetHeadcountPage);
  headcountPageEls.headcountPageCopyMethod.addEventListener("click", () => copyHeadcountPageText(headcountPageEls.headcountPageMethodText.textContent));
  headcountPageEls.headcountPageDownloadCsv.addEventListener("click", downloadHeadcountPageCsv);

  setHeadcountPageStatus("Ready. Choose a Student Headcount export, or try the LA Mission sample.", "neutral");
});

async function loadHeadcountPageFile(file) {
  const lower = file.name.toLowerCase();
  if (![".xlsx",".xls",".csv"].some(ext => lower.endsWith(ext))) {
    setHeadcountPageStatus("Please choose an Excel .xlsx, .xls, or CSV Data Mart export.", "error");
    return;
  }
  if (typeof XLSX === "undefined" || typeof DataMartParsers === "undefined") {
    setHeadcountPageStatus("The spreadsheet reader did not load. Check your internet connection and reload the page.", "error");
    return;
  }

  setHeadcountPageStatus(`Reading ${file.name} in your browser...`, "neutral");
  try {
    const {rows} = await DataMartFileSecurity.readRows(file, {allowCsv:true, defval:null});
    const detected = DataMartParsers.detectReport(rows);
    if (detected.kind !== "student-headcount") throw new Error(`This looks like ${detected.label}, not a Student Headcount Summary export.`);
    const parsed = DataMartParsers.parseStudentHeadcount(rows);
    if (!parsed.records.length) throw new Error("The Student Headcount report was recognized, but no detailed demographic rows could be read.");
    headcountPageState.sourceName = file.name;
    headcountPageState.parsed = parsed;
    initHeadcountPage();
    setHeadcountPageStatus(`Loaded ${parsed.records.length.toLocaleString()} detailed headcount rows. The file stayed in this browser tab.`, "success");
  } catch (err) {
    console.error(err);
    setHeadcountPageStatus(err.message || "I could not read this workbook.", "error");
  }
}

function loadHeadcountPageDemo() {
  if (!window.DMS_DEMOS || !window.DMS_DEMOS.headcount) {
    setHeadcountPageStatus("The sample data did not load. Reload the page and try again.", "error");
    return;
  }
  headcountPageState.sourceName = "Included LA Mission Student Headcount sample";
  headcountPageState.parsed = JSON.parse(JSON.stringify(window.DMS_DEMOS.headcount));
  initHeadcountPage();
  setHeadcountPageStatus("LA Mission Fall 2025 Student Headcount sample loaded.", "success");
}

function initHeadcountPage() {
  const parsed = headcountPageState.parsed;
  headcountPageEls.headcountPageWorkspace.hidden = false;
  fillHeadcountPageSummary(headcountPageEls.headcountPageFileSummary, [
    ["Report", parsed.reportTitle || "Student Headcount Summary Report"],
    ["Term", parsed.period || "Not detected"],
    ["College", parsed.college || "Not detected"],
    ["College headcount", formatHeadcountPageInteger(parsed.collegeTotal)]
  ]);
  fillHeadcountPageSelect(headcountPageEls.headcountPageStatusFilter, "All headcount statuses", uniqueHeadcountPageValues(parsed.records,"status"));
  fillHeadcountPageSelect(headcountPageEls.headcountPageGenderFilter, "All genders", uniqueHeadcountPageValues(parsed.records,"gender"));
  fillHeadcountPageSelect(headcountPageEls.headcountPageAgeFilter, "All age groups", orderedHeadcountPageAges(parsed.records));
  fillHeadcountPageSelect(headcountPageEls.headcountPageEthnicityFilter, "All ethnicities", uniqueHeadcountPageValues(parsed.records,"ethnicity"));
  headcountPageEls.headcountPageBreakdown.value = "gender";
  headcountPageEls.headcountPageMeasure.value = "percent";
  renderHeadcountPage();
  headcountPageEls.headcountPageWorkspace.scrollIntoView({behavior:headcountPageScrollBehavior(),block:"start"});
}

function uniqueHeadcountPageValues(records,key) {
  return [...new Set((records || []).map(r => r[key]).filter(Boolean))].sort((a,b) => a.localeCompare(b));
}
function orderedHeadcountPageAges(records) {
  const order=["19 or Less","20 to 24","25 to 29","30 to 34","35 to 39","40 to 49","50 +"];
  const present=new Set((records || []).map(r => r.age).filter(Boolean));
  return order.filter(x => present.has(x)).concat([...present].filter(x => !order.includes(x)).sort());
}
function fillHeadcountPageSelect(select,allLabel,values) {
  select.innerHTML="";
  const all=document.createElement("option"); all.value=""; all.textContent=allLabel; select.appendChild(all);
  values.forEach(value => { const o=document.createElement("option"); o.value=value; o.textContent=value; select.appendChild(o); });
}

function filteredHeadcountPageRecords() {
  return (headcountPageState.parsed?.records || []).filter(r =>
    (!headcountPageEls.headcountPageStatusFilter.value || r.status === headcountPageEls.headcountPageStatusFilter.value) &&
    (!headcountPageEls.headcountPageGenderFilter.value || r.gender === headcountPageEls.headcountPageGenderFilter.value) &&
    (!headcountPageEls.headcountPageAgeFilter.value || r.age === headcountPageEls.headcountPageAgeFilter.value) &&
    (!headcountPageEls.headcountPageEthnicityFilter.value || r.ethnicity === headcountPageEls.headcountPageEthnicityFilter.value)
  );
}

function aggregateHeadcountPage() {
  const records=filteredHeadcountPageRecords();
  const key=headcountPageEls.headcountPageBreakdown.value;
  const grouped=new Map();
  records.forEach(r => grouped.set(r[key] || "Unreported",(grouped.get(r[key] || "Unreported") || 0)+Number(r.count || 0)));
  const total=[...grouped.values()].reduce((s,n)=>s+n,0);
  let rows=[...grouped.entries()].map(([category,count])=>({category,count,percent:total?count/total:null}));
  if (key==="age") {
    const order=["19 or Less","20 to 24","25 to 29","30 to 34","35 to 39","40 to 49","50 +"];
    rows.sort((a,b)=>(order.indexOf(a.category)<0?999:order.indexOf(a.category))-(order.indexOf(b.category)<0?999:order.indexOf(b.category))||a.category.localeCompare(b.category));
  } else {
    rows.sort((a,b)=>b.count-a.count||a.category.localeCompare(b.category));
  }
  return {records,rows,total,key};
}

function renderHeadcountPage() {
  if (!headcountPageState.parsed) return;
  const controls={status:headcountPageEls.headcountPageStatusFilter,gender:headcountPageEls.headcountPageGenderFilter,age:headcountPageEls.headcountPageAgeFilter,ethnicity:headcountPageEls.headcountPageEthnicityFilter};
  Object.entries(controls).forEach(([key,control])=>{
    const active=key===headcountPageEls.headcountPageBreakdown.value;
    if (active && control.value) control.value="";
    control.disabled=active;
  });

  const {records,rows,total,key}=aggregateHeadcountPage();
  const labels={status:"Headcount status",gender:"Gender",age:"Age group",ethnicity:"Ethnicity"};
  const label=labels[key] || "Category";
  const collegeTotal=Number(headcountPageState.parsed.collegeTotal || 0);
  const collegeShare=collegeTotal?total/collegeTotal:null;
  headcountPageEls.headcountPageResultsTitle.textContent=label;
  headcountPageEls.headcountPageResultMeta.textContent=`${headcountPageState.parsed.college || "College not detected"} · ${headcountPageState.parsed.period || "Term not detected"} · ${formatHeadcountPageInteger(total)} selected students`;
  headcountPageEls.headcountPageCategoryHeader.textContent=label;
  fillHeadcountPageSummary(headcountPageEls.headcountPageKpis,[
    ["Selected students",formatHeadcountPageInteger(total)],
    ["Share of college headcount",formatHeadcountPagePercent(collegeShare)],
    ["Categories shown",rows.length.toLocaleString()],
    ["College headcount",formatHeadcountPageInteger(collegeTotal)]
  ]);

  const unknown=records.filter(r=>/^X\s*-\s*Unknown$/i.test(r.status)).reduce((s,r)=>s+Number(r.count||0),0);
  if (unknown>0 && !headcountPageEls.headcountPageStatusFilter.value) {
    headcountPageEls.headcountPageWarning.hidden=false;
    headcountPageEls.headcountPageWarning.innerHTML=`<strong>Unknown headcount status is included.</strong> ${formatHeadcountPageInteger(unknown)} selected student${unknown===1?"":"s"} are in the reported X - Unknown status category. CCC Data Smart keeps that category visible rather than redistributing it.`;
  } else {
    headcountPageEls.headcountPageWarning.hidden=true;
    headcountPageEls.headcountPageWarning.textContent="";
  }

  const measure=headcountPageEls.headcountPageMeasure.value;
  renderHeadcountPageBars(rows.map(r=>({label:r.category,value:measure==="percent"?r.percent:r.count})),measure);
  headcountPageEls.headcountPageResultsBody.innerHTML="";
  if (!rows.length) headcountPageEls.headcountPageResultsBody.innerHTML='<tr><td colspan="3">No students match the selected filters.</td></tr>';
  else rows.forEach(row=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<th scope="row">${escapeHeadcountPageHtml(row.category)}</th><td>${formatHeadcountPageInteger(row.count)}</td><td>${formatHeadcountPagePercent(row.percent)}</td>`;
    headcountPageEls.headcountPageResultsBody.appendChild(tr);
  });

  const filters=[
    ["Headcount status",headcountPageEls.headcountPageStatusFilter.value||"All"],
    ["Gender",headcountPageEls.headcountPageGenderFilter.value||"All"],
    ["Age group",headcountPageEls.headcountPageAgeFilter.value||"All"],
    ["Ethnicity",headcountPageEls.headcountPageEthnicityFilter.value||"All"]
  ].map(([a,b])=>`${a}: ${b}`).join("; ");

  headcountPageEls.headcountPageMethodText.textContent=[
    "Source: California Community Colleges Chancellor's Office Data Mart: Student Headcount Summary Report",
    `File: ${headcountPageState.sourceName}`,
    `Term: ${headcountPageState.parsed.period || "Not detected"}`,
    `College: ${headcountPageState.parsed.college || "Not detected"}`,
    "Measure: Student Count",
    `Breakdown: ${label}`,
    `Filters: ${filters}`,
    `Selected students: ${formatHeadcountPageInteger(total)}`,
    `College headcount in export: ${formatHeadcountPageInteger(collegeTotal)}`,
    "Caution: Student Count is not Enrollment Count. District and statewide distinct-student totals should not be reconstructed by adding college headcounts."
  ].join("\n");
}

function renderHeadcountPageBars(rows,measure) {
  const container=headcountPageEls.headcountPageBarChart;
  container.innerHTML="";
  const valid=rows.filter(r=>Number.isFinite(r.value));
  if (!valid.length) return;
  const max=measure==="percent"?1:Math.max(...valid.map(r=>r.value),1);
  valid.forEach(row=>{
    const width=Math.max(2,Math.min(100,(row.value/max)*100));
    const value=measure==="percent"?formatHeadcountPagePercent(row.value):formatHeadcountPageInteger(row.value);
    const item=document.createElement("div");
    item.className="bar-row explorer-bar-row";
    item.innerHTML=`<div class="bar-label">${escapeHeadcountPageHtml(row.label)}</div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${width}%"></div></div><div class="bar-value">${value}</div>`;
    container.appendChild(item);
  });
}

function downloadHeadcountPageCsv() {
  const {rows,total,key}=aggregateHeadcountPage();
  const labels={status:"Headcount Status",gender:"Gender",age:"Age Group",ethnicity:"Ethnicity"};
  if (!rows.length) return setHeadcountPageStatus("There are no matching headcount rows to download.","error");
  const data=[[labels[key]||"Category","Student Count","Percent"],...rows.map(r=>[r.category,r.count,(r.percent*100).toFixed(1)+"%"]),["Total",total,"100.0%"]];
  downloadHeadcountPageCsvFile("ccc-data-smart-student-headcount.csv",data);
  setHeadcountPageStatus("Student Headcount CSV downloaded.","success");
}

function fillHeadcountPageSummary(container,items) {
  container.innerHTML="";
  items.forEach(([label,value])=>{
    const div=document.createElement("div"); div.className="viewer-stat";
    div.innerHTML=`<span>${escapeHeadcountPageHtml(label)}</span><strong>${escapeHeadcountPageHtml(String(value))}</strong>`;
    container.appendChild(div);
  });
}

async function copyHeadcountPageText(text) {
  try {
    await navigator.clipboard.writeText(text);
    setHeadcountPageStatus("Method copied to the clipboard.","success");
  } catch {
    setHeadcountPageStatus("Your browser blocked automatic copying. Select and copy the method text manually.","error");
  }
}

function downloadHeadcountPageCsvFile(filename,rows) {
  const text=rows.map(row=>row.map(headcountPageCsvCell).join(",")).join("\r\n");
  const blob=new Blob([text],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function headcountPageCsvCell(value) { return DataMartFileSecurity.csvCell(value); }
function resetHeadcountPage() {
  headcountPageState.sourceName="";
  headcountPageState.parsed=null;
  headcountPageEls.headcountPageFileInput.value="";
  headcountPageEls.headcountPageWorkspace.hidden=true;
  headcountPageEls.headcountPageBarChart.innerHTML="";
  headcountPageEls.headcountPageResultsBody.innerHTML="";
  setHeadcountPageStatus("Ready. Choose another Student Headcount export, or try the LA Mission sample.","neutral");
  headcountPageEls.headcountPageDropZone.scrollIntoView({behavior:headcountPageScrollBehavior(),block:"center"});
  headcountPageEls.headcountPageBrowseButton.focus();
}
function setHeadcountPageStatus(message,kind="neutral") {
  headcountPageEls.headcountPageStatus.textContent=message;
  headcountPageEls.headcountPageStatus.dataset.kind=kind;
}
function formatHeadcountPageInteger(value) {
  return Number.isFinite(Number(value))?Math.round(Number(value)).toLocaleString():"Not available";
}
function formatHeadcountPagePercent(value) {
  return Number.isFinite(Number(value))?`${(Number(value)*100).toFixed(1)}%`:"Not available";
}
function headcountPageScrollBehavior() {
  return window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth";
}
function escapeHeadcountPageHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
}
