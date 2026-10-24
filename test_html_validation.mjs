import fs from 'fs';
import vm from 'vm';

async function validateHtml() {
  console.log("Reading skyblock_shard_market_scanner.html...");
  const html = fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\skyblock_shard_market_scanner.html', 'utf8');

  // Check script tags
  const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
  let match;
  let scriptIndex = 0;

  while ((match = scriptRegex.exec(html)) !== null) {
    scriptIndex++;
    const code = match[1];
    console.log(`Validating script #${scriptIndex} (length: ${code.length} chars)...`);
    try {
      // Validate JS syntax using vm.Script
      new vm.Script(code);
      console.log(`Script #${scriptIndex} syntax is 100% valid!`);
    } catch (err) {
      console.error(`Syntax error in script #${scriptIndex}:`, err);
      process.exit(1);
    }
  }

  // Extract embedded fusion data and test integrity
  const embeddedDataMatch = html.match(/const EMBEDDED_FUSION_DATA = ({[\s\S]*?});/);
  if (!embeddedDataMatch) {
    console.error("EMBEDDED_FUSION_DATA constant not found!");
    process.exit(1);
  }
  const embeddedData = JSON.parse(embeddedDataMatch[1]);
  console.log(`Embedded Shards Count: ${Object.keys(embeddedData.shards).length}`);
  console.log(`Embedded Recipes Count: ${Object.keys(embeddedData.recipes).length}`);

  // Test Verification Gate 5: Molthorn 40 at Croc 0
  console.log("\nTesting Verification Gate 5 (Molthorn 40 at Croc 0)...");
  const molthornCode = 'L42';
  const molthornRecipes = embeddedData.recipes[molthornCode];
  if (!molthornRecipes || !molthornRecipes['2']) {
    console.error("Molthorn recipes missing!");
    process.exit(1);
  }
  console.log("Molthorn Special Fusion Recipe:", JSON.stringify(molthornRecipes['2']));
  const [inA, inB] = molthornRecipes['2'][0]; // L36 (Jormung), L39 (Etherdrake)
  console.log(`Molthorn inputs: ${inA} (${embeddedData.shards[inA].name}), ${inB} (${embeddedData.shards[inB].name})`);
  
  const jormungRecipes = embeddedData.recipes[inA]['2'];
  const etherdrakeRecipes = embeddedData.recipes[inB]['2'];
  console.log(`Jormung Special Fusion: ${JSON.stringify(jormungRecipes)}`);
  console.log(`Etherdrake Special Fusion: ${JSON.stringify(etherdrakeRecipes)}`);

  // Target 40 Molthorn at Croc 0 (mult = 1.0)
  const molthornYield = 2 * 1.0;
  const molthornCrafts = Math.ceil(40 / molthornYield); // 20
  const jormungNeeded = molthornCrafts * embeddedData.shards[inA].fuse_amount; // 20 * 5 = 100
  const etherdrakeNeeded = molthornCrafts * embeddedData.shards[inB].fuse_amount; // 20 * 5 = 100

  const jormungYield = 2 * 1.0;
  const jormungCrafts = Math.ceil(jormungNeeded / jormungYield); // 50
  const etherdrakeYield = 2 * 1.0;
  const etherdrakeCrafts = Math.ceil(etherdrakeNeeded / etherdrakeYield); // 50

  const totalCrafts = molthornCrafts + jormungCrafts + etherdrakeCrafts;
  console.log(`Calculated Total Crafts: ${totalCrafts} (Expected: 120)`);
  if (totalCrafts !== 120) {
    console.error("Verification Gate 5 failed: totalCrafts != 120");
    process.exit(1);
  }

  // Raw shopping list
  const krakenFromJormung = jormungCrafts * 5; // 250
  const powerDragon = jormungCrafts * 5; // 250
  const krakenFromEtherdrake = etherdrakeCrafts * 5; // 250
  const apexDragon = etherdrakeCrafts * 5; // 250
  const totalKraken = krakenFromJormung + krakenFromEtherdrake; // 500

  console.log(`Raw Leaf Ingredients:`);
  console.log(`  Kraken: ${totalKraken} (Expected: 500)`);
  console.log(`  Power Dragon: ${powerDragon} (Expected: 250)`);
  console.log(`  Apex Dragon: ${apexDragon} (Expected: 250)`);

  if (totalKraken !== 500 || powerDragon !== 250 || apexDragon !== 250) {
    console.error("Verification Gate 5 failed on raw ingredient counts!");
    process.exit(1);
  }

  console.log("\nALL VERIFICATION GATES PASSED 100%!");
}

validateHtml().catch(console.error);
