---
name: case-study-copywriting
description: Write, revise, interview for, or review customer and portfolio case studies. Use when the task is a case study, success story, project proof page, client interview, case-study headline, or case-study CTA. Follows a Copyhackers-inspired strategy, candidate, interview, story, and reuse workflow. Enforces checked claims, grade 6 or lower, no em dashes or colons in published copy, and no AI slop.
version: 1.0.0
tags: [copywriting, case-studies, content, proof]
dependencies: [verification-before-completion]
tools: [read, grep, find, ls, bash]
---

# Case Study Copywriting

Create a case study, not a homepage, landing page, or general project summary.

This skill independently adapts the case-study method in Joel Klettke's Copyhackers article [I've Helped Create 150+ Case Studies. Here's Almost Everything I've Learned](https://copyhackers.com/2019/05/writing-case-studies/). Use the decisions, not the source's jokes, phrases, examples, or voice.

## Hard Copy Rules

Apply these rules to all visible copy, headings, titles, and metadata.

- Aim for Flesch Kincaid grade 6. Treat grade 6 as the ceiling.
- Never use an em dash.
- Never use a colon.
- Use only checked facts and approved public evidence.
- Do not invent pain, praise, quotes, scale, revenue, intent, or impact.
- Do not use a client name, logo, quote, or private result without permission.
- Keep the client, user, or operator as the main character. The service is not the hero.
- Write in the owner's real point of view. Do not use "we" for solo work.
- Name problems, tradeoffs, failed paths, and limits that shape the result.

## Define the Strategy First

Before choosing a story or drafting copy, answer three questions.

1. What should this case study help the reader decide or do?
2. Who is the exact reader?
3. Where will the case study be used in the reader's path?

The answers control the candidate, length, proof, detail, and CTA. A strong story that attracts the wrong work is the wrong case study.

For a portfolio project with no client, treat the target project and its user as the candidate. Use repository evidence, tests, measurements, and public artifacts in place of an interview. Do not present the maker's guess as user testimony.

## Choose a Story That Fits the Goal

Prefer a candidate or project with these traits.

- The starting problem matches the target reader's problem.
- The work shows the service or skill you want to sell.
- The result has useful proof.
- The subject can explain what changed and why it mattered.
- Permission covers every public name, quote, logo, and result.

Do not choose a story only because its metric looks large. A smaller result that matches the reader can carry more weight.

When permission is missing, redact the identity or omit the claim. Never treat outreach, a draft, or silence as approval.

## Build the Evidence Packet

Read the target repository, content schema, tests, proof records, and public sources before asking for facts already present.

Record each item as fact, inference, unknown, or blocked.

- Goal, reader, and placement
- Subject and permission state
- Before state
- Trigger for change
- Desired result
- Work done
- Reason for each key choice
- Friction, failed path, or adjustment
- Result, sample, time frame, and measure
- Human or business meaning supported by the subject
- Limits and what remains unknown
- One CTA tied to the reader's next step

If the packet cannot support a result, write a build case study with clear limits. Do not turn it into a success story.

## Interview for Before, During, and After

Use one main interviewee when possible. Use two only when each person owns a needed part of the story.

Send open questions before the call. Test recording tools. Get consent to record. Listen more than you speak. Ask why, ask for an example, and follow up on vague words.

### Before

- What was happening before the change?
- What made the old way hard or risky?
- What had already been tried?
- What did success need to look like?

### During

- Why was this path chosen?
- What changed first?
- What was hard, slow, or unclear?
- What failed or had to be revised?
- What helped the subject keep moving?

### After

- What changed in the work or result?
- How was that change measured?
- Why did the result matter to the subject?
- What did not change?
- What would the subject tell a peer with the same problem?

Verify names, dates, metrics, quotes, and meaning after the interview. Give the subject the promised review and approval control.

## Write the Story

Use this order unless the evidence gives a clear reason to change it.

### Headline

Give the reader a reason to continue. Lead with an approved result, a known problem, or a subject the reader can relate to. Keep it direct. Avoid a title that says only the company name and "case study."

If there is no strong metric, use the shared problem or useful outcome. Never force a weak number into the title.

### Challenge

Start close to the moment when the old way stopped working. Show who faced the problem, what was at stake, and why change was needed. Use concrete events and approved details. Do not manufacture drama.

### Solution

Explain why the key choices were made. Tie each feature, step, or design choice to a task or outcome the subject cared about. Include a real snag or adjustment when it shaped the work. A clean story is not the same as a false story.

### Results

Report the measure with its baseline, sample, time frame, and comparison. Then explain why it mattered using approved evidence from the subject. Separate measured results from observations and open questions.

State what the result does not prove. One case is evidence, not a forecast for every reader.

### Call to Action

End with one next step that fits the reader's stage and the story they just read. A reader near a buying choice may need a service conversation. An early reader may need a related case study or useful resource.

Do not add several equal CTAs.

## Set Length From Use

Do not chase a fixed word count.

- Use a short version when the reader is cold, busy, or sorting many options.
- Use a fuller version when the reader already wants detail or must judge the work.
- Keep every version long enough to prove the result and name its limits.

A full story can also produce a short proof card, sales-deck slide, approved quote, social post, or email excerpt. Each reused part must keep enough context to stay true.

## Keep Grade 6 Copy Natural

- Put one main thought in each sentence.
- Aim for 8 to 16 words in most sentences.
- Use common words and clear verbs.
- Name the actor before the action.
- Explain a needed technical term in the same line.
- Break setup text into short sections or lists.
- Keep digits when they make proof easier to scan.
- Keep a natural flow. Do not make every line short just to lower the score.

Never drop a limit, source note, or needed detail to lower the grade. Rewrite it in plain words.

## Remove AI Slop

Delete or rewrite these patterns.

- Empty openings about a fast-paced world
- Stock words such as delve, unlock, seamless, robust, transformative, revolutionary, cutting-edge, game-changer, landscape, journey, and testament
- Staged lines built as "not just X, but Y"
- Forced groups of three that add no meaning
- Vague praise such as powerful, impressive, innovative, or best-in-class
- False suspense, fake questions, and dramatic reveals
- Claims that a system ensures an outcome when it only checks or lowers risk
- Repeated metric lines that add no context
- Endings about endless possibility or an ongoing journey

Prefer concrete nouns, plain verbs, checked proof, and honest limits.

## Quality Gate

Run the checker from this skill directory against the final Markdown or plain text.

```bash
node scripts/check-copy.mjs path/to/draft.md
```

Resolve every grade, em dash, colon, and stock-phrase failure. Then complete a manual claim and permission check because the script cannot prove either one.

Report these facts before completion.

- Estimated reading grade
- Em dash count of zero
- Colon count of zero
- Unsupported claim count of zero
- Permission gaps of zero for published evidence
- Remaining evidence limits

Do not claim completion when the checker fails, a claim lacks proof, or publication permission is unclear.

## Result Contract

```xml
<skill_result>
  <skill>case-study-copywriting</skill>
  <status>success|partial|blocked|failure</status>
  <evidence>Strategy, candidate fit, interview or repository evidence, permission state, copy check, and claim review</evidence>
  <artifacts>Evidence packet, approved case-study draft, optional short reuse cuts</artifacts>
  <risks>Unsupported result, missing permission, weak candidate fit, grade drift, AI slop, or none</risks>
</skill_result>
```
