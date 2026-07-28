# Copy Testing and Editing Reference

## Job

Help an agent diagnose copy performance, edit with evidence, validate early messages, and design experiments that produce useful learning. The aim is not to win arguments about taste or to test arbitrary page parts. It is to find where a reader’s progress breaks, propose a reason, make a controlled improvement, and evaluate the result with an appropriate method.

## Inputs

Collect before editing or testing:

- The business goal, user goal, and exact conversion event.
- The funnel or journey from entry source through the target action.
- The job assigned to each message and interface element.
- Baseline analytics with clear definitions and comparable date ranges.
- A metric dictionary containing each numerator, denominator, scope, attribution rule, identity rule, and data source.
- Traffic, conversion volume, audience quality, channel mix, seasonality, and test duration constraints.
- Voice-of-customer research and known reader motivations, objections, language, and awareness.
- Current copy, design context, variants, and prior test history.
- Tracking implementation, attribution model, consent constraints, and data-quality limitations.
- The problem statement, learning question, hypothesis, primary metric, guardrails, and stopping rule.
- The commercial mix where relevant, including revenue, order count, average order or sale value, margin, refunds, and product tier.
- Stakeholder, legal, accessibility, SEO, brand, and technical constraints.

## Decision Rules

1. **Ask what must be learned about the reader.** Do not begin with a menu of headlines, buttons, colors, or layouts. The learning question should generate the treatment, not the reverse.
2. **Define the problem below the level of “conversion is low.”** Locate the stage where behavior diverges from the intended journey, such as weak entry-page retention, unqualified leads, opens without clicks, cart drop-off, or payment hesitation.
3. **A KPI measures progress toward a goal; it is not the goal itself.** Select only the few measures needed to judge the decision. A dashboard full of available metrics does not make the work more evidence-based.
4. **Define every rate before comparing it.** Similar labels may use different denominators, scopes, identity rules, or attribution windows. Treat two values as comparable only after their formulas and data populations match.
5. **Assign one local job to each element.** A subject line earns an open, a headline keeps qualified attention, body copy builds understanding and desire, and a CTA earns an accurate next step. Local jobs must connect to the same end goal.
6. **Inspect adjacent steps.** A weak metric at one element may be caused by a promise mismatch upstream or an experience defect downstream. Do not edit in isolation.
7. **Use customer and behavioral evidence, not personal taste.** “I like it” and “I dislike it” are not decision criteria. Translate feedback into an observation about the audience, message, goal, evidence, or constraint.
8. **Prefer clarity, relevance, and specificity before persuasion devices.** Make the offer, audience, value, terms, and action understandable. Add urgency, proof, incentives, or stylistic risk only when supported and appropriate.
9. **Write copy before forcing it into a layout.** Design should create hierarchy, readability, and attention for the message. Validate in realistic visual context because presentation still affects interpretation.
10. **Write for qualified readers, not universal approval.** Match language and detail to the intended audience’s knowledge and motivation. Explain unfamiliar terms rather than excluding readers accidentally.
11. **Do not use rigid copy rules as laws.** Length, feature-versus-benefit order, punctuation, button wording, and formatting depend on reader, context, and goal. Historical examples are hypotheses, not current universal truths.
12. **Interpret engagement metrics as a set.** Traffic, time, pages viewed, bounce or engagement, and local clicks can help locate friction, but none alone proves copy quality or buyer intent. Page type, task, source, device, and site architecture change what a healthy pattern looks like.
13. **Measure outcome quality as well as outcome count.** Equal conversion totals may conceal differences in conversion rate, revenue, product mix, order value, margin, refund, or retention. Choose the commercial guardrails that fit the business.
14. **Use five-second validation only for first-impression questions.** It can help assess immediate clarity, recall, or response to a headline, value proposition, ad, or subject line. It cannot evaluate body copy, considered decisions, or conversion impact.
15. **Use A/B tests only when the setup can answer the question.** The audience, event volume, instrumentation, randomization, duration, and analysis must be adequate. Low-volume programs should favor stronger treatments, qualitative methods, or sequential learning rather than false precision.
16. **Predefine success.** Choose the primary metric, guardrails, analysis method, minimum sample or duration, and stopping conditions before reading results.
17. **Do not react to early movement.** Initial lifts can reverse. Wait for the agreed decision standard and check the calculation independently when stakes warrant it.
18. **Treat flat and losing results as evidence.** A test can reject an assumption, reveal a weak treatment, or motivate a follow-up. Do not keep only attractive outcomes.
19. **Preserve message match.** A click obtained through ambiguity or misdirection is not a success if the next page loses trust or qualified conversions.
20. **Prefer comparable local baselines over generic benchmarks.** External averages can supply context, but the most useful comparison usually uses stable local definitions, audience, offer, and period.
21. **Do not make historical conversion lifts into promises.** Results belong to the tested audience, offer, implementation, period, and metric.

