import fs from 'fs';

function audit5() {
  const html = fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\skyblock_shard_market_scanner.html', 'utf8');

  console.log("AUDITING 5 LIVE TARGETED FIXES:\n");

  // Fix 1
  const fix1 = !html.includes('data.recipes[\'U73\']') &&
               html.includes('if (isChameleonFusion && !sOut.chameleon) continue;') &&
               html.includes('if (!isChameleonFusion && !sOut.synthesized) continue;');
  console.log(`[Fix 1] Strict Recipe Authenticity & Non-Fusable Guard: ${fix1 ? '✅ PASS' : '❌ FAIL'}`);

  // Fix 2
  const fix2 = html.includes('function getSingleCraftVWAP(prod, requiredQty)') &&
               html.includes('if (remaining > 0) return Infinity;');
  console.log(`[Fix 2] Single-Craft Ingredient VWAP & 1-Shard Bait Order Protection: ${fix2 ? '✅ PASS' : '❌ FAIL'}`);

  // Fix 3
  const fix3 = html.includes('id="taxTogglePill"') &&
               html.includes('toggleTaxRatePill()') &&
               html.includes('const netPayout = tier.pricePerUnit * (1 - taxRate);');
  console.log(`[Fix 3] Profitable Buy Depth & 1-Click Tax Toggle Pill: ${fix3 ? '✅ PASS' : '❌ FAIL'}`);

  // Fix 4
  const fix4 = html.includes('buyMovingWeek · per hour') &&
               !html.includes('buymovingweek') &&
               html.includes('white-space: nowrap;');
  console.log(`[Fix 4] Table Header CamelCase & No-Wrap CSS: ${fix4 ? '✅ PASS' : '❌ FAIL'}`);

  // Fix 5
  const fix5 = html.includes('checkRouteHasLowSupply') &&
               html.includes('hasIngredientBelow20') &&
               html.includes('resItem.costToFuse.toLocaleString(');
  console.log(`[Fix 5] Drawer Cost Identity & Low-Supply (<20) Badging: ${fix5 ? '✅ PASS' : '❌ FAIL'}`);

  if (fix1 && fix2 && fix3 && fix4 && fix5) {
    console.log("\nALL 5 LIVE TARGETED FIXES VERIFIED & PASSED 100%!");
  } else {
    console.error("Some fixes failed verification!");
    process.exit(1);
  }
}

audit5();
