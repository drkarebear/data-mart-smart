# CCC Data Coach Update — September 6, 2026

## What changed

The Ask the Coach page now begins with a private, browser-based question router instead of sending users directly to the external Playlab assistant.

The router:

- accepts ordinary-language CCC data questions;
- recommends DataVista, Data Mart, local institutional data, or a combination;
- distinguishes common tasks such as program review, equity inquiry, scheduling, hiring/resource requests, college comparisons, grade distribution, course success, FTES, awards, transfer, workforce outcomes, and student services;
- explains the population or unit of analysis to check;
- gives a short step-by-step path;
- surfaces cautions before the user cites a number;
- links to the relevant Data Mart Smart guide.

The local router does not use generative AI, does not send the user's question to a server, and does not store the question.

## Playlab status

The existing Playlab Coach remains available as an optional conversational follow-up. It is lazy-loaded only after the user explicitly selects the Load button. The site clearly separates the private local routing step from the external assistant.

## Supporting revisions

The Privacy, Accessibility, About, and Sources and Methods pages were updated to describe the new local Coach accurately.

## QA completed

- coach JavaScript syntax check passed;
- all site JavaScript files passed Node syntax checks;
- all 50 HTML files retained one main region and one H1;
- internal links and fragments were checked;
- Coach form controls are explicitly labeled;
- Coach example questions are native buttons;
- dynamic results use an aria-live region and keyboard focus management;
- user-entered question text is inserted with textContent rather than HTML;
- common routing examples were tested against expected categories.

## Deliberate limitation

The browser-based Coach is a routing and data-literacy tool, not a statistical analysis engine. It does not inspect a user's dataset or generate causal interpretations. That boundary is intentional.
