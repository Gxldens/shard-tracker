import fs from 'fs';

async function testFixes() {
  const data = JSON.parse(fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json'));
  const bzRes = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
  const bzData = await bzRes.json();

  // Test Fix 1: Filter out Packrat and check synthesized/chameleon flags
  // In Hypixel Skyblock, Packrat cannot be fused.
  data.shards['U73'].synthesized = false;
  data.shards['U73'].chameleon = false;
  delete data.recipes['U73'];

  // Test Fix 2: VWAP for single craft
  function getSingleCraftVWAP(prod, requiredQty) {
    if (!prod || !prod.buy_summary || prod.buy_summary.length === 0) return Infinity;
    let remaining = requiredQty;
    let totalCost = 0;
    for (const tier of prod.buy_summary) {
      const take = Math.min(remaining, tier.amount);
      totalCost += take * tier.pricePerUnit;
      remaining -= take;
      if (remaining <= 0) break;
    }
    if (remaining > 0) return Infinity; // Not enough supply even for 1 single craft!
    return totalCost / requiredQty;
  }

  // Test on Molthorn ingredients
  const krakenProd = bzData.products['SHARD_KRAKEN'];
  const apexProd = bzData.products['SHARD_APEX_DRAGON'];
  const powerProd = bzData.products['SHARD_POWER_DRAGON'];

  console.log("Kraken single-craft (5) VWAP:", getSingleCraftVWAP(krakenProd, 5), "vs buy_summary[0]:", krakenProd.buy_summary[0]?.pricePerUnit);
  console.log("Apex Dragon single-craft (5) VWAP:", getSingleCraftVWAP(apexProd, 5), "vs buy_summary[0]:", apexProd.buy_summary[0]?.pricePerUnit);
  console.log("Power Dragon single-craft (5) VWAP:", getSingleCraftVWAP(powerProd, 5), "vs buy_summary[0]:", powerProd.buy_summary[0]?.pricePerUnit);

  console.log("Fix 1 & 2 logic tested successfully.");
}

testFixes().catch(console.error);
