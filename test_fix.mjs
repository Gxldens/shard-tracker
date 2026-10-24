import fs from 'fs';

async function testFix() {
  const data = JSON.parse(fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json'));
  const bzRes = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
  const bzData = await bzRes.json();

  const shardCodes = Object.keys(data.shards);
  const N = shardCodes.length;
  const codeToIdx = new Map();
  const internalIdToIdx = new Map();
  const idxToShard = new Array(N);

  function isReptileShard(s) {
    if (!s) return false;
    if (s.internal_id === 'SHARD_CHAMELEON' || s.code === 'L4' || s.name === 'Chameleon') return true;
    return (s.family || '').toLowerCase().includes('reptile');
  }

  for (let i = 0; i < N; i++) {
    const code = shardCodes[i];
    const s = data.shards[code];
    codeToIdx.set(code, i);
    internalIdToIdx.set(s.internal_id, i);
    idxToShard[i] = {
      index: i,
      code,
      name: s.name,
      internal_id: s.internal_id,
      rarity: s.rarity,
      family: s.family,
      fuse_amount: s.fuse_amount || 5,
      isReptile: isReptileShard(s)
    };
  }

  // Precompile flat recipes
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

        // Is at least one input a Reptile or Chameleon?
        const isReptileFusion = idxToShard[inAIdx].isReptile || idxToShard[inBIdx].isReptile;

        flatRecipes.push({
          outIdx,
          inAIdx,
          countA: idxToShard[inAIdx].fuse_amount,
          inBIdx,
          countB: idxToShard[inBIdx].fuse_amount,
          baseYield,
          isReptileFusion
        });
      }
    }
  }

  const fusionCostPerCraft = 1000;
  const crocLevel = 10;
  const crocBonus = 0.02 * crocLevel; // +20%
  const crocMultiplier = 1.0 + crocBonus; // 1.20x

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
      cost0[i] = bestSellOffer;
    } else {
      sellOrderPrices[i] = Infinity;
      buyOrderPrices[i] = 0;
      cost0[i] = Infinity;
    }
  }

  const maxLevels = 4;
  const bestCost = [
    new Float64Array(cost0),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity)
  ];
  const recipeCost = [
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity),
    new Float64Array(N).fill(Infinity)
  ];
  const bestRecipe = [
    new Int32Array(N).fill(-1),
    new Int32Array(N).fill(-1),
    new Int32Array(N).fill(-1),
    new Int32Array(N).fill(-1),
    new Int32Array(N).fill(-1)
  ];

  // Typed arrays
  const numRecipes = flatRecipes.length;
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
    // CRITICAL: ONLY apply Crocodile multiplier if isReptileFusion is true!
    const mult = rec.isReptileFusion ? crocMultiplier : 1.0;
    rYield[r] = rec.baseYield * mult;
  }

  for (let d = 1; d <= maxLevels; d++) {
    const prevCost = bestCost[d - 1];
    const curRecipeCost = recipeCost[d];
    const curBestRecipe = bestRecipe[d];
    const curBestCost = bestCost[d];

    for (let i = 0; i < N; i++) curBestCost[i] = prevCost[i];

    for (let r = 0; r < numRecipes; r++) {
      const out = rOut[r];
      const inA = rInA[r];
      const inB = rInB[r];
      const costA = prevCost[inA];
      const costB = prevCost[inB];
      if (costA === Infinity || costB === Infinity) continue;

      const craftCost = (rCountA[r] * costA + rCountB[r] * costB + fusionCostPerCraft) / rYield[r];
      if (craftCost < curRecipeCost[out]) {
        curRecipeCost[out] = craftCost;
        curBestRecipe[out] = r;
      }
    }

    for (let i = 0; i < N; i++) {
      if (curRecipeCost[i] < curBestCost[i]) {
        curBestCost[i] = curRecipeCost[i];
      }
    }
  }

  const etherdrakeIdx = internalIdToIdx.get('SHARD_ETHERDRAKE');
  const jormungIdx = internalIdToIdx.get('SHARD_JORMUNG');
  const molthornIdx = internalIdToIdx.get('SHARD_MOLTHORN');

  console.log(`\n--- ETHERDRAKE (L39) ---`);
  console.log(`Sell order: ${sellOrderPrices[etherdrakeIdx]}`);
  console.log(`Cost to fuse (Level 1): ${recipeCost[1][etherdrakeIdx].toFixed(2)}`);
  const ethRec = flatRecipes[bestRecipe[1][etherdrakeIdx]];
  console.log(`Etherdrake recipe yield used: ${rYield[bestRecipe[1][etherdrakeIdx]]} (base ${ethRec.baseYield}, isReptile: ${ethRec.isReptileFusion})`);

  console.log(`\n--- JORMUNG (L36) ---`);
  console.log(`Sell order: ${sellOrderPrices[jormungIdx]}`);
  console.log(`Cost to fuse (Level 1): ${recipeCost[1][jormungIdx].toFixed(2)}`);
  const jorRec = flatRecipes[bestRecipe[1][jormungIdx]];
  console.log(`Jormung recipe yield used: ${rYield[bestRecipe[1][jormungIdx]]} (base ${jorRec.baseYield}, isReptile: ${jorRec.isReptileFusion})`);

  console.log(`\n--- MOLTHORN (L42) ---`);
  console.log(`Sell order: ${sellOrderPrices[molthornIdx]}`);
  console.log(`Cost to fuse (Level 2): ${recipeCost[2][molthornIdx].toFixed(2)}`);
  const molRec = flatRecipes[bestRecipe[2][molthornIdx]];
  console.log(`Molthorn recipe yield used: ${rYield[bestRecipe[2][molthornIdx]]} (base ${molRec.baseYield}, isReptile: ${molRec.isReptileFusion})`);
}

testFix().catch(console.error);
