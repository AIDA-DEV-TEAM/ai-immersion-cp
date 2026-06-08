# Test Challenge Library — AI Immersion Chatbot

A set of **test fixtures** for manually exercising the six-step flow
(Frame → Widen → Diagnose → Ideate → Brief → Build). Each is a Frame-ready
challenge + context you can paste into the Frame template's two blanks.

**Important — what these are and aren't:**
- These are **test data only**: plausible scenarios invented to exercise the
  app, not real client challenges and not data from any actual workshop.
- The titles come from the original cookbook's "challenge cards." That
  **challenge-card feature was deliberately dropped** — participants frame
  their own challenge at the Frame step now. This file is a *test fixture
  library*, NOT a revival of the card picker. Don't build against it.
- The 12 scenarios span deliberately different industries. That variety is
  itself a test: the guardrail must treat **every** one as in-process (the
  methodology is content-agnostic — any business challenge in any domain is
  valid), so all 12 should sail through without a redirect.

**How to use one:** insert the Frame template, paste the Challenge and Context
below into its two blanks, send. Then advance through the steps with each
step's own template. The only mid-flow genuine inputs are the Diagnose
`[pain point]` (a suggested one is given per challenge) and the Build
`[platform]` (use whatever build tool you'd prototype in — same for all).

**What to verify** (same for any fixture): the thread compounds (Widen and
later steps reference *this specific* challenge, not generic content); Frame
restates without proposing solutions; markdown renders cleanly in both themes;
the guardrail never redirects a genuine challenge; the final Build output shows
the copy / export-.md controls and earlier steps don't.

---

## 1. ThinScore: Bureau-Free Credit for Invisible Millions

**Challenge:**
> We want to lend to people who have no credit history at all, but we have no
> reliable way to judge whether they'll repay. Traditional scoring needs a
> credit bureau record, and our target customers have never had a loan, card,
> or formal account — so they're invisible to the system and get rejected by
> default. We're either turning away good borrowers or taking on risk blindly.

**Context:**
> We're a digital lender in an emerging market trying to serve first-time
> borrowers. The people affected are the credit-invisible applicants, our
> credit officers who have nothing to assess, and our risk team. Constraints:
> no bureau data exists for these customers, we operate under fair-lending and
> data-protection rules, and we can't ask for documents most applicants don't
> have.

**Suggested Diagnose pain point:** the inability to assess repayment risk for
applicants with no formal financial history.

---

## 2. Farm-to-Fork-to-Finance Agritech Credit

**Challenge:**
> Smallholder farmers in our network can't get credit because lenders have no
> way to assess them, even though we sit on data about what they grow, sell,
> and deliver. The information is scattered across the supply chain — buyers,
> cooperatives, logistics — and never reaches the people making lending
> decisions. Farmers who are clearly creditworthy on the ground still get
> turned down.

**Context:**
> We're an agritech platform connecting smallholder farmers to buyers and want
> to extend financing. Affected: the farmers, our field agronomists, and
> partner lenders. Constraints: data is fragmented across many parties and
> formats, incomes are seasonal and irregular, and rural connectivity is
> patchy.

**Suggested Diagnose pain point:** lending decisions being made without the
farm and supply-chain data that already exists but never reaches lenders.

---

## 3. Real-Time Voice Translator

**Challenge:**
> Our support agents and our customers often don't share a language, and the
> handoffs to human interpreters are slow, expensive, and break the flow of the
> conversation. Existing translation tools lag, mangle our industry-specific
> terms, and can't keep up with a live back-and-forth. Calls take far longer
> than they should and customers feel unheard.

**Context:**
> We run a customer-support operation serving a multilingual customer base.
> Affected: frontline support agents, non-native-speaking customers, and the
> interpreter pool we currently lean on. Constraints: real-time latency
> matters, our domain has specialized terminology, and some interactions touch
> regulated or sensitive information.

**Suggested Diagnose pain point:** the delay and accuracy loss when bridging a
language gap mid-conversation.

---

## 4. Automated Household Conversion

**Challenge:**
> Getting a household to switch onto our new plan is a slow, manual slog —
> paperwork, eligibility checks, and back-and-forth that takes weeks and loses
> people halfway through. Each conversion is handled largely by hand, so the
> team can only process so many, and a big share of interested households drop
> out before they finish. We're leaving willing customers stranded in the
> process.

**Context:**
> We're an energy/utility retailer converting households onto a new tariff.
> Affected: the onboarding/sales team, and the households trying to switch.
> Constraints: a manual eligibility and paperwork process, regulated switching
> rules we must follow, and customer data spread across legacy systems.

**Suggested Diagnose pain point:** the manual, multi-step conversion process
that causes interested households to drop out before completing.

---

## 5. Scam to Closure: Agentic Victim Resolution

**Challenge:**
> When a customer is scammed, getting their case to resolution is slow,
> repetitive, and confusing for someone already distressed. The case bounces
> between teams, the victim re-tells their story multiple times, and steps that
> could move in parallel happen one at a time. Cases stall, and people who've
> just lost money are left chasing us for updates.

**Context:**
> We're the fraud and victim-support unit of a bank. Affected: scam victims,
> our case handlers, and the fraud-investigation team. Constraints: cases
> involve sensitive personal and financial information, there are regulatory
> reporting obligations, and the customers are often in real distress, so tone
> and accuracy matter.

**Suggested Diagnose pain point:** the time a victim's case spends stalled while
being handed between teams.

---

## 6. AI Procurement Intelligence

**Challenge:**
> Our procurement team can't see what we're actually spending or where the
> savings and risks are, because the information is spread across disconnected
> systems. Decisions about suppliers and contracts get made on partial,
> out-of-date pictures, and obvious consolidation or risk signals get missed.
> We suspect we're overpaying and over-exposed but can't prove or act on it.

**Context:**
> We're the procurement function of a large enterprise. Affected: procurement
> managers, category buyers, and finance. Constraints: spend and supplier data
> live across several ERP and contract systems with inconsistent quality, and
> any analysis has to reconcile messy, mismatched records.

**Suggested Diagnose pain point:** the lack of a consolidated, current view of
spend and supplier risk across fragmented systems.

---

## 7. Post-Merger Customer Experience Still Feels Like Two Companies

**Challenge:**
> A year after our merger, customers still feel like they're dealing with two
> separate companies. They get duplicate communications, inconsistent answers,
> and have to repeat information that one side has but the other can't see.
> Frontline staff are stuck toggling between two systems that don't talk to
> each other, and the experience feels disjointed at every touchpoint.

**Context:**
> We're a company a year past a merger of two mid-sized firms. Affected:
> customers spanning both legacy bases, frontline service staff, and the
> integration team. Constraints: two legacy systems and data silos that haven't
> been unified, plus real change fatigue across the organization.

**Suggested Diagnose pain point:** frontline staff working across two
unintegrated systems that give customers inconsistent service.

---

## 8. Network Incidents Take Too Long to Detect, Diagnose and Resolve

**Challenge:**
> When something breaks in our network, it takes too long to figure out what's
> wrong and fix it. Alerts fire from many separate monitoring tools at once,
> engineers jump between dashboards trying to correlate them, and the same kind
> of incident often gets diagnosed from scratch each time. The result is long
> outages, frustrated customers, and on-call teams burning out on repetitive
> firefighting.

**Context:**
> We're a mid-sized telecom operator. Affected: the network operations centre
> (NOC) engineers who triage alerts 24/7, the on-call senior engineers
> escalated to at night, and the customers who lose service. Constraints:
> monitoring tools are from different vendors and don't share a common data
> model, incident history lives in a ticketing system nobody mines, and we must
> respect strict telecom data-handling rules.

**Suggested Diagnose pain point:** the time it takes to correlate alerts across
multiple monitoring tools during an incident.

---

## 9. Fraud and Scam Losses Outpace Control Updates

**Challenge:**
> Fraud patterns change faster than we can update our controls, so by the time
> we've responded to one scam, the next has already cost us. Our rules are
> updated on a slow cycle through manual review, while attackers adapt in days.
> Losses keep climbing, and tightening the rules too hard just blocks
> legitimate customers instead.

**Context:**
> We're the fraud-risk team at a payments/banking business. Affected: fraud
> analysts, risk managers, and customers caught by both fraud and
> false-positive blocks. Constraints: largely rule-based legacy controls, a
> slow and manual change-approval cycle, and high sensitivity to false
> positives that frustrate genuine customers.

**Suggested Diagnose pain point:** the lag between a new fraud pattern emerging
and our controls being updated to catch it.

---

## 10. Retail Demand and Waste Decisions Happen in Fragmented Loops

**Challenge:**
> Our ordering, demand forecasting, and waste decisions are made by different
> people in disconnected steps, so we end up overstocked on some things and
> sold out of others — and throwing away perishables we never should have
> ordered. Each store and category guesses somewhat independently, and the
> signals that should tie them together never connect. We're losing margin to
> both waste and missed sales at once.

**Context:**
> We're a grocery/retail chain with perishable inventory. Affected: store
> managers, category planners, and the supply-chain team. Constraints:
> short-shelf-life goods, demand that varies a lot by store and season, and
> forecasting/ordering/markdown decisions spread across fragmented systems.

**Suggested Diagnose pain point:** the disconnect between demand forecasts and
the ordering/markdown decisions that should follow from them.

---

## 11. Enterprise Sales Cycles Stall Translating Customer Pain into Solutions

**Challenge:**
> Our enterprise deals stall because reps struggle to turn what they hear from a
> customer into a concrete, tailored solution. A rep uncovers a real problem,
> but assembling the right mix of our products, proof points, and a credible
> proposal takes weeks of chasing internal experts. By the time we respond, the
> momentum from the discovery conversation is gone.

**Context:**
> We're an enterprise B2B sales organization with a broad, complex product
> catalog. Affected: account executives, the solution engineers they pull in,
> and prospective customers waiting on proposals. Constraints: product and
> reference knowledge is scattered across teams and documents, deals are
> high-value and long-cycle, and proposals must be accurate, not improvised.

**Suggested Diagnose pain point:** the time and effort to translate a
discovered customer need into a tailored solution proposal.

---

## 12. Workforce AI Training Is Happening but Cycle-Time Gains Are Unmeasured

**Challenge:**
> We've put thousands of employees through AI-tool training, but we genuinely
> can't tell whether it's making anyone faster. Leaders ask whether the
> investment is paying off and we have anecdotes, not evidence. Without a
> baseline or a way to attribute gains, we can't tell which teams improved,
> which training worked, or where to focus next.

**Context:**
> We're the learning-and-development / transformation function of a large
> enterprise rolling out AI tools. Affected: trained employees, the L&D team,
> and operations leaders asking for ROI. Constraints: no pre-training baseline
> was captured, productivity is hard to attribute cleanly, and any measurement
> has to respect employee-performance data sensitivities.

**Suggested Diagnose pain point:** the absence of a baseline and attribution
method to measure whether AI training improved cycle times.
