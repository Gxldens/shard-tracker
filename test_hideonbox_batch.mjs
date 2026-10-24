import fs from 'fs';

async function testHideonbox() {
  const data = JSON.parse(fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json'));
  const bzRes = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
  const bzData = await bzRes.json();

  const hbProd = bzData.products['SHARD_HIDEONBOX'];
  console.log("Hideonbox Buy Order Price:", hbProd.sell_summary[0]?.pricePerUnit);
  console.log("Hideonbox Sell Order Price:", hbProd.buy_summary[0]?.pricePerUnit);

  // Expected cost to fuse from DP: ~719,725
  // Net instant sell payout per shard:
  const netSellPrice = hbProd.sell_summary[0]?.pricePerUnit * (1 - 0.0125);
  console.log("Net instant sell payout per shard:", netSellPrice.toFixed(2));
  console.log("Expected profit per shard:", (netSellPrice - 719725.78).toFixed(2));

  // What happens at Batch Quantity = 10, 24, 40, etc.?
  // Let's test different batch sizes
}

testHideonbox().catch(console.error);
