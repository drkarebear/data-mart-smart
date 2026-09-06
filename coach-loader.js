"use strict";

(() => {
  const ROUTES = {
    programReview: {
      badge: "Use a combination",
      title: "Build a small evidence set instead of hunting for one perfect report.",
      summary: "Program review usually needs more than one source. Use Data Mart for specific term/report questions, DataVista for cohort/equity/pathway/completion/transfer or integrated annual outcomes, and local institutional data for current operations and campus-specific context.",
      why: "Program review questions span term-level activity, course outcomes, equity, completion, course detail, and current local conditions. The best first source changes with the question.",
      population: "Decide whether each claim is about all students, general admit students, dual enrollment students, a TOP-coded program, course enrollments, or a cohort. Keep those populations separate in the narrative.",
      steps: [
        "For term, course, section, grade, success/retention, or award questions, start with the relevant Data Mart report.",
        "For cohort, equity, pathway, completion, transfer, labor-market, or integrated annual outcome questions, use the relevant DataVista view or report.",
        "Add local Power BI, SIS, scheduling, staffing, or institutional-research data for current enrollment, fill, waitlists, FTEF, cancellations, or locally defined measures.",
        "Write the interpretation after you have checked the population, denominator, timeframe, and limitations for each measure."
      ],
      cautions: [
        "Do not combine snapshot and cohort measures as though they describe the same students.",
        "A statewide annual trend is not a substitute for a live local scheduling measure.",
        "Use several related indicators before making a causal or resource claim."
      ],
      links: [
        ["task-program-review.html", "Program Review evidence guide"],
        ["datavista.html", "DataVista Made Simple"],
        ["local-data.html", "When Local Data Comes First"]
      ]
    },
    equity: {
      badge: "DataVista first",
      title: "Begin with DataVista, then investigate locally.",
      summary: "For an equity question, start with DataVista's equity-oriented views or the relevant student-success metric, then use local data and context to understand where the pattern may be occurring.",
      why: "DataVista is designed to display disaggregated student outcomes and includes Student Equity and Achievement reporting and equity visualizations. That makes it a better first stop than assembling multiple Data Mart tables by hand.",
      population: "Check the student group, denominator, disaggregation, and whether the view is snapshot or cohort. A subgroup rate is not the same thing as that subgroup's share of all students who met the outcome.",
      steps: [
        "Start with DataVista Insights Equity Charts or the Student Equity and Achievement Program when the question aligns with those measures.",
        "If you need a different outcome, use Single Metric or Metric Themes and inspect the available disaggregations.",
        "Use local data, student experience, qualitative evidence, and process information to investigate where barriers may occur.",
        "Use Data Mart when a particular traditional report, such as Grade Distribution, answers a narrower follow-up question."
      ],
      cautions: [
        "A disparity is evidence of a difference, not a diagnosis of its cause.",
        "Suppression and complementary suppression can hide small subgroup values.",
        "Confirm the denominator before comparing percentages across groups."
      ],
      links: [
        ["use-equity.html", "Equity inquiry guide"],
        ["snapshot-cohort.html", "Snapshot or Cohort?"],
        ["datavista.html", "DataVista Made Simple"]
      ]
    },
    studentSuccess: {
      badge: "DataVista first",
      title: "Use DataVista for the student-outcome story.",
      summary: "Questions about persistence, momentum, completion, pathways, transfer, or the same students over time usually belong in DataVista first. A simple term-specific course-success question usually belongs in Data Mart.",
      why: "DataVista adds value when the question needs a cohort, pathway, equity, completion, transfer, or integrated outcomes frame. Data Mart is often simpler for a specific term-level course-success report.",
      population: "Choose between a snapshot question about students meeting a criterion in a selected year and a cohort question that follows the same starting group over time.",
      steps: [
        "If you know the exact outcome, try DataVista Single Metric.",
        "If you are exploring a broader part of the student journey, use Metric Themes.",
        "Use Guided Pathways, Vision 2030, or another report when your question aligns with that initiative's defined metrics.",
        "Move to Data Mart or local data only when you need a narrower term, course, grade, or current-operational view."
      ],
      cautions: [
        "Some cohort years may be incomplete and can update as more source years become available.",
        "Different metrics can use different denominators even when their labels sound related.",
        "Outcome differences do not establish causation."
      ],
      links: [
        ["use-student-success.html", "Student Success and Pathways guide"],
        ["datavista.html", "Choose a DataVista view"],
        ["snapshot-cohort.html", "Snapshot or Cohort?"]
      ]
    },
    enrollmentPlanning: {
      badge: "Local data first",
      title: "Use current institutional data for a scheduling decision.",
      summary: "If the decision is whether to add, cancel, move, or change a section, start with the freshest local enrollment, fill, waitlist, schedule, and staffing data available.",
      why: "DataVista and Data Mart are statewide reporting systems, not live registration systems. They can show historical context, but they should not replace current SIS or institutional dashboards for an immediate scheduling decision.",
      population: "Separate seats, enrollments, distinct students, sections, and waitlisted students. They answer different operational questions.",
      steps: [
        "Check current local enrollment, capacity, waitlists, fill rate, modality, time of day, cancellations, and comparable sections.",
        "Look across several recent terms locally so one unusual term does not drive the decision.",
        "Use DataVista or Data Mart for longer historical or external comparison only after the current local picture is clear.",
        "Document local scheduling constraints that the statewide data cannot show."
      ],
      cautions: [
        "Do not treat statewide reported sections as a live schedule.",
        "High fill can reflect limited supply as well as high demand.",
        "Enrollment counts are not distinct-student counts."
      ],
      links: [
        ["use-enrollment-planning.html", "Enrollment Planning and Scheduling guide"],
        ["local-data.html", "When Local Data Comes First"],
        ["enrollment-trends.html", "Data Mart enrollment trends"]
      ]
    },
    hiring: {
      badge: "Local data + statewide context",
      title: "Build the staffing case from local workload first.",
      summary: "Faculty hiring and resource requests usually need local staffing, workload, enrollment, scheduling, and service evidence, with DataVista or Data Mart used to add student-outcome or historical context.",
      why: "Statewide systems do not know your current vacancies, adjunct load, overload, scheduling bottlenecks, service assignments, or local strategic priorities.",
      population: "Keep staffing measures, sections, enrollments, FTES, and student outcomes distinct. A change in one does not automatically explain a change in another.",
      steps: [
        "Start with current and recent local FTEF, faculty headcount, adjunct share, overload, sections, enrollment, fill, and scheduling constraints.",
        "Add DataVista student-outcome or program trend evidence when it strengthens the educational need.",
        "Use Data Mart for selected statewide instructional-volume or course-detail comparisons when the definition is genuinely comparable.",
        "State the operational consequence of not adding the resource rather than relying on a single ratio."
      ],
      cautions: [
        "No single enrollment, FTES, or success number is a hiring formula.",
        "Confirm whether your local staffing definitions match any statewide comparison.",
        "Do not imply causation between staffing and outcomes without stronger evidence."
      ],
      links: [
        ["task-faculty-hiring.html", "Faculty Hiring evidence guide"],
        ["task-resource-request.html", "Resource Request evidence guide"],
        ["local-data.html", "When Local Data Comes First"]
      ]
    },
    institutionalEffectiveness: {
      badge: "Use a combination",
      title: "Match each accreditation or IE claim to the source that actually supports it.",
      summary: "Institutional effectiveness work often combines statewide outcomes with local operational, planning, and process evidence.",
      why: "Accreditation and institutional-effectiveness questions are broader than one report. They may require evidence about outcomes, processes, current practice, and improvement over time.",
      population: "Define the institution, program, student group, timeframe, and outcome for every claim. Do not let a systemwide measure silently stand in for a local process measure.",
      steps: [
        "Use DataVista for standardized student-success, equity, pathway, transfer, completion, and related longitudinal metrics.",
        "Use Data Mart for a specific traditional MIS report when it adds needed detail.",
        "Use local planning, governance, survey, scheduling, staffing, and process evidence for claims the statewide systems cannot answer.",
        "Triangulate before writing an evaluative conclusion."
      ],
      cautions: [
        "A dashboard can document an outcome but usually cannot document the process that produced it.",
        "Use current official definitions in accreditation evidence tables.",
        "Distinguish descriptive evidence from evaluative conclusions."
      ],
      links: [
        ["use-institutional-effectiveness.html", "Institutional Effectiveness guide"],
        ["task-program-review.html", "Program Review evidence guide"],
        ["data-tools.html", "Compare the three data sources"]
      ]
    },
    gradeDistribution: {
      badge: "Data Mart first",
      title: "Use the Data Mart Grade Distribution report.",
      summary: "When the question is specifically about the grades awarded in reported course enrollments, Data Mart is the more direct statewide tool.",
      why: "Grade Distribution is a traditional Data Mart outcome report and gives the detailed grade categories that a broader DataVista student-success view may not expose in the same way.",
      population: "Grades describe course enrollments, not distinct students. One student taking more than one course can appear more than once in the enrollment-based distribution.",
      steps: [
        "Open the Data Mart Grade Distribution report and set institution, term, subject/TOP, course, and other filters deliberately.",
        "Record the denominator and the exact filters used before interpreting percentages.",
        "Export the result if you want to chart or compare it in Data Mart Smart.",
        "Use local data instead if you need live or section-level information not represented in the statewide report."
      ],
      cautions: [
        "Do not describe grade enrollments as unique students.",
        "A grade pattern does not identify why students received those grades.",
        "Check whether withdrawals, pass/no-pass, and other categories are included in the denominator you are discussing."
      ],
      links: [
        ["grade-distribution.html", "Grade Distribution guide"],
        ["explore-data.html", "Explore an export"],
        ["check-query.html", "Check a Data Mart setup"]
      ]
    },
    courseSuccess: {
      badge: "DataVista + Data Mart",
      title: "Choose the source based on the level of detail you need.",
      summary: "Use Data Mart first for a specific term success/retention question. Use DataVista when you need an annual trend, disaggregation, cohort, pathway, completion, or transfer context.",
      why: "Both systems can contribute, but the simplest valid source should lead. Data Mart is the direct tool for the term-specific Retention/Success report; DataVista adds value when the question expands beyond that report.",
      population: "Course success is generally enrollment-based. Confirm the allowable grade population and denominator before calling the result a student success rate.",
      steps: [
        "For a specific term success/retention question, start with the Data Mart Retention/Success report.",
        "For an annual trend, subgroup, equity, cohort, pathway, completion, or transfer question, use the relevant DataVista view or metric.",
        "Use local data when you need current sections, instructor-defined groupings, or institutional variables not in the statewide systems.",
        "Compare like definitions and timeframes before combining results."
      ],
      cautions: [
        "Enrollment-based success is not the same as the percentage of distinct students who succeeded.",
        "Modality or subgroup differences do not prove that modality or identity caused the outcome.",
        "Do not compare rates with different grade or enrollment populations."
      ],
      links: [
        ["course-success.html", "Course Success guide"],
        ["datavista.html", "DataVista Made Simple"],
        ["check-query.html", "Check a Data Mart setup"]
      ]
    },
    sectionsEnrollments: {
      badge: "Match the timeframe",
      title: "Use local data for now, Data Mart for term-by-term history, or DataVista when an annual outcomes framework adds value.",
      summary: "Sections and enrollments exist in more than one system. The right source depends mostly on whether you need live operations, annual TOP-coded trends, or a specific traditional report.",
      why: "Data Mart is often the clearest statewide choice for term-by-term section and enrollment questions. DataVista can add annual program/outcome context, while local systems are fresher for current scheduling.",
      population: "A section is not an enrollment, and an enrollment is not a distinct student. Define which unit you are counting before comparing periods or colleges.",
      steps: [
        "If the question is about the current term or upcoming schedule, use local institutional data first.",
        "If the question is Fall-to-Fall or another term-specific trend, Data Mart is usually the simpler statewide first stop.",
        "If you need annual program activity tied to student outcomes, equity, completion, or transfer, DataVista can add useful context.",
        "Document the unit of analysis and the time period in your table or narrative."
      ],
      cautions: [
        "Reported sections may not map perfectly onto locally understood classes or scheduling decisions.",
        "Enrollment counts can include the same student multiple times across courses.",
        "TOP-code changes can affect historical comparisons."
      ],
      links: [
        ["data-tools.html", "Choose the right source"],
        ["enrollment-trends.html", "Enrollment Trends guide"],
        ["sections-across-colleges.html", "Sections across colleges"]
      ]
    },
    ftes: {
      badge: "Use the definition first",
      title: "Do not treat every FTES number as interchangeable.",
      summary: "DataVista includes a calculated FTES metric for TOP-coded course activity, but its Metric Definition Dictionary states that it is not the official CCFS-320 apportionment methodology.",
      why: "FTES can mean different things depending on the calculation and purpose. A program-trend estimate and official apportionment FTES are not the same measure.",
      population: "Identify the courses, TOP code, year, hours/enrollments used, and whether the measure is a calculated program metric or an official fiscal/apportionment figure.",
      steps: [
        "If you want a DataVista program trend, use its calculated FTES only with the published definition and caveat.",
        "If you need official apportionment or fiscal FTES, use the appropriate local institutional/business-office source and official reporting process.",
        "If comparing with Data Mart or another source, confirm that the FTES methodologies are actually comparable.",
        "Label the source and calculation in every chart or narrative."
      ],
      cautions: [
        "DataVista calculated FTES is not official CCFS-320 apportionment FTES.",
        "Do not use a calculated program metric to make an apportionment claim.",
        "Missing or unknown hours can affect a calculated FTES measure."
      ],
      links: [
        ["ftes.html", "FTES guide"],
        ["datavista.html", "DataVista Made Simple"],
        ["local-data.html", "When Local Data Comes First"]
      ]
    },
    awards: {
      badge: "Data Mart for award counts",
      title: "Use the Program Awards report for detailed award production.",
      summary: "For a question about the number and type of degrees or certificates awarded in a program, Data Mart's Program Awards report is usually the most direct statewide report. Use DataVista when the question is about broader student completion outcomes.",
      why: "Awards issued and students completing are related but not identical concepts. A student can earn more than one award.",
      population: "Confirm whether the number counts awards or students. Do not label a count of awards as a count of unique graduates unless the definition explicitly supports that claim.",
      steps: [
        "Use Data Mart Program Awards for detailed statewide award counts by program and period.",
        "Use DataVista when your question is about completion as a student outcome or pathway metric.",
        "If you need unique local graduates or current conferrals, check the local institutional source.",
        "State clearly whether the unit is awards or people."
      ],
      cautions: [
        "Awards are not automatically unique graduates.",
        "Program coding changes can affect trend comparisons.",
        "Do not combine certificate and degree counts without explaining what is included."
      ],
      links: [
        ["program-awards.html", "Program Awards guide"],
        ["program-awards-viewer.html", "Explore a Program Awards export"],
        ["datavista.html", "DataVista completion context"]
      ]
    },
    transfer: {
      badge: "DataVista first",
      title: "Use DataVista for current transfer-oriented outcomes.",
      summary: "For most questions about student transfer progress or outcomes, start with DataVista and the applicable transfer/completion metric, then use Data Mart only for a specific legacy or report-based need.",
      why: "Transfer is a longitudinal student outcome, which fits DataVista's student-success and cohort architecture better than a stand-alone count alone.",
      population: "Check whether the metric follows a starting cohort, examines students in a selected year, or applies only after exit. Transfer measures can have different time horizons and denominators.",
      steps: [
        "Find the relevant transfer or completion metric in DataVista and read its definition before choosing a timeframe.",
        "Use a cohort view when the question is what happened to a defined starting group over time.",
        "Use Data Mart only when a specific traditional transfer report is necessary for your historical question.",
        "Use local transfer-center or institutional data for current service and process questions."
      ],
      cautions: [
        "Transfer measures can be lagged because the outcome occurs after enrollment or exit.",
        "A transfer rate may not use all enrolled students as its denominator.",
        "Do not compare measures with different cohort lengths as though they are identical."
      ],
      links: [
        ["transfer-data.html", "Transfer data guide"],
        ["datavista.html", "DataVista Made Simple"],
        ["snapshot-cohort.html", "Snapshot or Cohort?"]
      ]
    },
    workforce: {
      badge: "DataVista first",
      title: "Start with DataVista's workforce and labor-market views.",
      summary: "For employment, earnings, CTE, and labor-market questions, DataVista's Strong Workforce and Labor Market and Outcomes views are usually the strongest first stop.",
      why: "Those views are designed to connect program participation and outcomes with workforce measures rather than making you assemble separate reports manually.",
      population: "Employment and earnings measures often apply after exit and may be lagged. Check who is included, the exit definition, and the reporting period.",
      steps: [
        "Use DataVista Insights Labor Market and Outcomes for program/labor-market context.",
        "Use the Strong Workforce Program report when your question aligns with its defined CTE metrics.",
        "Read the exact employment or earnings metric definition because lag and denominator rules matter.",
        "Add local advisory-board, program, or regional evidence when making a program decision."
      ],
      cautions: [
        "Employment and earnings metrics may lag more recent enrollment data.",
        "Wages do not measure job quality, student goals, or causation by the program on their own.",
        "Regional labor-market context should not be treated as a guarantee of individual employment."
      ],
      links: [
        ["wage-trackers.html", "Wage and workforce guide"],
        ["datavista.html", "DataVista Made Simple"],
        ["data-tools.html", "Compare data sources"]
      ]
    },
    studentServices: {
      badge: "Local data first",
      title: "Use local service data for current practice, then add statewide context if needed.",
      summary: "Questions about current tutoring, counseling, basic-needs, outreach, or other service use usually require local operational data. Data Mart can add selected MIS service counts when a comparable statewide measure exists.",
      why: "Local systems are more likely to reflect current service design, eligibility rules, contacts, appointments, and campus-specific definitions.",
      population: "Define whether you are counting students served, service contacts, appointments, referrals, or enrollments. Those units are not interchangeable.",
      steps: [
        "Start with the local system that records the service or intervention.",
        "Confirm the local definition, reporting period, and whether repeat contacts are counted.",
        "Use Data Mart Student Services only when its MIS measure directly matches your comparison question.",
        "Connect service evidence to student outcomes cautiously rather than assuming the service caused the outcome."
      ],
      cautions: [
        "Service contacts are not necessarily unique students.",
        "Local and statewide service definitions can differ.",
        "Association with an outcome is not proof that the service caused it."
      ],
      links: [
        ["student-services.html", "Student Services guide"],
        ["local-data.html", "When Local Data Comes First"],
        ["data-tools.html", "Choose the right source"]
      ]
    },
    comparison: {
      badge: "Comparable definitions first",
      title: "Choose the metric before choosing the comparison college.",
      summary: "For cross-college comparisons, DataVista is often the strongest first stop for standardized outcomes; Data Mart can help with selected traditional reports. The comparison only works if definitions, populations, and timeframes match.",
      why: "A clean-looking peer comparison can still be misleading when colleges have different program mixes, coding, student populations, or reporting contexts.",
      population: "Use the same student group, TOP level, timeframe, metric definition, and denominator across colleges. Explain any known structural differences.",
      steps: [
        "Define the exact metric and population before selecting peers.",
        "Use DataVista for standardized student-outcome or annual program comparisons when available.",
        "Use Data Mart for a specific traditional report when the same filters can be applied consistently across colleges.",
        "Add context such as college size, program mix, modality, region, or mission before interpreting the difference."
      ],
      cautions: [
        "A ranking is not an explanation.",
        "Different TOP coding or program structures can make nominally similar programs unlike.",
        "Small subgroup counts may be suppressed."
      ],
      links: [
        ["task-college-comparison.html", "Compare Colleges Carefully"],
        ["compare-colleges.html", "College comparison tool"],
        ["data-tools.html", "Choose the right source"]
      ]
    },
    file: {
      badge: "Explore Data",
      title: "Start with the file you already have.",
      summary: "If you already downloaded an Excel or CSV file, use Explore Data to identify what the site can safely recognize, chart, compare, or explain before pulling another report.",
      why: "A downloaded file already contains choices about source, filters, population, and timeframe. Understanding those choices is more useful than immediately adding more data.",
      population: "Identify what each row represents and whether the file counts students, enrollments, sections, awards, grades, FTES, or another unit.",
      steps: [
        "Open Explore Data and select the export.",
        "Confirm the source and report type before interpreting any chart.",
        "Write down the filters, timeframe, population, and denominator that produced the file.",
        "If the file structure is not recognized, use the general table view rather than inventing a definition."
      ],
      cautions: [
        "Do not upload files containing student-level or confidential institutional records.",
        "The current report-specific parsers are strongest for Data Mart exports.",
        "A chart cannot repair an unclear denominator or population."
      ],
      links: [
        ["explore-data.html", "Explore Data"],
        ["exports.html", "Working with exports"],
        ["understand-data.html", "Understand the data"]
      ]
    },
    suppression: {
      badge: "Check the privacy rules",
      title: "A missing DataVista value may be suppressed, not zero.",
      summary: "DataVista masks small groups and can also suppress an additional value when simple subtraction could reveal a protected small count.",
      why: "Complementary suppression protects student privacy. That means a visible total plus several visible subgroups does not guarantee that every missing subgroup had zero students.",
      population: "Check the subgroup, metric, year, locale, and any second disaggregation. Suppression can operate across those dimensions.",
      steps: [
        "Look for DataVista messaging such as masked or All Masked Values.",
        "Do not replace a suppressed value with zero in your analysis.",
        "If the exact small count is essential for an authorized institutional purpose, use the appropriate secure local process rather than trying to infer it from public data.",
        "Explain suppression in the note under any table where missing values matter."
      ],
      cautions: [
        "For most DataVista metrics, positive counts under 10 are not publicly shown.",
        "Complementary suppression can mask an additional group with 10 or more to protect the first masked value.",
        "Do not try to back-calculate suppressed student counts."
      ],
      links: [
        ["understand-data.html", "Common data traps"],
        ["datavista.html", "DataVista Made Simple"],
        ["privacy.html", "Privacy and data safety"]
      ]
    },
    snapshotCohort: {
      badge: "Choose the population model",
      title: "Decide whether you need a snapshot or a cohort before choosing the metric.",
      summary: "Use a snapshot when you want to describe outcomes or characteristics in a selected year. Use a cohort when you want to follow the same defined starting group over time.",
      why: "Snapshot metrics can involve different students from one outcome to the next, while cohort metrics preserve a defined starting group across a chosen timeframe.",
      population: "Ask whether the same people must be followed across time. If yes, a cohort view is usually the better conceptual fit.",
      steps: [
        "Write the question in plain language: 'What happened in this year?' or 'What happened to the students who started then?'",
        "Choose Snapshot for the first kind of question and Cohort for the second.",
        "Check whether the chosen DataVista metric is actually available for that student group and timeframe.",
        "For cohorts, verify whether the selected year is complete for the required follow-up period."
      ],
      cautions: [
        "Do not interpret two snapshot metrics as though they necessarily describe the same students.",
        "Recent cohort years may be incomplete for long-term outcomes.",
        "Cohort length changes the meaning of the result."
      ],
      links: [
        ["snapshot-cohort.html", "Snapshot or Cohort?"],
        ["datavista.html", "DataVista Made Simple"],
        ["current-data.html", "Current data and incomplete years"]
      ]
    },
    dataVistaNavigation: {
      badge: "DataVista",
      title: "Choose the DataVista view that matches the question.",
      summary: "Use Single Metric when you know the exact measure, Metric Themes when you are exploring a broader part of the student journey, Reports for a statewide initiative, and Insights for supported equity or labor-market visualizations.",
      why: "DataVista is not one dashboard. Its views organize the same ecosystem of metrics for different kinds of questions.",
      population: "Single Metric and Metric Themes require you to choose a student group. Reports are already tied to the student group appropriate to that report.",
      steps: [
        "Use Single Metric when you can name the outcome you want.",
        "Use Metric Themes when you want related metrics around progress, success, employment, or another part of the academic experience.",
        "Use Reports when your work aligns with Vision 2030, Guided Pathways, Student Equity and Achievement, Strong Workforce, Comprehensive Student Report, or another listed initiative.",
        "Use Insights when a supported equity or labor-market visualization directly matches the question."
      ],
      cautions: [
        "Always read the Metric Definition Dictionary for the selected metric.",
        "Available drilldowns and disaggregations depend on the student group and metric.",
        "Recent or long-horizon metrics may not have complete data for every displayed year."
      ],
      links: [
        ["datavista.html", "DataVista Made Simple"],
        ["snapshot-cohort.html", "Snapshot or Cohort?"],
        ["data-tools.html", "Compare the data sources"]
      ]
    },
    dataMartSetup: {
      badge: "Data Mart",
      title: "Check the report, filters, and denominator before you run the query.",
      summary: "If you already know you need a Data Mart report, the next job is to make sure the report choice and filter setup actually match the question.",
      why: "A technically valid Data Mart query can still answer the wrong question if the term, college, subject/TOP, course, population, or outcome definition is off.",
      population: "Write down the unit being counted and the exact filters before interpreting the result.",
      steps: [
        "Identify the report that most directly matches the question.",
        "Set institution, timeframe, program/course, and subgroup filters deliberately.",
        "Use Check My Query before exporting or citing the result.",
        "Record the denominator and source URL with the final table."
      ],
      cautions: [
        "Do not choose a report only because its title sounds close to your question.",
        "Distinct students, enrollments, sections, awards, and FTES are different units.",
        "Statewide MIS data can lag local operational data."
      ],
      links: [
        ["check-query.html", "Check My Query"],
        ["reports.html", "Data Mart report guides"],
        ["query-guide.html", "Find the right data source"]
      ]
    },
    generic: {
      badge: "Clarify the question",
      title: "Start with the source-selection guide.",
      summary: "The question does not yet point strongly to one data source. Clarify what you want to know, who or what should be counted, and whether the decision is about current operations or a longer-term student outcome.",
      why: "Choosing a database too early is one of the easiest ways to end up with a technically correct number that answers the wrong question.",
      population: "Name the people or unit you mean: distinct students, course enrollments, sections, awards, FTES, a subgroup, or a starting cohort.",
      steps: [
        "Rewrite the question as one sentence beginning with 'I want to know whether...'",
        "Name the timeframe: current term, selected academic year, multi-year trend, or cohort follow-up period.",
        "Decide whether the question is about current local operations, a statewide outcome, or a traditional MIS report.",
        "Use the source-selection guide to choose DataVista, Data Mart, or local data."
      ],
      cautions: [
        "Do not pull more data until the unit of analysis is clear.",
        "A percentage without a denominator is not enough to interpret a pattern.",
        "One descriptive number rarely explains why something happened."
      ],
      links: [
        ["query-guide.html", "Find the Right Data Source"],
        ["data-tools.html", "Compare DataVista, Data Mart, and Local Data"],
        ["examples.html", "See example CCC data questions"]
      ]
    }
  };

  const RULES = [
    ["programReview", /program\s*review|comprehensive\s*program\s*review|\bcpr\b/i, 100],
    ["institutionalEffectiveness", /accredit|institutional\s+effectiveness|\bie\b|self[- ]evaluation|standards?\b/i, 95],
    ["hiring", /faculty\s+hiring|hire\s+(?:a|another|more)?\s*faculty|staffing|adjunct|ftef|overload|resource\s+request|need\s+(?:a|more)\s+(?:faculty|staff|equipment|resource)/i, 92],
    ["enrollmentPlanning", /add\s+(?:a|another)?\s*section|cancel\s+(?:a|the)?\s*section|schedule|scheduling|waitlist|fill\s*rate|class\s+fill|current\s+enrollment|right\s+now|this\s+term|next\s+semester|next\s+term|time\s+of\s+day/i, 90],
    ["equity", /equity|disproportion|disparit|gap\b|race|ethnic|gender|first[- ]generation|economically\s+disadvantaged|disaggregat/i, 88],
    ["suppression", /suppress|masked|masking|all\s+masked|missing\s+(?:group|subgroup|value)|why\s+is.*missing|less\s+than\s+10/i, 87],
    ["snapshotCohort", /snapshot|cohort|follow\s+(?:the\s+)?same\s+students|started\s+(?:in|then)|over\s+time.*same/i, 86],
    ["file", /downloaded|excel|csv|spreadsheet|export|file\b|upload/i, 84],
    ["comparison", /compare\s+(?:my\s+)?college|other\s+colleges|peer\s+college|benchmark|ranking|district\s+comparison|across\s+colleges/i, 82],
    ["gradeDistribution", /grade\s+distribution|what\s+grades|grades\s+(?:were|are)|\ba\b.*\bb\b.*\bc\b.*\bd\b.*\bf\b/i, 80],
    ["ftes", /\bftes\b|full[- ]time\s+equivalent\s+students?|apportionment|ccfs[- ]?320/i, 79],
    ["awards", /program\s+awards?|degrees?\s+awarded|certificates?\s+awarded|number\s+of\s+degrees|graduates?\b/i, 78],
    ["transfer", /transfer\b|four[- ]year|university\s+transfer/i, 77],
    ["workforce", /wage|wages|earnings|employment|labor\s+market|workforce|cte\b|strong\s+workforce/i, 76],
    ["studentServices", /student\s+services|counseling|tutoring|basic\s+needs|financial\s+aid|service\s+use|appointments?|outreach/i, 75],
    ["courseSuccess", /success\s+rate|retention|course\s+success|successful\s+completion|pass\s+rate|online.*(?:success|succeed)|in[- ]person.*(?:success|succeed)/i, 74],
    ["sectionsEnrollments", /number\s+of\s+sections|sections\s+offered|number\s+of\s+enrollments|enrollment\s+trend|enrollments\b|section\s+count/i, 72],
    ["studentSuccess", /student\s+success|pathway|persistence|persist|momentum|completion|complete\b|progress|guided\s+pathways/i, 70],
    ["dataMartSetup", /data\s*mart.*(?:query|setup|filter|report)|check.*data\s*mart|which\s+data\s*mart\s+report/i, 69],
    ["dataVistaNavigation", /datavista|single\s+metric|metric\s+themes|reports?\s+and\s+insights|which\s+view/i, 65]
  ];

  function chooseRoute(question) {
    const q = question.trim();
    if (!q) return "generic";
    let best = { id: "generic", score: 0 };
    for (const [id, regex, base] of RULES) {
      const match = q.match(regex);
      if (match) {
        let score = base;
        if (id === "courseSuccess" && /equity|gap|race|ethnic|gender|first[- ]generation|disaggregat/i.test(q)) score = 83;
        if (id === "sectionsEnrollments" && /current|this\s+term|next\s+term|next\s+semester|waitlist|fill/i.test(q)) score = 91;
        if (id === "studentSuccess" && /equity|gap|disparit|disaggregat/i.test(q)) score = 84;
        if (score > best.score) best = { id, score };
      }
    }
    return best.id;
  }

  function makeTextElement(tag, text, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text;
    return el;
  }

  function renderRoute(question, routeId) {
    const route = ROUTES[routeId] || ROUTES.generic;
    const section = document.getElementById("coachResultSection");
    const result = document.getElementById("coachResult");
    const echo = document.getElementById("coachQuestionEcho");
    const badge = document.getElementById("coachRouteBadge");
    const title = document.getElementById("coachRouteTitle");
    const summary = document.getElementById("coachRouteSummary");
    const why = document.getElementById("coachRouteWhy");
    const population = document.getElementById("coachRoutePopulation");
    const steps = document.getElementById("coachRouteSteps");
    const cautions = document.getElementById("coachRouteCautions");
    const links = document.getElementById("coachRouteLinks");

    echo.textContent = question.trim();
    badge.textContent = route.badge;
    title.textContent = route.title;
    summary.textContent = route.summary;
    why.textContent = route.why;
    population.textContent = route.population;

    steps.replaceChildren();
    route.steps.forEach(step => steps.appendChild(makeTextElement("li", step)));

    cautions.replaceChildren();
    route.cautions.forEach(caution => cautions.appendChild(makeTextElement("li", caution)));

    links.replaceChildren();
    route.links.forEach(([href, label], index) => {
      const a = makeTextElement("a", label, index === 0 ? "button button-primary" : "button button-secondary");
      a.href = href;
      links.appendChild(a);
    });

    section.hidden = false;
    window.requestAnimationFrame(() => {
      result.focus({ preventScroll: true });
      section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("coachForm");
    const input = document.getElementById("coachQuestion");
    const clear = document.getElementById("clearCoachButton");
    const exampleButtons = document.querySelectorAll(".coach-example-button[data-example]");

    if (form && input) {
      form.addEventListener("submit", event => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question) {
          input.setCustomValidity("Please enter a data question.");
          input.reportValidity();
          input.setCustomValidity("");
          return;
        }
        renderRoute(question, chooseRoute(question));
      });
    }

    if (clear && input) {
      clear.addEventListener("click", () => {
        input.value = "";
        document.getElementById("coachResultSection").hidden = true;
        input.focus();
      });
    }

    exampleButtons.forEach(button => {
      button.addEventListener("click", () => {
        if (!input) return;
        input.value = button.dataset.example || "";
        renderRoute(input.value, chooseRoute(input.value));
      });
    });

    const loadButton = document.getElementById("loadCoachButton");
    const container = document.getElementById("coachFrameContainer");
    const frame = container ? container.querySelector("iframe[data-src]") : null;
    if (loadButton && container && frame) {
      loadButton.addEventListener("click", () => {
        if (!frame.src) frame.src = frame.dataset.src;
        container.hidden = false;
        loadButton.hidden = true;
        frame.focus();
      }, { once: true });
    }
  });
})();
