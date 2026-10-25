# ⚡ Hypixel SkyBlock Attribute Shard Market Scanner & Discord Notifier

A real-time, zero-backend market scanner and automated arbitrage bot for Hypixel SkyBlock Attribute Shards and Fusion mechanics.

🌐 **Live Web App:** [https://gxldens.github.io/shard-tracker/](https://gxldens.github.io/shard-tracker/)

---

## 🚀 Key Features

* **Sub-40ms 4-Level Dynamic Programming Solver:** Computes the globally optimal fusion crafting routes across 325 canonical attribute shards and 131,312 recipe combinations.
* **Authentic Fusion Mechanics:**
  * Strict Crocodile Pet (`Pure Reptile`) proc logic: only applies multiplier when at least one input belongs to the Reptile family or Chameleon shard.
  * Direct Bazaar purchase at depth $0$ vs. recursive fusion crafting.
  * Single-craft ingredient VWAP calculation with order book depth validation to prevent 1-shard bait traps.
  * Precise 1.25% Bazaar tax deductions.
* **Order Book Slippage & Optimal Batch ($Q^*$):** Walks `buy_summary` and `sell_summary` depth curves simultaneously to compute the exact break-even batch size before slippage erodes profits.
* **Automated Discord Alerts:**
  * Instant-sell flips (guaranteed instant profit).
  * High-margin fusion crafts with liquidity and volume filters.
  * 24/7 automated cloud scanning via GitHub Actions.

---

## 🤖 Automated Discord Notifier

The repository includes [`discord_notifier.mjs`](discord_notifier.mjs) which polls the Bazaar and delivers rich embed alerts to your Discord channel.

### Running 24/7 in the Cloud (GitHub Actions)
The included workflow at [`.github/workflows/shard-alerts.yml`](.github/workflows/shard-alerts.yml) automatically runs every 10 minutes in the GitHub cloud for free.

### Running Locally
To scan continuously on your local computer:
```bash
node discord_notifier.mjs --daemon
```

### Configuration Options
Edit the `CONFIG` object in `discord_notifier.mjs` to adjust thresholds:
* `minInstantProfit`: Minimum coins profit for instant-sell arbitrage.
* `minSellOfferProfit`: Minimum coins profit for sell-offer listings.
* `minHourlyVelocity`: Minimum 7-day hourly velocity to guarantee liquidity.
* `minRoiPct`: Minimum Return on Investment %.
* `cooldownMinutes`: Minutes before re-alerting the same shard.
* `pingUserId`: Optional Discord user ID to mention/ping your phone directly.
