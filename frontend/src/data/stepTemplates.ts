import type { StepTemplate } from '@/types/api'

// The six participant-facing templates, copied VERBATIM from
// docs/cookbook-chatbot-prompts.md. [bracketed] blanks are filled by the
// participant in the composer — never auto-filled. Do not paraphrase or reword.
export const STEP_TEMPLATES: readonly StepTemplate[] = [
  {
    step: 0,
    name: 'Frame',
    descriptor: 'State your challenge',
    template: `We're going to work through a structured process to turn a business challenge into a buildable AI pilot concept, one step at a time.

The challenge I want to work on:
[describe your challenge in 2–4 sentences]

Context that matters — organization, the people affected, constraints, anything relevant:
[add your own context]

Don't propose solutions yet. Confirm you understand by restating the challenge and its context in your own words in 3–4 sentences, flag anything important that's still unclear, then wait for me to continue.`,
  },
  {
    step: 1,
    name: 'Widen',
    descriptor: 'Explore the problem space',
    template: `Act as a research aide for the challenge we just framed. Map the problem space: the key personas, their top pains, the current workarounds they use, and how success would be measured.

Return 5 insights and 3 risks specific to this challenge.`,
  },
  {
    step: 2,
    name: 'Diagnose',
    descriptor: 'Find the root cause',
    template: `Let's focus on this pain point: [name the single pain point you want to dig into].

Run a Five Whys on it. Then propose 3 root-cause hypotheses, and for each, the evidence that would disprove it. Specify the minimum data you'd need to pull to test these, and who would own that data.

Output a root-cause map, a test plan, and any privacy or data constraints to respect.`,
  },
  {
    step: 3,
    name: 'Ideate',
    descriptor: 'Generate & choose a pilot',
    template: `Generate and cluster possible AI-driven ideas to address the root cause we identified, into three categories:
1. Process — policy and ways of working
2. Analytics / ML — forecast, optimise, recommend
3. AI & Automation — computer vision, retrieval-augmented generation, agentic AI, and similar

Score each idea on Impact × Feasibility × Confidence × Time-to-Value. Then recommend one pilot to take forward — the one with the smallest integration surface and the clearest proof of value.`,
  },
  {
    step: 4,
    name: 'Brief',
    descriptor: 'Write the pilot brief',
    template: `For the recommended pilot, create a pilot brief covering:
- target users
- problem statement
- success metrics and their baselines, plus the target uplift
- the key user flow in 5–7 steps
- screens / components
- sample UI copy
- representative sample data
- integration points
- guardrails: regulatory boundaries, bias tests, and fallback behaviour`,
  },
  {
    step: 5,
    name: 'Build',
    descriptor: 'Create the build prompt',
    template: `You are a product design expert. Using only the pilot brief above, write a single product-requirements prompt for [name your build platform].

The prompt must include: product name, a one-line description, who it's for, screens and key components, brand colours, the main user flow, sample data, concise headlines and CTAs, UI instructions, a success-metric card, and constraints (including no PII).

Return only the [platform] prompt, nothing else.`,
  },
]
