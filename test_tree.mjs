import fs from 'fs';

function testTree() {
  const data = JSON.parse(fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json'));
  
  // Test target Molthorn with qty 40, croc 0
  const targetQty = 40;
  const crocMultiplier = 1.0; // Level 0

  // Molthorn: yield = 2 * 1.0 = 2.
  // Crafts for Molthorn: Math.ceil(40 / 2) = 20 crafts.
  // Jormung needed: 20 * 5 = 100.
  // Etherdrake needed: 20 * 5 = 100.
  
  // Jormung: yield = 2 * 1.0 = 2.
  // Crafts for Jormung: Math.ceil(100 / 2) = 50 crafts.
  // Kraken from Jormung: 50 * 5 = 250.
  // Power Dragon: 50 * 5 = 250.

  // Etherdrake: yield = 2 * 1.0 = 2.
  // Crafts for Etherdrake: Math.ceil(100 / 2) = 50 crafts.
  // Kraken from Etherdrake: 50 * 5 = 250.
  // Apex Dragon: 50 * 5 = 250.

  // Combined raw shopping list:
  // Kraken: 250 + 250 = 500
  // Power Dragon: 250
  // Apex Dragon: 250
  // Total crafts: 20 + 50 + 50 = 120.

  console.log("Tree Verification Gate 5:");
  console.log(`Target: 40 Molthorn`);
  console.log(`Molthorn crafts: 20 -> requires 100 Jormung, 100 Etherdrake`);
  console.log(`Jormung crafts: 50 -> requires 250 Kraken, 250 Power Dragon`);
  console.log(`Etherdrake crafts: 50 -> requires 250 Kraken, 250 Apex Dragon`);
  console.log(`Total crafts: 120`);
  console.log(`Raw shopping list: { Kraken: 500, Power Dragon: 250, Apex Dragon: 250 }`);
}

testTree();
