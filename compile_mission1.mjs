import fs from 'fs';

async function run() {
  console.log("Fetching Bazaar data...");
  const bzRes = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
  const bzJson = await bzRes.json();
  const bzShardKeys = Object.keys(bzJson.products).filter(k => k.startsWith("SHARD_"));
  console.log(`Found ${bzShardKeys.length} Bazaar products starting with SHARD_`);

  console.log("Fetching SkyShards fusion-data.json...");
  const fusionRes = await fetch("https://campionnn.github.io/SkyShards/fusion-data.json");
  const fusionJson = await fusionRes.json();

  console.log(`SkyShards shards count: ${Object.keys(fusionJson.shards).length}`);
  
  // Inspect shard mappings
  const mapped = [];
  const unmappedBz = new Set(bzShardKeys);
  const unmappedSky = [];

  for (const [code, info] of Object.entries(fusionJson.shards)) {
    const internalId = info.internal_id;
    if (bzShardKeys.includes(internalId)) {
      mapped.push({ code, name: info.name, internalId });
      unmappedBz.delete(internalId);
    } else {
      unmappedSky.push({ code, name: info.name, internalId });
    }
  }

  console.log(`Directly matched by internal_id: ${mapped.length}`);
  console.log(`Unmatched SkyShards shards: ${unmappedSky.length}`);
  console.log(`Bazaar shards not in SkyShards: ${unmappedBz.size}`);
  
  if (unmappedSky.length > 0) {
    console.log("Sample unmatched SkyShards:", unmappedSky.slice(0, 10));
  }
  if (unmappedBz.size > 0) {
    console.log("Sample Bazaar shards not in SkyShards:", Array.from(unmappedBz).slice(0, 20));
  }
}

run().catch(console.error);
