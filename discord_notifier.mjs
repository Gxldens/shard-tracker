import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// CONFIGURATION
// ==========================================
export const CONFIG = {
  // Discord Webhook URL
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1563852114629754960/rQgAQQdkLqzkUmu9-94RgrQ2UaDTfC0vgx4NFKeS0vhC_qc3mq1AT6dJJcx_zsNNSe87',
  
  // Alert Thresholds
  minInstantProfit: 200000,     // Minimum coins profit for instant-sell arbitrage (>= +200k/shard)
  onlyInstantSell: true,        // When true, only alert instant-sell opportunities
  minSellOfferProfit: 150000,   // Minimum coins profit for sell-offer listing (ignored when onlyInstantSell is true)
  minHourlyVelocity: 8,         // Minimum shards traded per hour (liquidity check)
  minRoiPct: 12,                // Minimum Return on Investment %
  minProfitableDepth: 1,        // Minimum buyer bids in order book
  
  // Game Mechanics
  crocLevel: 10,                // Crocodile Pet Level (0 - 10)
  taxRate: 0.0125,              // Bazaar tax (1.25% standard)
  maxDepth: 4,                  // Max recursion depth for fusion
  
  // Cooldown & Rate Limiting
  cooldownMinutes: 30,          // Minutes before pinging the same shard again
  maxAlertsPerRun: 3,           // Max deals to alert in a single check to prevent spam
  
  // Optional Discord User ID to ping (e.g. '123456789012345678')
  // If provided, the notification will ping your phone directly!
  pingUserId: process.env.DISCORD_USER_ID || ''
};

const COOLDOWN_FILE = path.join(__dirname, '.alert_cooldowns.json');

// Rarity embed colors (Discord hex)
const RARITY_COLORS = {
  common: 0x94a3b8,
  uncommon: 0x22c55e,
  rare: 0x3b82f6,
  epic: 0xa855f7,
  legendary: 0xf59e0b,
  mythic: 0xec4899
};

