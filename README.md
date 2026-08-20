# INCREMANIAC™

*An incremental game about the denominator.*

You are an AI bro. You have a laptop, $2,500, and an unshakeable sense that you
are early. Your goal is that every other AI company fails and then invests in
you instead.

No build step, no dependencies, no framework.

```bash
node serve.js
```

Then open <http://localhost:8080>. (Or serve the folder with anything else —
it's static. ES modules need HTTP, so `file://` won't work.)

---

## The Grand Incremental Formula

```
                RAM × (MONEY − EGO) × ELECTRICITY
    AI POWER = ───────────────────────────────────
                    (WATER − CHARISMA)
```

The units are chosen so that both subtractions actually mean something:

| Term | Unit | What it is |
|---|---|---|
| **RAM** | GB | Installed memory, after grid throttling |
| **MONEY** | $/s | Gross revenue *rate* (your cash balance is separate) |
| **EGO** | $/s | Vanity burn — jets, yachts, a $900 grey t-shirt |
| **ELECTRICITY** | MW | Power actually drawn, not capacity announced |
| **WATER** | ML/day | Real cooling burden |
| **CHARISMA** | ML/day | Cooling burden you have *narratively* eliminated |

### The two subtractions are the game

Both can go negative. That isn't a bug to be clamped away — it's the endgame.

**`MONEY − EGO ≤ 0` → VANITY INSOLVENCY.** Your lifestyle costs more than your
company earns. AI Power drops to 5%. If you run out of cash while burning, the
market forcibly sells your assets until ego fits back inside income — the only
way ego has ever gone down.

**`WATER − CHARISMA ≤ 0` → THE BUBBLE POPS.** You have promised away more
physical reality than you consume. Charisma stops counting for anything *and*
you eat a 20× penalty. To escape: scale up genuinely, or buy the *Ornamental
Campus Water Feature* and become conspicuously, deliberately wasteful. Both
work. Only one is honest, and the honest one is slower.

Charisma can buy you at most a 20× divisor advantage — the denominator stops
shrinking at 5% of the real burden — so threading the needle is rewarding but
not game-ending.

### How the resources feed each other

RAM draws electricity. Electricity you actually draw becomes a cooling burden.
Cooling burden is the denominator. So **buying compute makes you stronger and
simultaneously builds the thing that divides you** — and it's the only reliable
way to stay ahead of your own hype.

Charisma multiplies investor income and erases cooling burden. Ego drains
income and inflates your valuation multiple. Early on charisma lands ~3× faster
than ego; around 220 Stonks that reverses permanently. That moment is called
*the turn*.

---

## Loop

Contracts arrive on the **Contract Board**. You have one pool of AI Power and
several people who want it. Assign a share to each. Assign more than 100% and
everything is diluted proportionally — the work doesn't go faster, it goes
thinner.

Delivering raises Charisma and Ego. Missing a deadline raises neither, loudly.

Contracts run from *Child Requests A Meme* and *Grandmother, Grocery List*
through self-driving fleets and protein folding, up to *Mission Architecture
For Mars* and *Declare The Singularity* (not achieve it — declare it; the
market cannot tell the difference).

Higher tiers unlock on **delivered reputation**, not on your dashboard number.
Nobody hands you a Mars contract because you have a big number.

## Screens

`HQ` · `Contracts` · `RAM` · `Electricity` · `Water` · `Money` · `Ego/Charisma`
· `Ops` · `Stonks`

Number keys `1`–`9` jump between them.

## Saving

Autosaves every 15 seconds to **localStorage**, mirrored to a **cookie** as a
fallback for when localStorage is blocked (private browsing, hardened
settings), with an in-memory last resort so a locked-down browser can still
play the session out. The Stonks screen reports which of those actually holds
your run.

The cookie limit is a hard 4KB, so the stored payload is compacted — transient
per-tick fields dropped, floats rounded to 8 significant figures, rival market
caps recomputed rather than stored. A realistic late-game save is ~1.5KB. If a
run ever does outgrow the cookie, it **refuses to write a truncated one** and
says so, because a cookie that cannot be restored is worse than no cookie: it
looks like progress.

**Download Save File** writes a readable, self-describing `.json` you control —
the only copy your browser cannot clear. **Load Save File** takes it back.
`Export Text` / `Import Text` do the same thing as a paste-able string.

## Winning

Score is **Stonks**. Nine rivals fold into your cap table at fixed Stonks
thresholds, ending with the shovel salesman at 100,000. Beat all nine and there
is nobody left to disrupt. You are, at last, hungry for nothing in particular.
This feeling lasts about four seconds.

---

## Layout

```
index.html            markup shell
styles/tycoon.css     1997 shareware chrome
serve.js              zero-dep static server
src/
  state.js            save shape + every tuning constant
  formula.js          the formula, recomputed from scratch each frame
  engine.js           simulation: purchases, contracts, rivals, failure states
  save.js             localStorage + export/import
  format.js           big-number formatting
  data/
    upgrades.js       ~45 purchases across six screens
    challenges.js     35 contracts + the tier pacing table
    rivals.js         nine parodies and their obituaries
  ui/
    router.js  hud.js  dom.js  shop.js  resourceScreen.js
    screens/*.js
```

### Tuning

Balance lives in exactly two places:

- `C` in [`src/state.js`](src/state.js) — physical coupling and economics.
- `TIER_TUNE` in [`src/data/challenges.js`](src/data/challenges.js) — per-tier
  work, gates, and reward scaling. Challenge entries are authored as *relative*
  values within their tier; this table sets how far apart the tiers actually
  sit.

AI Power grows as roughly `RAM × MONEY` — a product of two exponentials — so
tier gates have to be a long way apart or the game is over in four minutes.
This was measured, not guessed: `TIER_TUNE` exists because the first build was
winnable in 300 seconds.

The simulation runs on `setInterval` with a fixed-substep accumulator, *not*
`requestAnimationFrame` — rAF is suspended in a background tab, and an idle
game that stops idling when you look away is not an idle game. Rendering is on
rAF, separately.

`window.INCREMANIAC` exposes the live game object and `.render()` in the
console.

---

## Status

v0.1 — playable start to finish. All nine rivals are reachable, both failure
states are recoverable, and the whole thing has been simulated headlessly for
8 in-game hours to check the curve.

Every company here is a parody and none of them are real.

MIT.
