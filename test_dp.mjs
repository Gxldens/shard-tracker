import fs from 'fs';

async function testDP() {
  const data = JSON.parse(fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json'));
  const bzRes = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
  const bzData = await bzRes.json();

  // 1. Index shards 0 .. N-1
  const shardCodes = Object.keys(data.shards);
  const N = shardCodes.length;
  const codeToIdx = new Map();
  const internalIdToIdx = new Map();
  const nameToIdx = new Map();
  const idxToShard = new Array(N);

  for (let i = 0; i < N; i++) {
    const code = shardCodes[i];
    const s = data.shards[code];
    codeToIdx.set(code, i);
    internalIdToIdx.set(s.internal_id, i);
    nameToIdx.set(s.name.toLowerCase(), i);
    idxToShard[i] = {
      index: i,
      code,
      name: s.name,
      internal_id: s.internal_id,
      rarity: s.rarity,
      family: s.family,
      fuse_amount: s.fuse_amount || 5,
      isReptile: (s.family || '').toLowerCase().includes('reptile')
    };
  }

  // 2. Precompile recipes into flat structure
  // Each recipe: outputIdx, inAIdx, countA, inBIdx, countB, baseYield, isReptile
  let recipeCount = 0;
  const flatRecipes = [];

  for (const [outCode, yields] of Object.entries(data.recipes)) {
    const outIdx = codeToIdx.get(outCode);
    if (outIdx === undefined) continue;

    for (const [yieldStr, pairs] of Object.entries(yields)) {
      const baseYield = parseInt(yieldStr, 10);
      for (const [inACode, inBCode] of pairs) {
        const inAIdx = codeToIdx.get(inACode);
        const inBIdx = codeToIdx.get(inBCode);
        if (inAIdx === undefined || inBIdx === undefined) continue;

        const countA = idxToShard[inAIdx].fuse_amount;
        const countB = idxToShard[inBIdx].fuse_amount;
        const isReptile = idxToShard[inAIdx].isReptile || idxToShard[inBIdx].isReptile || idxToShard[outIdx].isReptile;

        flatRecipes.push({
          outIdx,
          inAIdx,
          countA,
          inBIdx,
          countB,
          baseYield,
          isReptile
        });
        recipeCount++;
      }
    }
  }

  console.log(`Indexed ${N} shards, precompiled ${recipeCount} flat recipes.`);

  // 3. Setup DP arrays
  // Level 0: Direct acquisition cost
  const chamIdx = internalIdToIdx.get('SHARD_CHAMELEON');
  const fusionCostPerCraft = 1000;
  const crocLevel = 10;
  const crocMultiplier = 1.0 + 0.02 * crocLevel; // 1.20
  const useBuyOrderForChameleon = false;

  const cost0 = new Float64Array(N);
  const sellOrderPrices = new Float64Array(N);
  const buyOrderPrices = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    const s = idxToShard[i];
    const prod = bzData.products[s.internal_id];
    if (prod) {
      const bestSellOffer = (prod.buy_summary && prod.buy_summary[0]) ? prod.buy_summary[0].pricePerUnit : Infinity;
      const bestBuyOrder = (prod.sell_summary && prod.sell_summary[0]) ? prod.sell_summary[0].pricePerUnit : 0;
      sellOrderPrices[i] = bestSellOffer;
      buyOrderPrices[i] = bestBuyOrder;

      if (i === chamIdx && useBuyOrderForChameleon) {
        cost0[i] = bestBuyOrder > 0 ? bestBuyOrder : bestSellOffer;
      } else {
        cost0[i] = bestSellOffer;
      }
    } else {
      sellOrderPrices[i] = Infinity;
      buyOrderPrices[i] = 0;
      cost0[i] = Infinity;
    }
  }

  // Measure DP solve time
  const t0 = performance.now();

  const maxLevels = 4;
  // bestCost[level][i]
  const bestCost = [
    new Float64Array(cost0),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity)
  ];
  // recipeCost[level][i] (strictly from crafts at this level)
  const recipeCost = [
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity)
  ];
  // bestRecipe[level][i] stores the recipe index that produced recipeCost
  const bestRecipe = [
    new Int32Array(N).fill(-1),
    new Int32Array(N).fill(-1),
    new Int32Array(N).fill(-1),
    new Int32Array(N).fill(-1),
    new Int32Array(N).fill(-1)
  ];

  const numRecipes = flatRecipes.length;
  // To avoid object property lookups in inner loops, use typed arrays for recipes
  const rOut = new Int32Array(numRecipes);
  const rInA = new Int32Array(numRecipes);
  const rCountA = new Int32Array(numRecipes);
  const rInB = new Int32Array(numRecipes);
  const rCountB = new Int32Array(numRecipes);
  const rYield = new Float64Array(numRecipes);

  for (let r = 0; r < numRecipes; r++) {
    const rec = flatRecipes[r];
    rOut[r] = rec.outIdx;
    rInA[r] = rec.inAIdx;
    rCountA[r] = rec.countA;
    rInB[r] = rec.inBIdx;
    rCountB[r] = rec.countB;
    rYield[r] = rec.baseYield * crocMultiplier;
  }

  // 4 DP passes
  for (let d = 1; d <= maxLevels; d++) {
    const prevCost = bestCost[d - 1];
    const curRecipeCost = recipeCost[d];
    const curBestRecipe = bestRecipe[d];
    const curBestCost = bestCost[d];

    // Initialize curBestCost with prevCost
    for (let i = 0; i < N; i++) {
      curBestCost[i] = prevCost[i];
    }

    for (let r = 0; r < numRecipes; r++) {
      const out = rOut[r];
      const inA = rInA[r];
      const inB = rInB[r];
      const costA = prevCost[inA];
      const costB = prevCost[inB];

      if (costA === Infinity || costB === Infinity) continue;

      const totalCraftCost = (rCountA[r] * costA + rCountB[r] * costB + fusionCostPerCraft) / rYield[r];
      if (totalCraftCost < curRecipeCost[out]) {
        curRecipeCost[out] = totalCraftCost;
        curBestRecipe[out] = r;
      }
    }

    for (let i = 0; i < N; i++) {
      if (curRecipeCost[i] < curBestCost[i]) {
        curBestCost[i] = curRecipeCost[i];
      }
    }
  }

  const t1 = performance.now();
  console.log(`DP execution completed in ${(t1 - t0).toFixed(2)} ms!`);

  // Check Molthorn
  const molthornIdx = internalIdToIdx.get('SHARD_MOLTHORN');
  console.log('\n--- MOLTHORN RESULTS ---');
  console.log(`Sell order price: ${sellOrderPrices[molthornIdx]}`);
  console.log(`Buy order price: ${buyOrderPrices[molthornIdx]}`);
  for (let d = 1; d <= maxLevels; d++) {
    const recIdx = bestRecipe[d][molthornIdx];
    console.log(`Level ${d}: RecipeCost = ${recipeCost[d][molthornIdx].toFixed(2)}, BestCost = ${bestCost[d][molthornIdx].toFixed(2)}`);
    if (recIdx !== -1) {
      const rec = flatRecipes[recIdx];
      console.log(`   Craft: ${idxToShard[rec.inAIdx].name} (${rec.countA}) + ${idxToShard[rec.inBIdx].name} (${rec.countB}) -> ${idxToShard[rec.outIdx].name} (yield ${rec.baseYield})`);
    }
  }

  // Minimum cost across d in 1..4 (cost to fuse)
  let minCostToFuse = Infinity;
  let minLevel = -1;
  for (let d = 1; d <= maxLevels; d++) {
    if (recipeCost[d][molthornIdx] < minCostToFuse) {
      minCostToFuse = recipeCost[d][molthornIdx];
      minLevel = d;
    }
  }
  console.log(`\nOptimal Cost to Fuse: ${minCostToFuse.toFixed(2)} at Level ${minLevel}`);
  const fusionProfit = sellOrderPrices[molthornIdx] - minCostToFuse;
  const instantProfit = buyOrderPrices[molthornIdx] - minCostToFuse;
  console.log(`Fusion profit (Offer - Cost): ${fusionProfit.toFixed(2)}`);
  console.log(`Instant-sell profit (Buy - Cost): ${instantProfit.toFixed(2)}`);
}

testDP().catch(console.error);
