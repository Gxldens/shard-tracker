async function checkNEU() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/master/constants/attribute_shards.json");
    if (res.ok) {
      const data = await res.json();
      console.log("NEU attribute_shards keys:", Object.keys(data).length);
      console.log("Sample NEU shard:", JSON.stringify(data[Object.keys(data)[0]]));
    } else {
      console.log("NEU fetch failed:", res.status);
    }
  } catch (e) {
    console.error("NEU fetch error:", e.message);
  }

  // Also check Campionnn/SkyShards-Parser repo
  try {
    const res2 = await fetch("https://raw.githubusercontent.com/Campionnn/SkyShards-Parser/main/data/fusion-data.json");
    console.log("SkyShards-Parser data status:", res2.status);
  } catch(e) {}
}

checkNEU();