## Workflow

### 1. Establish the measurement contract

Define:

- the user action the work should improve;
- whether the conversion is free, paid, or behavioral;
- the baseline period and data source;
- the primary outcome and safety metrics;
- the attribution method; and
- known measurement gaps.

For client work, request access appropriate to the funnel, such as web analytics, behavior recordings or maps, CRM reports, email reports, surveys, transaction data, and prior experiments. Missing data changes scope and confidence, so document it early.

### 2. Build the metric dictionary

For every metric used in a diagnosis or decision, record:

- its purpose in relation to the goal;
- numerator and denominator;
- unique-person, session, event, order, or message scope;
- inclusion and exclusion rules;
- channel and attribution window;
- reporting timezone and comparison period;
- source system and known collection limits; and
- owner responsible for confirming the definition.

For email, distinguish at minimum delivered messages, unique opens, unique clickers, total clicks, conversions, and attributed conversions. A click-through rate based on delivered messages is not the same measure as a click-to-open rate based on opens.

For commerce, calculate an order or sale-value measure when mix matters. Revenue divided by conversions can reveal whether a treatment changes what customers buy even when conversion count is similar. Add margin, refunds, or retention when gross revenue would reward the wrong outcome.

For websites, distinguish sessions from users and document how identity is estimated. Cookie deletion, consent choices, multiple devices, browser restrictions, and reporting changes can make “unique user” counts approximate rather than literal.

### 3. Map the conversion path

List the sequence of entry messages, page elements, interactions, and destinations. Assign a single immediate job to each. Examples:

- acquisition message creates a qualified visit;
- landing headline confirms relevance and preserves attention;
- supporting copy explains value and resolves objections;
- proof makes important claims more believable;
- CTA describes and earns the next step;
- form or checkout makes completion understandable and easy.

Attach the relevant metric or qualitative signal to each stage. Look for the first meaningful break rather than rewriting the whole path.

### 4. Diagnose the break

Use multiple forms of evidence:

- analytics to locate where behavior changes;
- channel, source, audience, device, and page-type breakdowns to test whether an aggregate hides a local problem;
- recordings, heatmaps, or usability observations to see friction;
- customer language to understand motives and objections;
- support, sales, and survey data to reveal confusion;
- message comparison to find expectation gaps; and
- technical QA to rule out defects.

Write a specific problem statement. Then inspect the failing element and at least one step before and after it.

Interpret common signals cautiously:

- **Email opens:** primarily diagnose sender, subject, timing, deliverability, and measurement conditions; privacy protections may make opens directional rather than human-confirmed.
- **Email clicks:** diagnose whether the body and CTA earned action, while preserving the distinction between delivery-based and open-based rates.
- **Traffic or users:** show reach, not copy effectiveness by themselves, and may reflect acquisition spend, ranking, referrals, or tracking changes.
- **Time and pages viewed:** may indicate useful exploration or difficulty finding an answer. Read them against the task and conversion outcome.
- **Bounce or engagement:** interpret with page purpose and other behavior. A one-page answer can succeed without another pageview.
- **Conversion and value:** verify that the event worked, the conversion was qualified, and the product or revenue mix did not deteriorate.

### 5. Form a learning hypothesis

Use this structure:

> We observed **evidence** at **journey stage**. We believe **reader interpretation or obstacle** is contributing because **reason**. If we change **message or experience** for **audience**, we expect **defined behavior** to improve without harming **guardrails**.

A useful hypothesis describes the person and mechanism, not merely the UI part being changed.

### 6. Edit from evidence

Create more source material than the final copy needs, then edit in passes:

