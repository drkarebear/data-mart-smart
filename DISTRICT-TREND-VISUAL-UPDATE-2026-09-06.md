# District trend visual update — 2026-09-06

Improved the multi-college line chart on `district-compare.html` for readability and responsive fit.

- widened the District Compare workspace on large screens while preserving responsive reflow
- removed crowded end-of-line labels from inside the plotting area
- added a responsive legend below the chart with each college and its latest returned value
- preserved both color and line-pattern differences so color is not the only cue
- kept highlighted-college emphasis while making the comparison lines easier to see
- changed the y-axis to clean whole-number intervals instead of awkward decimal ticks for award counts
- shortened academic-year tick labels in the chart (for example, 2021–22) while retaining full years in the table and method record
- made the SVG fit its available desktop width; small screens can still scroll the plot horizontally
- retained point tooltips and the accessible exact-value table below the visualization
