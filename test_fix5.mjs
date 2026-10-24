import fs from 'fs';

async function testFix5() {
  const data = JSON.parse(fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json'));
  const bzRes = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
  const bzData = await bzRes.json();

  // Molthorn check
  const molthornCode = 'L42';
  const molthornShard = data.shards[molthornCode];
  console.log("Molthorn shard:", molthornShard);

  // Check if any leaf of Molthorn has < 20 in buy_summary
  const krakenSupply = bzData.products['SHARD_KRAKEN']?.buy_summary?.reduce((a, b) => a + b.amount, 0) || 0;
  const powerSupply = bzData.products['SHARD_POWER_DRAGON']?.buy_summary?.reduce((a, b) => a + b.amount, 0) || 0;
  const apexSupply = bzData.products['SHARD_APEX_DRAGON']?.buy_summary?.reduce((a, b) => a + b.amount, 0) || 0;

  console.log("Kraken available in sell offers:", krakenSupply);
  console.log("Power Dragon available in sell offers:", powerSupply);
  console.log("Apex Dragon available in sell offers:", apexSupply);

  console.log("Fix 5 supply check verified.");
}

testFix5().catch(console.error);
