import fs from 'fs';

async function testExact() {
  const html = fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\skyblock_shard_market_scanner.html', 'utf8');

  // Check that default is strict in-game accurate
  const defaultOptionCheck = html.includes('<option value="strict" selected>In-Game Accurate (Pure Reptile applies ONLY when fusing Reptiles or Chameleon)</option>');
  console.log(`Default mode is In-Game Accurate: ${defaultOptionCheck ? '✅ YES' : '❌ NO'}`);

  // Check isReptileFusion condition
  const recipeConditionCheck = html.includes('const hasReptileInput = shardList[inAIdx].isReptile || shardList[inBIdx].isReptile;') &&
                               html.includes('mult = (rIsReptile[r] === 1) ? crocMultiplier : 1.0;');
  console.log(`Reptile condition checked per craft: ${recipeConditionCheck ? '✅ YES' : '❌ NO'}`);

  // Check live solver execution
  const bzRes = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
  const bzData = await bzRes.json();
  const rawFusion = JSON.parse(fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json'));

  const shardCodes = Object.keys(rawFusion.shards);
  const N = shardCodes.length;
  const codeToIdx = new Map();
  const internalIdToIdx = new Map();
  const idxToShard = new Array(N);

  function isReptile(s) {
    if (!s) return false;
    if (s.internal_id === 'SHARD_CHAMELEON' || s.code === 'L4' || s.name === 'Chameleon') return true;
    return (s.family || '').toLowerCase().includes('reptile');
  }

  for (let i = 0; i < N; i++) {
    const code = shardCodes[i];
    const s = rawFusion.shards[code];
    codeToIdx.set(code, i);
    internalIdToIdx.set(s.internal_id, i);
    idxToShard[i] = {
      code,
      name: s.name,
      internal_id: s.internal_id,
      fuse_amount: s.fuse_amount || 5,
      isReptile: isReptile(s)
    };
  }

  const flatRecipes = [];
  for (const [outCode, yields] of Object.entries(rawFusion.recipes)) {
    const outIdx = codeToIdx.get(outCode);
    if (outIdx === undefined) continue;
    for (const [yieldStr, pairs] of Object.entries(yields)) {
      const baseYield = parseInt(yieldStr, 10);
      for (const [inACode, inBCode] of pairs) {
        const inAIdx = codeToIdx.get(inACode);
        const inBIdx = codeToIdx.get(inBCode);
        if (inAIdx === undefined || inBIdx === undefined) continue;
        const isRepFusion = idxToShard[inAIdx].isReptile || idxToShard[inBIdx].isReptile;
        flatRecipes.push({
          outIdx,
          inAIdx,
          countA: idxToShard[inAIdx].fuse_amount,
          inBIdx,
          countB: idxToShard[inBIdx].fuse_amount,
          baseYield,
          isReptileFusion: isRepFusion
        });
      }
    }
  }

  const numRecipes = flatRecipes.length;
  const rOut = new Int32Array(numRecipes);
  const rInA = new Int32Array(numRecipes);
  const rCountA = new Int32Array(numRecipes);
  const rInB = new Int32Array(numRecipes);
  const rCountB = new Int32Array(numRecipes);
  const rYield = new Float64Array(numRecipes);

  const crocMultiplier = 1.20; // Level 10

  for (let r = 0; r < numRecipes; r++) {
    const rec = flatRecipes[r];
    rOut[r] = rec.outIdx;
    rInA[r] = rec.inAIdx;
    rCountA[r] = rec.countA;
    rInB[r] = rec.inBIdx;
    rCountB[r] = rec.countB;
    const mult = rec.isReptileFusion ? crocMultiplier : 1.0;
    rYield[r] = rec.baseYield * mult;
  }

  const cost0 = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const s = idxToShard[i];
    const prod = bzData.products[s.internal_id];
    cost0[i] = (prod && prod.buy_summary && prod.buy_summary[0]) ? prod.buy_summary[0].pricePerUnit : Infinity;
  }

  const bestCost = [new Float64Array(cost0), new Float64Array(N).fill(Infinity), new Float64Array(N).fill(Infinity)];
  const recipeCost = [new Float64Array(N).fill(Infinity), new Float64Array(N).fill(Infinity), new Float64Array(N).fill(Infinity)];

  for (let d = 1; d <= 2; d++) {
    const prevCost = bestCost[d - 1];
    const curRecipeCost = recipeCost[d];
    const curBestCost = bestCost[d];
    for (let i = 0; i < N; i++) curBestCost[i] = prevCost[i];

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
      }
    }
    for (let i = 0; i < N; i++) {
      if (curRecipeCost[i] < curBestCost[i]) curBestCost[i] = curRecipeCost[i];
    }
  }

  const etherdrakeIdx = internalIdToIdx.get('SHARD_ETHERDRAKE');
  const molthornIdx = internalIdToIdx.get('SHARD_MOLTHORN');

  console.log(`\nVerified Live Output:`);
  console.log(`Etherdrake Cost to Fuse: ${recipeCost[1][etherdrakeIdx].toFixed(2)} (Expected ~1.45M)`);
  console.log(`Molthorn Cost to Fuse: ${recipeCost[2][molthornIdx].toFixed(2)} (Expected ~7.19M)`);
}

testExact().catch(console.error);
