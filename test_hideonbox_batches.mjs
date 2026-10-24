import fs from 'fs';

async function testBatches() {
  const data = JSON.parse(fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json'));
  const bzRes = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
  const bzData = await bzRes.json();

  // Let's write the exact batch simulation function from the HTML file
  const shardCodes = Object.keys(data.shards);
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
    const s = data.shards[code];
    codeToIdx.set(code, i);
    internalIdToIdx.set(s.internal_id, i);
    idxToShard[i] = {
      code,
      name: s.name,
      internal_id: s.internal_id,
      fuse_amount: s.fuse_amount || 5,
      isReptile: isReptile(s),
      synthesized: s.synthesized !== false,
      chameleon: s.chameleon !== false
    };
  }

  const flatRecipes = [];
  for (const [outCode, yields] of Object.entries(data.recipes)) {
    const outIdx = codeToIdx.get(outCode);
    if (outIdx === undefined) continue;
    const sOut = idxToShard[outIdx];
    for (const [yieldStr, pairs] of Object.entries(yields)) {
      const baseYield = parseInt(yieldStr, 10);
      for (const [inACode, inBCode] of pairs) {
        const inAIdx = codeToIdx.get(inACode);
        const inBIdx = codeToIdx.get(inBCode);
        if (inAIdx === undefined || inBIdx === undefined) continue;
        const isCham = (idxToShard[inAIdx].internal_id === 'SHARD_CHAMELEON' || idxToShard[inBIdx].internal_id === 'SHARD_CHAMELEON');
        if (baseYield === 1) {
          if (isCham && !sOut.chameleon) continue;
          if (!isCham && !sOut.synthesized) continue;
        }
        flatRecipes.push({
          outIdx, inAIdx, inBIdx,
          countA: idxToShard[inAIdx].fuse_amount,
          countB: idxToShard[inBIdx].fuse_amount,
          baseYield,
          isReptileFusion: idxToShard[inAIdx].isReptile || idxToShard[inBIdx].isReptile
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

  for (let r = 0; r < numRecipes; r++) {
    const rec = flatRecipes[r];
    rOut[r] = rec.outIdx;
    rInA[r] = rec.inAIdx;
    rCountA[r] = rec.countA;
    rInB[r] = rec.inBIdx;
    rCountB[r] = rec.countB;
    const mult = rec.isReptileFusion ? 1.20 : 1.0;
    rYield[r] = rec.baseYield * mult;
  }

  const cost0 = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const s = idxToShard[i];
    const prod = bzData.products[s.internal_id];
    cost0[i] = (prod && prod.buy_summary && prod.buy_summary[0]) ? prod.buy_summary[0].pricePerUnit : Infinity;
  }

  const bestCost = [new Float64Array(cost0), new Float64Array(N).fill(Infinity), new Float64Array(N).fill(Infinity), new Float64Array(N).fill(Infinity), new Float64Array(N).fill(Infinity)];
  const recipeCost = [new Float64Array(N).fill(Infinity), new Float64Array(N).fill(Infinity), new Float64Array(N).fill(Infinity), new Float64Array(N).fill(Infinity), new Float64Array(N).fill(Infinity)];
  const bestRecipe = [new Int32Array(N).fill(-1), new Int32Array(N).fill(-1), new Int32Array(N).fill(-1), new Int32Array(N).fill(-1), new Int32Array(N).fill(-1)];

  for (let d = 1; d <= 4; d++) {
    const prev = bestCost[d - 1];
    for (let i = 0; i < N; i++) bestCost[d][i] = prev[i];
    for (let r = 0; r < numRecipes; r++) {
      const out = rOut[r];
      const cA = prev[rInA[r]];
      const cB = prev[rInB[r]];
      if (cA === Infinity || cB === Infinity) continue;
      const c = (rCountA[r] * cA + rCountB[r] * cB + 1000) / rYield[r];
      if (c < recipeCost[d][out]) {
        recipeCost[d][out] = c;
        bestRecipe[d][out] = r;
      }
    }
    for (let i = 0; i < N; i++) {
      if (recipeCost[d][i] < bestCost[d][i]) bestCost[d][i] = recipeCost[d][i];
    }
  }

  const hbIdx = internalIdToIdx.get('SHARD_HIDEONBOX');

  function buildPlan(targetQty) {
    const rawLeaves = new Map();
    let totalCrafts = 0;

    function recurse(shardIdx, qtyNeeded, d) {
      if (d <= 0 || bestRecipe[d][shardIdx] === -1) {
        rawLeaves.set(shardIdx, (rawLeaves.get(shardIdx) || 0) + qtyNeeded);
        return;
      }
      const r = flatRecipes[bestRecipe[d][shardIdx]];
      const mult = r.isReptileFusion ? 1.20 : 1.0;
      const crafts = Math.ceil(qtyNeeded / (r.baseYield * mult));
      totalCrafts += crafts;
      recurse(r.inAIdx, crafts * r.countA, d - 1);
      recurse(r.inBIdx, crafts * r.countB, d - 1);
    }
    recurse(hbIdx, targetQty, 4);

    let matCost = 0;
    for (const [sIdx, needed] of rawLeaves.entries()) {
      const p = bzData.products[idxToShard[sIdx].internal_id];
      matCost += needed * (p?.buy_summary?.[0]?.pricePerUnit || 0);
    }
    const totalCost = matCost + totalCrafts * 1000;
    const netRevenue = targetQty * bzData.products['SHARD_HIDEONBOX'].sell_summary[0].pricePerUnit * (1 - 0.0125);
    const profit = netRevenue - totalCost;

    console.log(`Qty: ${targetQty} -> Crafts: ${totalCrafts}, Total Cost: ${(totalCost/1e6).toFixed(2)}M (Cost/shard: ${(totalCost/targetQty).toFixed(0)}), Net Rev: ${(netRevenue/1e6).toFixed(2)}M, Profit: ${(profit/1e6).toFixed(2)}M (${profit > 0 ? '+' : ''}${(profit/targetQty).toFixed(0)}/ea)`);
  }

  console.log("Testing Hideonbox batch sizes:");
  for (const q of [2, 4, 8, 12, 16, 24, 40, 60, 100]) {
    buildPlan(q);
  }
}

testBatches().catch(console.error);
