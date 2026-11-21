# Page blueprints: what each kind of page is for, and what goes where

Site mode asks for a page's job before its look. This page gives the section order that usually serves a visitor of each kind, the decision each section answers, and the action and proof that belong with it. The orders are starting recipes, not templates: keep only the sections the actual decision needs, in the order the visitor's questions arrive, and test the order with a real task (`journeys.json`) before polishing anything. The scale rule applies: a one-page site writes one entry per section in `CONTENT.md`; a site with several page types writes one per route.

Rules that hold for every type:

- **One action per decision point.** Each screen of the page has one visually dominant next step. A link goes somewhere, a button does something; use the native element for each. The same action may repeat down the page, with the same words.
- **Proof sits next to the claim it supports**, not in a wall of logos at the bottom. A testimonial, a metric or a customer logo needs a record in `CONTENT.md` (source, scope, date, permission) and a row in `ASSETS.json` when it is a picture. If the owner has none, the section is left out; nothing is drafted to fill the space. Where an endorsement is paid or given in return for something, check with the owner what must be disclosed in that market.
- **Every number is traceable.** Prices, limits, dates, percentages and counts come from the brief or the owner. A drafted number goes to review (`check_plan.mjs` flags it).
- **Say what happens next.** A button names its effect ("Start the 14-day trial", not "Submit"); a form says what will be done with the entry; a success message names the next step.
- **Declare the states.** Any page with a form, search, filter or fetched list lists its states in `routes.json`: idle, empty or no results, loading, validation error, service error, success. `check_layout` and `check_a11y` visit each declared state.

## Product launch (one product, one moment)

Order: what it is and what changed (with the date or availability) → the product in use → how it differs from what the visitor has now → availability, eligibility and limits → answers.

Action: buy, watch the demo, or join the waiting list, whichever matches the product's real status. A product that is not on sale yet must not carry a buy button. Proof: the demo shows the real product; supported claims only. Typical trap: a hero that is all mood and no product. Test: a stranger names the product and the next step in five seconds.

## SaaS (a tool someone will pay for)

Order: who it is for and the outcome → the workflow with the real interface shown → use cases → proof near the claims it backs → pricing or the evaluation path → objections (security, switching, cancelling).

Action: start a trial or book a demo, as the brief says, and make the comparison route obvious for buyers who are still weighing it. Pricing shows currency, billing cadence, the total commitment, meaningful limits, what is included and the next action; a plan comparison is a real `<table>` with row headers, and on a phone each plan keeps its association with its features. If a billing toggle changes the numbers, test the visible price, the terms, the destination and the announcement together. The sign-up path is a journey in `journeys.json`; until the service exists it ends at a fixture and the report says PENDING, not PASS, for the integration. Example: `examples/larkspur/`.

## Portfolio (a person or studio showing work)

Order: name and discipline → selected work, each with role and scope → case pages with the process and the outcome → about → contact.

Action: open a case, then reach the right contact path. Proof: credit collaborators and confirm each project may be shown. Decide how much of the design recedes behind the work; an expressive browsing mode (a rotating view, a cursor trail) always has a flat list reaching the same items. A case page has a stable address so it can be linked and tested from a deep link.

## Agency (a team others hire)

Order: who the studio works with and what it delivers → relevant work → the scope of services and the process → the people or client evidence → an enquiry.

Action: see related work, or send a brief. Ask only for what is needed to route the enquiry; a form with fifteen fields loses the visitor the work already won. Declare the form's states and test the error path with realistic input.

## Event (something that happens on a date)

Order: what, when (with the time zone) and where → featured people or the programme → tickets and availability → travel, access and refunds → questions.

Action: register or buy, or see the schedule. Reconcile every displayed date, venue, accessibility detail and ticket status against the organiser's source of truth; the date sheet is a row in `CONTENT.md`. A sold-out or past event says so and offers the next step. `templates/site-mode/` is a one-page event.

## Documentation (people come to do a task)

Order: product and version → search and sidebar → quickstart → tasks, reference and explanation kept apart → next steps.

Action: complete the quickstart from a clean environment, and say so when you did. Deep links carry the version and language. Navigation depth is real here: breadcrumbs, an in-page contents list for long pages, and search, tested as a journey ("find how to rotate a key").

## E-commerce product page

Order: title and useful media → price, variants, stock and the buy controls → shipping and returns → detailed specification, proof and comparisons.

Action: add the chosen variant to the cart. Check an unavailable variant, a price or stock change, image zoom, the totals and the recovery from an error. Structured data (product, offer) must match what the page shows.

## States every type needs

| State | What the visitor sees | How to test it |
|---|---|---|
| Idle | The form or list as it first loads | the default route |
| Empty or no results | What is missing and what to do about it | a declared state with the steps that produce it |
| Loading | A sized placeholder where the layout is known; a short status for a pending action | slow the request, or declare the state |
| Validation error | An error summary linking to each field, a message beside each field, the entry kept | submit the empty form |
| Service error | What failed, that the data is safe, how to retry | fail the request |
| Success | A receipt that says what happened and the next step | the journey's expected outcome |

`routes.json` declares these as `states` with `steps` in the same role-and-name language as journeys; the checkers load each one.

## Further reading

GOV.UK Design System patterns for question pages and error summaries: <https://design-system.service.gov.uk/patterns/question-pages/>. The W3C WAI tutorials on form notifications and the table pattern: <https://www.w3.org/WAI/tutorials/forms/notifications/>, <https://www.w3.org/WAI/ARIA/apg/patterns/table/>. Google's guidance on event and product structured data: <https://developers.google.com/search/docs/appearance/structured-data/event>, <https://developers.google.com/search/docs/appearance/structured-data/product>. The Diataxis framework for documentation: <https://diataxis.fr/>.