function loadCooldowns() {
  try {
    if (fs.existsSync(COOLDOWN_FILE)) {
      return JSON.parse(fs.readFileSync(COOLDOWN_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function saveCooldowns(cooldowns) {
  try {
    fs.writeFileSync(COOLDOWN_FILE, JSON.stringify(cooldowns, null, 2), 'utf8');
  } catch (e) {}
}

function formatCoins(val) {
  if (val === Infinity || val === -Infinity || isNaN(val)) return '—';
  const abs = Math.abs(val);
  if (abs >= 1_000_000) return (val / 1_000_000).toFixed(2) + 'M';
  if (abs >= 1_000) return (val / 1_000).toFixed(1) + 'k';
  return Math.round(val).toLocaleString();
}

// Single-craft ingredient VWAP calculation with supply check
function getSingleCraftVWAP(prod, requiredQty) {
  if (!prod || !prod.buy_summary || prod.buy_summary.length === 0) return Infinity;
  let remaining = requiredQty;
  let totalCost = 0;
  for (let i = 0; i < prod.buy_summary.length; i++) {
    const tier = prod.buy_summary[i];
    const take = Math.min(remaining, tier.amount);
    totalCost += take * tier.pricePerUnit;
    remaining -= take;
    if (remaining <= 0) break;
  }
  if (remaining > 0) return Infinity;
  return totalCost / requiredQty;
}

// Reptile detection
function isReptileShard(shard) {
  if (!shard) return false;
  if (shard.internal_id === 'SHARD_CHAMELEON') return true;
  const fam = (shard.family || '').toLowerCase();
  return fam.includes('reptile') || fam.includes('snake') || fam.includes('turtle') || fam.includes('crocodile') || fam.includes('alligator');
}

export async function scanAndAlert(options = {}) {
  const config = { ...CONFIG, ...options };
  console.log(`[${new Date().toLocaleTimeString()}] Fetching Hypixel Bazaar data...`);

  // Load fusion dataset
  const fusionPath = path.join(__dirname, 'raw_fusion_data.json');
  if (!fs.existsSync(fusionPath)) {
    throw new Error('raw_fusion_data.json not found in ' + __dirname);
  }
  const fusionData = JSON.parse(fs.readFileSync(fusionPath, 'utf8'));

  // Fetch Bazaar
  const bzRes = await fetch('https://api.hypixel.net/v2/skyblock/bazaar');
  if (!bzRes.ok) throw new Error('Hypixel API returned status ' + bzRes.status);
  const bzJson = await bzRes.json();
  const bazaarData = bzJson.products;

  // 1. Index Shards
  const shardCodes = Object.keys(fusionData.shards);
  const numShards = shardCodes.length;
  const shardList = new Array(numShards);
  const codeToIdx = new Map();

  for (let i = 0; i < numShards; i++) {
    const code = shardCodes[i];
    const s = fusionData.shards[code];
    const internalId = s.internal_id || ('SHARD_' + s.name.toUpperCase().replace(/\s+/g, '_'));

    const isPackrat = (internalId === 'SHARD_PACKRAT_SKULL' || s.name === 'Packrat');
    const synthesized = isPackrat ? false : (s.synthesized !== false);
    const chameleon = isPackrat ? false : (s.chameleon !== false);

    shardList[i] = {
      idx: i,
      code,
      name: s.name,
      internal_id: internalId,
      rarity: (s.rarity || 'common').toLowerCase(),
      family: s.family || '',
      fuse_amount: s.fuse_amount || 5,
      isReptile: isReptileShard(s),
      synthesized,
      chameleon
    };
    codeToIdx.set(code, i);
  }

  // 2. Precompile Flat Recipes
  const flatRecipes = [];
  for (const [outCode, yields] of Object.entries(fusionData.recipes)) {
    const outIdx = codeToIdx.get(outCode);
    if (outIdx === undefined) continue;
    const sOut = shardList[outIdx];

    for (const [yieldStr, pairs] of Object.entries(yields)) {
      const baseYield = parseInt(yieldStr, 10);
      for (const [inACode, inBCode] of pairs) {
        const inAIdx = codeToIdx.get(inACode);
        const inBIdx = codeToIdx.get(inBCode);
        if (inAIdx === undefined || inBIdx === undefined) continue;

        const isChameleonFusion = (shardList[inAIdx].internal_id === 'SHARD_CHAMELEON' || shardList[inBIdx].internal_id === 'SHARD_CHAMELEON');

        if (!sOut.synthesized && !isChameleonFusion) continue;
        if (isChameleonFusion && !sOut.chameleon) continue;

        const isReptileFusion = (shardList[inAIdx].isReptile || shardList[inBIdx].isReptile || isChameleonFusion);

        flatRecipes.push({
          outIdx,
          inAIdx,
          inBIdx,
          countA: shardList[inAIdx].fuse_amount,
          countB: shardList[inBIdx].fuse_amount,
          baseYield,
          isReptileFusion
        });
      }
    }
  }

  // 3. Extract Market Prices
  const cost0 = new Float64Array(numShards);
  const sellOrderPrices = new Float64Array(numShards);
  const buyOrderPrices = new Float64Array(numShards);
  const buyMovingWeek = new Float64Array(numShards);
  const buyOrdersCount = new Int32Array(numShards);

  for (let i = 0; i < numShards; i++) {
    const s = shardList[i];
    const prod = bazaarData[s.internal_id];

    if (prod && prod.quick_status) {
      const qs = prod.quick_status;
      sellOrderPrices[i] = (prod.buy_summary && prod.buy_summary[0]) ? prod.buy_summary[0].pricePerUnit : (qs.sellPrice || Infinity);
      buyOrderPrices[i] = (prod.sell_summary && prod.sell_summary[0]) ? prod.sell_summary[0].pricePerUnit : (qs.buyPrice || 0);
      buyOrdersCount[i] = qs.buyOrders || 0;
      buyMovingWeek[i] = qs.buyMovingWeek || 0;

      const singleCraftVWAP = getSingleCraftVWAP(prod, s.fuse_amount);
      cost0[i] = singleCraftVWAP;
    } else {
      sellOrderPrices[i] = Infinity;
      buyOrderPrices[i] = 0;
      cost0[i] = Infinity;
      buyOrdersCount[i] = 0;
      buyMovingWeek[i] = 0;
    }
  }

  // 4. Run DP Solver (Crocodile strict proc)
  const crocMultiplier = 1.0 + (config.crocLevel * 0.02);
  const numRecipes = flatRecipes.length;
  const maxLevels = config.maxDepth;

  const rOut = new Int32Array(numRecipes);
  const rInA = new Int32Array(numRecipes);
  const rInB = new Int32Array(numRecipes);
  const rCountA = new Int32Array(numRecipes);
  const rCountB = new Int32Array(numRecipes);
  const rYield = new Float64Array(numRecipes);

  for (let r = 0; r < numRecipes; r++) {
    const rec = flatRecipes[r];
    rOut[r] = rec.outIdx;
    rInA[r] = rec.inAIdx;
    rInB[r] = rec.inBIdx;
    rCountA[r] = rec.countA;
    rCountB[r] = rec.countB;
    rYield[r] = rec.baseYield * (rec.isReptileFusion ? crocMultiplier : 1.0);
  }

  const bestCost = new Array(maxLevels + 1);
  const recipeCost = new Array(maxLevels + 1);
  const bestRecipe = new Array(maxLevels + 1);

  bestCost[0] = new Float64Array(cost0);
  for (let d = 1; d <= maxLevels; d++) {
    bestCost[d] = new Float64Array(numShards).fill(Infinity);
    recipeCost[d] = new Float64Array(numShards).fill(Infinity);
    bestRecipe[d] = new Int32Array(numShards).fill(-1);
  }

  for (let d = 1; d <= maxLevels; d++) {
    const prevCost = bestCost[d - 1];
    const curRecipeCost = recipeCost[d];
    const curBestRecipe = bestRecipe[d];
    const curBestCost = bestCost[d];

    for (let i = 0; i < numShards; i++) {
      curBestCost[i] = prevCost[i];
    }

    for (let r = 0; r < numRecipes; r++) {
      const out = rOut[r];
      const inA = rInA[r];
      const inB = rInB[r];
      const costA = prevCost[inA];
      const costB = prevCost[inB];

      if (costA === Infinity || costB === Infinity) continue;

      const craftCost = (rCountA[r] * costA + rCountB[r] * costB + 1000) / rYield[r];
      if (craftCost < curRecipeCost[out]) {
        curRecipeCost[out] = craftCost;
        curBestRecipe[out] = r;
      }
    }

    for (let i = 0; i < numShards; i++) {
      if (curRecipeCost[i] < curBestCost[i]) {
        curBestCost[i] = curRecipeCost[i];
      }
    }
  }

  // 5. Evaluate Opportunities
  const opportunities = [];
  for (let i = 0; i < numShards; i++) {
    let minCostToFuse = Infinity;
    let bestLevel = -1;

    for (let d = 1; d <= maxLevels; d++) {
      if (recipeCost[d][i] < minCostToFuse) {
        minCostToFuse = recipeCost[d][i];
        bestLevel = d;
      }
    }

    if (minCostToFuse === Infinity) continue;

    const sellOffer = sellOrderPrices[i];
    const buyBid = buyOrderPrices[i];

    const fusionProfit = (sellOffer !== Infinity) ? (sellOffer * (1 - config.taxRate) - minCostToFuse) : -Infinity;
    const instantProfit = (buyBid > 0) ? (buyBid * (1 - config.taxRate) - minCostToFuse) : -Infinity;
    const hourlyVelocity = Math.round(buyMovingWeek[i] / 168);
    const roi = (minCostToFuse > 0) ? ((fusionProfit / minCostToFuse) * 100) : 0;

    // Depth in profitable buy orders
    let profitableBuyDepth = 0;
    const prod = bazaarData[shardList[i].internal_id];
    if (prod && prod.sell_summary) {
      for (const tier of prod.sell_summary) {
        if (tier.pricePerUnit * (1 - config.taxRate) >= minCostToFuse + 15000) {
          profitableBuyDepth += tier.amount;
        }
      }
    }

    const isInstantDeal = (instantProfit >= config.minInstantProfit && profitableBuyDepth >= (config.minProfitableDepth || 1));
    const isSellOfferDeal = (!config.onlyInstantSell && fusionProfit >= config.minSellOfferProfit && roi >= config.minRoiPct && hourlyVelocity >= config.minHourlyVelocity);

    if (isInstantDeal || isSellOfferDeal) {
      // Find winning recipe ingredients
      const rIdx = bestRecipe[bestLevel][i];
      const rec = (rIdx !== -1) ? flatRecipes[rIdx] : null;
      let routeStr = 'Direct Fusion';
      if (rec) {
        const inA = shardList[rec.inAIdx].name;
        const inB = shardList[rec.inBIdx].name;
        routeStr = `${rec.countA}x ${inA} + ${rec.countB}x ${inB} → ${rec.baseYield}x ${shardList[i].name}`;
        if (rec.isReptileFusion) routeStr += ' 🐊';
      }

      opportunities.push({
        shard: shardList[i],
        costToFuse: minCostToFuse,
        sellOfferPrice: sellOffer,
        buyOrderPrice: buyBid,
        fusionProfit,
        instantProfit,
        roi,
        hourlyVelocity,
        profitableBuyDepth,
        routeStr,
        isInstantDeal,
        priorityScore: isInstantDeal ? instantProfit : fusionProfit
      });
    }
  }

  // Sort by highest priority
  opportunities.sort((a, b) => b.priorityScore - a.priorityScore);

  console.log(`Found ${opportunities.length} profitable opportunities meeting criteria.`);

  // 6. Check Cooldowns and Send Discord Alerts
  const cooldowns = loadCooldowns();
  const now = Date.now();
  const cooldownMs = config.cooldownMinutes * 60 * 1000;
  let alertsSent = 0;

  for (const opp of opportunities) {
    if (alertsSent >= config.maxAlertsPerRun) break;

    const shardId = opp.shard.internal_id;
    const lastAlert = cooldowns[shardId] || 0;

    // Check if on cooldown
    if (now - lastAlert < cooldownMs) {
      continue;
    }

    // Send Discord Embed
    console.log(`Sending alert for ${opp.shard.name}: Instant Profit: ${opp.instantProfit > 0 ? '+' : ''}${formatCoins(opp.instantProfit)}, Sell Offer: ${opp.fusionProfit > 0 ? '+' : ''}${formatCoins(opp.fusionProfit)}`);
    
    const embedColor = opp.isInstantDeal ? 0x22c55e : (RARITY_COLORS[opp.shard.rarity] || 0x38bdf8);
    const dealBadge = opp.isInstantDeal ? '⚡ INSTANT-SELL FLIP (>200k/shard)' : '💎 HIGH MARGIN CRAFT';

    const fields = [
      {
        name: '💰 Cost to Fuse',
        value: `**${formatCoins(opp.costToFuse)}** coins`,
        inline: true
      },
      {
        name: '🔥 Instant-Sell Profit',
        value: `**+${formatCoins(opp.instantProfit)}** coins / shard`,
        inline: true
      },
      {
        name: '📊 Market Volume & Depth',
        value: `~**${opp.hourlyVelocity}**/hr · **${opp.profitableBuyDepth}** instant bids`,
        inline: true
      },
      {
        name: '🧪 Optimal Recipe Route',
        value: `\`${opp.routeStr}\``,
        inline: false
      }
    ];

    if (opp.profitableBuyDepth > 1) {
      const batchPotential = opp.profitableBuyDepth * opp.instantProfit;
      fields.push({
        name: '💎 Total Batch Potential',
        value: `**+${formatCoins(batchPotential)}** coins across all ${opp.profitableBuyDepth} bids`,
        inline: true
      });
    }

    const payload = {
      content: config.pingUserId ? `<@${config.pingUserId}> ${dealBadge} found!` : undefined,
      embeds: [{
        title: `${dealBadge}: ${opp.shard.name}`,
        url: `https://gxldens.github.io/shard-tracker/`,
        description: `Profitable fusion deal detected on the Hypixel SkyBlock Bazaar.`,
        color: embedColor,
        fields,
        footer: {
          text: `SkyBlock Shard Tracker • Croc Lvl ${config.crocLevel} • Tax ${(config.taxRate * 100).toFixed(2)}%`
        },
        timestamp: new Date().toISOString()
      }]
    };

    try {
      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok || res.status === 204) {
        cooldowns[shardId] = now;
        alertsSent++;
      } else {
        console.error('Discord Webhook returned status', res.status);
      }
    } catch (err) {
      console.error('Failed to post to Discord:', err.message);
    }
  }

  saveCooldowns(cooldowns);
  console.log(`Alert cycle complete. Sent ${alertsSent} notification(s).`);
  return { opportunitiesFound: opportunities.length, alertsSent };
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const isDaemon = process.argv.includes('--daemon');
  if (isDaemon) {
    console.log('Starting Discord Alert Daemon (scanning every 60 seconds)...');
    scanAndAlert().catch(console.error);
    setInterval(() => {
      scanAndAlert().catch(console.error);
    }, 60 * 1000);
  } else {
    scanAndAlert().catch(console.error);
  }
}
