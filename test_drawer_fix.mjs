import fs from 'fs';

async function testDrawer() {
  const data = JSON.parse(fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json'));
  const bzRes = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
  const bzData = await bzRes.json();

  // Molthorn
  const s = data.shards['L42'];
  const prod = bzData.products['SHARD_MOLTHORN'];
  console.log("Molthorn buy_summary (sell offers):", prod?.buy_summary?.slice(0, 3));
  console.log("Molthorn sell_summary (buy orders):", prod?.sell_summary?.slice(0, 3));

  // If you do 1 craft of Molthorn:
  // Requires: 5 Jormung + 5 Etherdrake
  // Jormung: yield = 2. Math.ceil(5 / 2) = 3 crafts -> produces 6 Jormung (uses 15 Kraken + 15 Power Dragon)
  // Etherdrake: yield = 2. Math.ceil(5 / 2) = 3 crafts -> produces 6 Etherdrake (uses 15 Kraken + 15 Apex Dragon)
  // Combined raw: 30 Kraken, 15 Power Dragon, 15 Apex Dragon.
  // Craft outputs: 2 Molthorn + 1 Jormung leftover + 1 Etherdrake leftover!
  
  // Cost:
  const krakenCost = 30 * bzData.products['SHARD_KRAKEN'].buy_summary[0].pricePerUnit;
  const powerCost = 15 * bzData.products['SHARD_POWER_DRAGON'].buy_summary[0].pricePerUnit;
  const apexCost = 15 * bzData.products['SHARD_APEX_DRAGON'].buy_summary[0].pricePerUnit;
  const totalCost = krakenCost + powerCost + apexCost + 7000;
  console.log("Total spent for 1 Molthorn craft (7 crafts):", totalCost.toFixed(2));

  // If you sell 2 Molthorn:
  const sellOrders = prod.sell_summary;
  let revenue2 = 0;
  let rem = 2;
  for (const t of sellOrders) {
    const take = Math.min(rem, t.amount);
    revenue2 += take * t.pricePerUnit;
    rem -= take;
    if (rem <= 0) break;
  }
  const netRevenue2 = revenue2 * (1 - 0.0125);
  console.log("Net Revenue from selling 2 Molthorn:", netRevenue2.toFixed(2));

  // Plus value of the 1 leftover Jormung and 1 leftover Etherdrake:
  const jormungSell = bzData.products['SHARD_JORMUNG'].sell_summary[0].pricePerUnit * (1 - 0.0125);
  const etherdrakeSell = bzData.products['SHARD_ETHERDRAKE'].sell_summary[0].pricePerUnit * (1 - 0.0125);
  console.log("Leftover 1 Jormung value:", jormungSell.toFixed(2));
  console.log("Leftover 1 Etherdrake value:", etherdrakeSell.toFixed(2));

  const totalValue = netRevenue2 + jormungSell + etherdrakeSell;
  console.log("Total value received (2 Molthorn + 1 Jormung + 1 Etherdrake):", totalValue.toFixed(2));
  console.log("True Net Profit from doing 1 Molthorn craft batch:", (totalValue - totalCost).toFixed(2));
}

testDrawer().catch(console.error);