1. **Audience and relevance:** Make clear who the offer suits and why it matters now.
2. **Clarity:** State the product, service, value, and action without relying on implication.
3. **Specificity:** Replace abstract claims with concrete use, outcome, terms, or examples supported by evidence.
4. **Benefit depth:** Connect features to immediate and downstream reader outcomes where relevant.
5. **Message hierarchy:** Put the most decision-relevant information first and organize sections for scanning.
6. **Proof and risk:** Place substantiated evidence and risk reducers beside the claims or actions they support.
7. **Action:** Use a clear, descriptive CTA and remove dead ends or competing goals.
8. **Readability:** Prefer familiar words, manageable line length, short chunks, meaningful headings, accessible contrast, descriptive alt text, and visible focus states.
9. **Voice:** Preserve customer language and an authentic brand tone without polishing away specificity.
10. **Accuracy:** Remove unsupported promises, false scarcity, manipulative framing, and claims the experience cannot fulfill.
11. **Proofread:** Check grammar where it affects meaning, spelling, links, numbers, and consistency of terms.

Do not equate brevity with quality. Remove copy that does no useful job; retain the amount needed to support the reader’s decision.

### 7. Choose the evidence method

Use the narrowest method that can answer the learning question:

- **Heuristic review:** Find obvious clarity, relevance, hierarchy, accessibility, or continuity defects.
- **Customer review or interview:** Understand motives, interpretation, language, and objections.
- **Behavioral observation:** Identify navigation, comprehension, or interaction friction.
- **Five-second validation:** Check immediate recall, clarity, or attitude toward a first-touch message.
- **A/B experiment:** Estimate the causal effect of a live treatment when traffic and conversion volume are adequate.
- **Before-and-after monitoring:** Use cautiously when randomization is unavailable; account for seasonality, channel mix, offer changes, tracking changes, and other confounders.

Validation can screen out unclear ideas before a live experiment, but it does not prove conversion impact.

### 8. Run a five-second validation when appropriate

1. Select a first-touch message and one learning goal.
2. Choose one response mode, such as recall, target identification, or immediate attitude.
3. Write neutral instructions that do not reveal the answer.
4. Ask only the few questions required by the goal.
5. Put questions needing precise recall first.
6. Present the copy in a realistic, non-distracting visual context.
7. Use participants with broadly relevant language and behavior; exact buyer demographics are not always required for a clarity check.
8. Preview the full test for clipping, scrolling, distraction, priming, and ambiguous questions.
9. Tally repeated interpretations and non-responses.
10. Revise and run another small round when needed.

Treat findings as directional insight. Do not label a small validation exercise statistically conclusive.

### 9. Design and run an A/B test

Before launch:

- verify tracking with QA or an A/A check when appropriate;
- estimate whether traffic and event volume can support the decision;
- define eligible users, randomization unit, variants, duration, primary metric, guardrails, and stopping rule;
- record metric formulas and attribution rules with the protocol;
- record all meaningful differences between treatments;
- ensure each treatment continues the promise into the next step; and
- confirm the business can implement the winner.

During the test:

- monitor for instrumentation failures and material external events;
- avoid repeated peeking and early declarations;
- do not change the treatment midstream; and
- preserve a record of traffic allocation and anomalies.

After the test:

- verify the analysis and uncertainty;
- assess guardrails, outcome value, and downstream behavior, not only local clicks or conversion count;
- segment only when planned or clearly exploratory;
- document limitations; and
- hard-code an adopted treatment rather than leaving the testing layer as permanent production logic.

### 10. Interpret and iterate

Classify the outcome:

- **Adopt:** The treatment improves the primary outcome without unacceptable harm.
- **Retain control:** Evidence favors the incumbent or the treatment harms important outcomes.
- **Inconclusive:** The data cannot distinguish the variants under the agreed standard.
- **Operational failure:** Tracking, allocation, implementation, or external conditions invalidated the test.

In every case, state what was learned about the reader and what remains unknown. A weak first treatment may still support a better combined or follow-up treatment. Iterate from the mechanism, not from cosmetic differences.

## Controlled Failures

