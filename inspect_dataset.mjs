import fs from 'fs';

async function downloadAndInspect() {
  console.log("Downloading dist/fusion-data.json from SkyShards-Parser...");
  const res = await fetch("https://raw.githubusercontent.com/Campionnn/SkyShards-Parser/master/dist/fusion-data.json");
  const data = await res.json();
  
  console.log(`Shards count: ${Object.keys(data.shards).length}`);
  let totalRecipes = 0;
  for (const [outShard, yields] of Object.entries(data.recipes)) {
    for (const [yieldVal, pairs] of Object.entries(yields)) {
      totalRecipes += pairs.length;
    }
  }
  console.log(`Total recipe pairs: ${totalRecipes}`);

  console.log("Fetching Bazaar data from Hypixel...");
  const bzRes = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
  const bzData = await bzRes.json();
  const bzKeys = Object.keys(bzData.products).filter(k => k.startsWith("SHARD_"));
  console.log(`Hypixel Bazaar SHARD_ products: ${bzKeys.length}`);

  // Test mapping
  const bzKeySet = new Set(bzKeys);
  const unmappedShards = [];
  const mappedShards = [];

  for (const [code, info] of Object.entries(data.shards)) {
    const internalId = info.internal_id;
    if (bzKeySet.has(internalId)) {
      mappedShards.push({ code, name: info.name, internalId });
      bzKeySet.delete(internalId);
    } else {
      unmappedShards.push({ code, name: info.name, internalId });
    }
  }

  console.log(`Successfully mapped shards: ${mappedShards.length}`);
  console.log(`Unmapped SkyShards: ${unmappedShards.length}`);
  if (unmappedShards.length > 0) {
    console.log("Unmapped SkyShards details:", unmappedShards);
  }
  console.log(`Remaining Bazaar keys not in SkyShards: ${bzKeySet.size}`);
  if (bzKeySet.size > 0) {
    console.log("Remaining Bazaar keys:", Array.from(bzKeySet));
  }

  // Save the raw json locally
  fs.writeFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json', JSON.stringify(data));
  console.log("Saved raw_fusion_data.json successfully.");
}

downloadAndInspect().catch(console.error);
