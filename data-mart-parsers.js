"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.DataMartParsers = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  function clean(value) {
    if (value === null || value === undefined) return "";
    return String(value).replace(/\s+/g, " ").trim();
  }

  function numberValue(value) {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const parsed = Number(String(value).replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  function detectReport(rows) {
    const sample = rows.slice(0, 20).flat().map(clean).filter(Boolean).join(" | ");
    if (/Program Awards Summary Report/i.test(sample)) return { kind: "program-awards", label: "Program Awards Summary Report", supported: true };
    if (/Credit Course Retention\/Success Rate Summary Report/i.test(sample) || /Retention\/Success Rate Summary/i.test(sample)) {
      return { kind: "retention-success", label: "Enrollment Retention and Success Rate", supported: true };
    }
    if (/Student Headcount Summary Report/i.test(sample)) return { kind: "student-headcount", label: "Student Headcount Summary Report", supported: true };
    if (/Grades Distribution Summary Report/i.test(sample) || /Grade Distribution Summary Report/i.test(sample)) return { kind: "grade-distribution", label: "Grade Distribution Summary Report", supported: true };
    if (/Course Details Report/i.test(sample)) return { kind: "course-details", label: "Course Details Report", supported: true };
    if (/Credit Sections Count/i.test(sample) && /Credit Sections FTES/i.test(sample) && /Enrollment Count/i.test(sample)) {
      return { kind: "credit-course-sections", label: "Credit Courses/Sections", supported: true };
    }
    return { kind: "unknown", label: "Unrecognized Data Mart export", supported: false };
  }

  function firstMatch(rows, regex) {
    for (const row of rows) {
      for (const cell of row || []) {
        const text = clean(cell);
        const m = text.match(regex);
        if (m) return m[0];
      }
    }
    return "";
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
      const a = clean(row[0]);
      const b = clean(row[1]);
      const c = clean(row[2]);
      const d = clean(row[3]);
      const f = numberValue(row[5]);

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
        if (match && f !== null) {
          records.push({
            district,
            college,
            awardType,
            program: match[1].trim(),
            top: match[2],
            count: f,
            period
          });
        }
      }
    }

    return {
      kind: "program-awards",
      records,
      district,
      period,
      reportTitle: reportTitle || "Program Awards Summary Report"
    };
  }

  function parseRetentionSuccess(rows) {
    const metricRowIndex = rows.findIndex(row => {
      const vals = (row || []).map(clean);
      return vals.includes("Enrollment Count") && vals.includes("Retention Count") && vals.includes("Success Count") && vals.includes("Success Rate");
    });
    if (metricRowIndex < 1) {
      return { kind: "retention-success", records: [], error: "Metric header row not found." };
    }

    const categoryRow = rows[metricRowIndex - 1] || [];
    const metricRow = rows[metricRowIndex] || [];
    const metricCols = [];
    let currentCategory = "";
    const allowedMetrics = new Set(["Enrollment Count", "Retention Count", "Success Count", "Retention Rate", "Success Rate"]);
    const width = Math.max(categoryRow.length, metricRow.length);

    for (let col = 0; col < width; col += 1) {
      const cat = clean(categoryRow[col]);
      if (cat) currentCategory = cat;
      const metric = clean(metricRow[col]);
      if (currentCategory && allowedMetrics.has(metric)) {
        metricCols.push({ col, category: currentCategory, metric });
      }
    }

    let reportTitle = "Credit Course Retention/Success Rate Summary Report";
    let period = firstMatch(rows.slice(0, metricRowIndex + 1), /(?:Fall|Spring|Summer|Winter)\s+\d{4}/i);
    let college = "";
    let modality = "";
    let parent2 = { name: "", code: "" };
    let parent4 = { name: "", code: "" };
    const records = [];
    const collegeTotals = {};

    function readMeasures(row) {
      const measures = {};
      for (const item of metricCols) {
        const value = numberValue(row[item.col]);
        if (!measures[item.category]) measures[item.category] = {};
        const keyMap = {
          "Enrollment Count": "enrollment",
          "Retention Count": "retention",
          "Success Count": "success",
          "Retention Rate": "retentionRate",
          "Success Rate": "successRate"
        };
        measures[item.category][keyMap[item.metric]] = value;
      }
      return measures;
    }

    for (let i = metricRowIndex + 1; i < rows.length; i += 1) {
      const row = rows[i] || [];
      const a = clean(row[0]);
      const b = clean(row[1]);
      const c = clean(row[2]);
      const d = clean(row[3]);
      const e = clean(row[4]);

      if (a && /\sTotal$/i.test(a)) {
        college = a.replace(/\sTotal$/i, "").trim();
        Object.assign(collegeTotals, readMeasures(row));
      }

      if (b && /\sTotal$/i.test(b)) {
        modality = b.replace(/\s+Total$/i, "").trim();
        parent2 = { name: "", code: "" };
        parent4 = { name: "", code: "" };
      }

      if (c) {
        const m2 = c.match(/^(.*)-(\d{2})\s+Total$/i);
        if (m2) parent2 = { name: m2[1].trim(), code: m2[2] };
      }

      if (d) {
        const m4 = d.match(/^(.*)-(\d{4})\s+Total$/i);
        if (m4) parent4 = { name: m4[1].trim(), code: m4[2] };
      }

      if (e) {
        const m6 = e.match(/^(.*)-(\d{6})$/i);
        if (m6) {
          const measures = readMeasures(row);
          const hasData = Object.values(measures).some(group => Object.values(group).some(v => v !== null));
          if (hasData) {
            records.push({
              college,
              period,
              modality: modality || "Not grouped by modality",
              top2Name: parent2.name,
              top2: parent2.code,
              top4Name: parent4.name,
              top4: parent4.code,
              program: m6[1].trim(),
              top: m6[2],
              measures
            });
          }
        }
      }
    }

    for (const row of rows.slice(0, metricRowIndex + 1)) {
      for (const cell of row || []) {
        const text = clean(cell);
        if (/Credit Course Retention\/Success Rate Summary Report/i.test(text)) reportTitle = text;
      }
    }

    return {
      kind: "retention-success",
      records,
      college,
      period,
      reportTitle,
      populations: [...new Set(metricCols.map(x => x.category))],
      collegeTotals
    };
  }



  function parseStudentHeadcount(rows) {
    const headerRowIndex = rows.findIndex(row => {
      const vals = (row || []).map(clean);
      return vals.includes("Student Count") && vals.includes("Student Count (%)");
    });
    if (headerRowIndex < 0) {
      return { kind: "student-headcount", records: [], error: "Student Count header row not found." };
    }

    const header = rows[headerRowIndex] || [];
    const countCol = header.findIndex(cell => clean(cell) === "Student Count");
    let reportTitle = "Student Headcount Summary Report";
    let period = firstMatch(rows.slice(0, headerRowIndex + 1), /(?:Fall|Spring|Summer|Winter)\s+\d{4}/i);
    let college = "";
    let collegeTotal = null;
    let status = "";
    let gender = "";
    let age = "";
    const records = [];

    for (const row of rows.slice(0, headerRowIndex + 1)) {
      for (const cell of row || []) {
        const value = clean(cell);
        if (/Student Headcount Summary Report/i.test(value)) reportTitle = value;
      }
    }

    for (let i = headerRowIndex + 1; i < rows.length; i += 1) {
      const row = rows[i] || [];
      const a = clean(row[0]);
      const b = clean(row[1]);
      const c = clean(row[2]);
      const d = clean(row[3]);
      const f = clean(row[5]);
      const count = numberValue(row[countCol]);

      if (a && /\sTotal$/i.test(a) && count !== null) {
        college = a.replace(/\s+Total$/i, "").trim();
        collegeTotal = count;
        continue;
      }
      if (b && /\sTotal$/i.test(b)) {
        status = b.replace(/\s+Total$/i, "").trim();
        gender = "";
        age = "";
        continue;
      }
      if (c && /\sTotal$/i.test(c)) {
        gender = c.replace(/\s+Total$/i, "").trim();
        age = "";
        continue;
      }
      if (d && /\sTotal$/i.test(d)) {
        age = d.replace(/\s+Total$/i, "").trim();
        continue;
      }
      if (f && count !== null) {
        records.push({
          college,
          period,
          status,
          gender,
          age,
          ethnicity: f,
          count
        });
      }
    }

    return {
      kind: "student-headcount",
      records,
      college,
      collegeTotal,
      period,
      reportTitle
    };
  }

  function parseCourseDetails(rows) {
    const headerRowIndex = rows.findIndex(row => {
      const vals = (row || []).map(clean);
      return vals.includes("Course ID") && vals.includes("Sections Count") && vals.includes("TOP Code");
    });
    if (headerRowIndex < 0) {
      return { kind: "course-details", records: [], error: "Course Details header row not found." };
    }

    const header = rows[headerRowIndex] || [];
    const col = name => header.findIndex(cell => clean(cell) === name);
    const indexes = {
      district: col("District"),
      college: col("College"),
      courseId: col("Course ID"),
      controlNumber: col("Control Number"),
      title: col("Course Title"),
      sections: col("Sections Count"),
      topCode: col("TOP Code"),
      creditStatus: col("Credit Status"),
      transferStatus: col("Transfer Status"),
      maxUnits: col("Maximum Units"),
      minUnits: col("Minimum Units"),
      basicSkills: col("Basic Skills Status"),
      samStatus: col("SAM Status"),
      priorTransfer: col("Prior To Transfer Status"),
      noncreditCategory: col("Non-Credit Category"),
      geStatus: col("General Education Status"),
      supportStatus: col("Support Status"),
      term: col("Term")
    };

    let reportTitle = "Course Details Report";
    const records = [];

    for (const row of rows.slice(0, headerRowIndex + 1)) {
      for (const cell of row || []) {
        const value = clean(cell);
        if (/Course Details Report/i.test(value)) reportTitle = value;
      }
    }

    for (let i = headerRowIndex + 1; i < rows.length; i += 1) {
      const row = rows[i] || [];
      const courseId = indexes.courseId >= 0 ? clean(row[indexes.courseId]) : "";
      if (!courseId) continue;
      const topText = indexes.topCode >= 0 ? clean(row[indexes.topCode]) : "";
      const topMatch = topText.match(/^(.*)-(\d{6})$/);
      records.push({
        district: indexes.district >= 0 ? clean(row[indexes.district]) : "",
        college: indexes.college >= 0 ? clean(row[indexes.college]) : "",
        courseId,
        controlNumber: indexes.controlNumber >= 0 ? clean(row[indexes.controlNumber]) : "",
        title: indexes.title >= 0 ? clean(row[indexes.title]) : "",
        sections: indexes.sections >= 0 ? numberValue(row[indexes.sections]) : null,
        topName: topMatch ? topMatch[1].trim() : topText,
        top: topMatch ? topMatch[2] : "",
        creditStatus: indexes.creditStatus >= 0 ? clean(row[indexes.creditStatus]) : "",
        transferStatus: indexes.transferStatus >= 0 ? clean(row[indexes.transferStatus]) : "",
        maxUnits: indexes.maxUnits >= 0 ? clean(row[indexes.maxUnits]) : "",
        minUnits: indexes.minUnits >= 0 ? clean(row[indexes.minUnits]) : "",
        basicSkills: indexes.basicSkills >= 0 ? clean(row[indexes.basicSkills]) : "",
        samStatus: indexes.samStatus >= 0 ? clean(row[indexes.samStatus]) : "",
        priorTransfer: indexes.priorTransfer >= 0 ? clean(row[indexes.priorTransfer]) : "",
        noncreditCategory: indexes.noncreditCategory >= 0 ? clean(row[indexes.noncreditCategory]) : "",
        geStatus: indexes.geStatus >= 0 ? clean(row[indexes.geStatus]) : "",
        supportStatus: indexes.supportStatus >= 0 ? clean(row[indexes.supportStatus]) : "",
        term: indexes.term >= 0 ? clean(row[indexes.term]) : ""
      });
    }

    const first = records[0] || {};
    return {
      kind: "course-details",
      records,
      district: first.district || "",
      college: first.college || "",
      period: first.term || "",
      reportTitle
    };
  }

  function parseCreditCourseSections(rows) {
    const metricRowIndex = rows.findIndex(row => {
      const vals = (row || []).map(clean);
      return vals.includes("Credit Sections Count") && vals.includes("Credit Sections FTES") && vals.includes("Enrollment Count");
    });
    if (metricRowIndex < 0) {
      return { kind: "credit-course-sections", records: [], error: "Credit course metric row not found." };
    }

    const header = rows[metricRowIndex] || [];
    const sectionCol = header.findIndex(cell => clean(cell) === "Credit Sections Count");
    const ftesCol = header.findIndex(cell => clean(cell) === "Credit Sections FTES");
    const enrollmentCol = header.findIndex(cell => clean(cell) === "Enrollment Count");
    const firstMetricCol = Math.min(...[sectionCol, ftesCol, enrollmentCol].filter(i => i >= 0));
    const period = firstMatch(rows.slice(0, metricRowIndex + 1), /(?:Fall|Spring|Summer|Winter)\s+\d{4}/i);
    const records = [];

    for (let i = metricRowIndex + 1; i < rows.length; i += 1) {
      const row = rows[i] || [];
      const path = row.slice(0, firstMetricCol).map(clean).filter(Boolean);
      const label = path.length ? path[path.length - 1].replace(/\s+Total$/i, "").trim() : "";
      const sections = numberValue(row[sectionCol]);
      const ftes = numberValue(row[ftesCol]);
      const enrollment = numberValue(row[enrollmentCol]);
      if (!label || (sections === null && ftes === null && enrollment === null)) continue;
      records.push({ label, path, sections, ftes, enrollment, period });
    }

    return {
      kind: "credit-course-sections",
      records,
      period,
      reportTitle: "Credit Courses/Sections"
    };
  }

  function parseGradeDistribution(rows) {
    const metricRowIndex = rows.findIndex(row => {
      const vals = (row || []).map(clean);
      return vals.includes("Credit Grade Count") && vals.includes("Credit Grade Count (%)");
    });
    if (metricRowIndex < 0) {
      return { kind: "grade-distribution", records: [], error: "Grade count header row not found." };
    }

    const header = rows[metricRowIndex] || [];
    const countCol = header.findIndex(cell => clean(cell) === "Credit Grade Count");
    const percentCol = header.findIndex(cell => clean(cell) === "Credit Grade Count (%)");
    let reportTitle = "Grades Distribution Summary Report";
    let period = firstMatch(rows.slice(0, metricRowIndex + 1), /(?:Fall|Spring|Summer|Winter)\s+\d{4}/i);
    let college = "";
    let collegeTotal = null;
    let currentProgram = null;
    const records = [];

    for (const row of rows.slice(0, metricRowIndex + 1)) {
      for (const cell of row || []) {
        const text = clean(cell);
        if (/Grades? Distribution Summary Report/i.test(text)) reportTitle = text;
      }
    }

    for (let i = metricRowIndex + 1; i < rows.length; i += 1) {
      const row = rows[i] || [];
      const a = clean(row[0]);
      const b = clean(row[1]);
      const c = clean(row[2]);
      const count = numberValue(row[countCol]);
      const percent = percentCol >= 0 ? numberValue(row[percentCol]) : null;

      if (a && /\sTotal$/i.test(a)) {
        college = a.replace(/\s+Total$/i, "").trim();
        collegeTotal = count;
        currentProgram = null;
        continue;
      }

      if (b) {
        const match = b.match(/^(.*)-(\d{6})\s+Total$/i);
        if (match) {
          currentProgram = {
            program: match[1].trim(),
            top: match[2],
            total: count
          };
          continue;
        }
      }

      if (currentProgram && count !== null && !a && !b) {
        const grade = c || "Unlabeled / blank category";
        records.push({
          college,
          period,
          program: currentProgram.program,
          top: currentProgram.top,
          programTotal: currentProgram.total,
          grade,
          count,
          percent: percent !== null ? percent : (currentProgram.total ? count / currentProgram.total : null)
        });
      }
    }

    return {
      kind: "grade-distribution",
      records,
      college,
      collegeTotal,
      period,
      reportTitle
    };
  }

  return {
    clean,
    numberValue,
    detectReport,
    parseProgramAwards,
    parseRetentionSuccess,
    parseStudentHeadcount,
    parseCourseDetails,
    parseCreditCourseSections,
    parseGradeDistribution
  };
});