- **Stakeholder feedback is purely personal:** Ask which audience fact, business goal, constraint, or observed behavior the preference reflects. Record taste separately from evidence.
- **No baseline exists:** Establish measurement before making performance claims. If change cannot wait, document the intervention and confidence limits.
- **Analytics definitions conflict:** Resolve what counts as a user, session, delivery, open, click, lead, purchase, or attributed conversion before comparing results.
- **A report label hides the denominator:** Recalculate from source counts or obtain the formula. Do not compare click-through with click-to-open, total activity with unique activity, or different attribution windows as though they were the same KPI.
- **Tracking is broken:** Stop the experiment, preserve affected dates, repair instrumentation, and restart with a clean protocol.
- **Privacy, consent, or platform changes alter measurement:** Mark the discontinuity, avoid direct before-and-after claims across incompatible periods, and choose a more stable signal where possible.
- **Traffic or conversions are too low:** Do not force an A/B verdict. Use interviews, usability work, five-second checks, larger hypothesis-driven changes, or longer-term monitoring.
- **Participant instructions prime the answer:** Discard the contaminated run, rewrite neutrally, and repeat.
- **The visual context distracts from the copy:** Improve the test artifact so it resembles the real experience without introducing irrelevant visual noise.
- **Five-second feedback is requested for long copy:** Choose a comprehension interview, usability task, or live behavioral test instead.
- **A local metric rises while downstream conversion falls:** Treat the local treatment as harmful or misleading. Inspect message continuity and audience quality.
- **Conversion count rises while value or mix worsens:** Evaluate the predeclared commercial guardrails before adoption. A larger number of lower-quality outcomes may not be a business win.
- **Engagement looks healthy but conversion is weak:** Verify forms, checkout, payment, shipping, geography, inventory, and event tracking before assigning the problem to copy.
- **Aggregate performance is weak but segments conflict:** Diagnose source, device, audience, and page type separately before making a sitewide change. Label unplanned segment findings exploratory.
- **Early results swing:** Continue to the predeclared stopping point unless a safety or instrumentation issue requires termination.
- **A treatment loses:** Preserve the record, identify which mechanism was not supported, and decide whether to revise, combine, or abandon it.
- **A result is inconclusive:** Do not relabel a trend as a win. Report the detectable limits and choose whether more data is worth the cost.
- **Several defects exist:** Fix objective breakage and compliance issues first. Prioritize experiments by expected value, evidence strength, reach, and cost.
- **Copy passes validation but fails live:** Accept that clarity and conversion are different questions. Revisit motivation, offer, traffic quality, and downstream experience.

## Validation

Before declaring copy or an experiment complete:

- Confirm the reader, journey stage, and conversion event are explicit.
- Confirm every major element has one immediate job and supports the same end goal.
- Trace recommendations to analytics, customer evidence, or a clearly labeled hypothesis.
- Remove subjective approval as a success criterion.
- Check message continuity from acquisition source through CTA and destination.
- Verify claims, numbers, offers, urgency, testimonials, and terms.
- Review mobile and desktop readability, accessibility, links, forms, and error states.
- QA experiment eligibility, allocation, variants, events, and reporting.
- Verify every reported rate’s numerator, denominator, uniqueness rule, attribution window, and date range.
- Confirm user and session measures account for known identity and consent limitations.
- Evaluate conversion quality with the applicable value, mix, margin, refund, or retention guardrails.
- Use the predeclared metric, guardrails, duration, and decision standard.
- Report uncertainty, confounders, and whether findings are directional or causal.
- Save the baseline, metric definitions, hypothesis, treatment, screenshots or copy, dates, result, and next action.
- Recheck performance after implementation to ensure the production version matches the tested treatment.

## Sources

- https://copyhackers.com/2012/06/101-copywriting-dos-and-donts/
- https://copyhackers.com/2022/06/analytics-questions/
- https://copyhackers.com/2020/02/copy-validation/
- https://copyhackers.com/2012/10/if-you-want-amazing-results-stop-asking-what-should-we-test/
- https://copyhackers.com/2015/03/measure-your-copy-infographic/
- https://copyhackers.com/2014/10/running-ab-tests/
- https://copyhackers.com/2012/02/the-reason-you-should-never-ever-give-this-most-useless-piece-of-feedback/
- https://copyhackers.com/top-10-kpis-for-conversion-copywriters/
