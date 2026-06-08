# Test Challenge — Telecom NOC Incident Resolution

A reusable fixture for manually verifying the AI Immersion chatbot flow end to
end. This is **test data only** — a made-up challenge for exercising the six
steps (Frame → Widen → Diagnose → Ideate → Brief → Build), not a real client
challenge and not part of the product. Use it to check streaming, the
compounding thread, markdown rendering, and the guardrail's allow path.

---

## Step 1 — Frame

Insert the **Frame** template in the app, then fill its two blanks with the text
below.

**Challenge** — paste into *"describe your challenge in 2–4 sentences"*:

> When something breaks in our network, it takes too long to figure out what's
> wrong and fix it. Alerts fire from many separate monitoring tools at once,
> engineers jump between dashboards trying to correlate them, and the same kind
> of incident often gets diagnosed from scratch each time. The result is long
> outages, frustrated customers, and on-call teams burning out on repetitive
> firefighting.

**Context** — paste into *"organization, the people affected, constraints,
anything relevant"*:

> We're a mid-sized telecom operator. The people affected are the network
> operations centre (NOC) engineers who triage alerts 24/7, the on-call senior
> engineers escalated to at night, and ultimately the customers who lose
> service. Constraints: the monitoring tools are from different vendors and
> don't share a common data model, incident history lives in a ticketing system
> that nobody mines, and anything we build has to respect strict telecom
> data-handling rules.

---

## Steps 2–6

Then advance through the remaining steps using each step's own template,
filling the genuine-input blanks as they come up:

- **Widen** — no input; should map personas, pains, workarounds, metrics, then
  return 5 insights and 3 risks, all specific to the telecom challenge above.
- **Diagnose** — fill the `[pain point]` blank, e.g. *"the time it takes to
  correlate alerts across multiple monitoring tools"*.
- **Ideate** — no input.
- **Brief** — no input.
- **Build** — fill the `[platform]` blank with whatever build tool you'd
  prototype in.

---

## What to verify with this fixture

- **Thread compounds:** Widen (and every later step) should reference *this*
  challenge specifically — NOC engineers, multi-vendor alerts, the unused
  ticket history — not generic content. That confirms the full thread is being
  re-sent, not just the last turn.
- **Frame discipline:** the Frame response should restate the challenge and
  propose **no solutions** yet, then hand the next step back to you.
- **Markdown rendering:** Widen's headings/lists are the best stress test for
  the markdown styling, in both light and dark themes.
- **Guardrail allow path:** this is a genuine in-process challenge, so it must
  sail through the guardrail (never get redirected).
- **Build export:** the final Build output should show the copy / export-.md
  controls; earlier steps should not.
