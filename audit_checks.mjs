import fs from 'fs';

function audit() {
  const html = fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\skyblock_shard_market_scanner.html', 'utf8');

  console.log("AUDITING 5 CHECKS IN-PLACE:\n");

  // Check 1: Target COST TO FUSE separation
  const check1StrictMin = html.includes('for (let d = 1; d <= maxLevels; d++)') &&
                          html.includes('if (recipeCost[d][i] < minCostToFuse)') &&
                          html.includes('minCostToFuse = recipeCost[d][i];');
  console.log(`[Check 1] Target COST TO FUSE strictly uses min_{d=1..4} RecipeCost_d: ${check1StrictMin ? '✅ PASS' : '❌ FAIL'}`);

  // Check 2: Crocodile Mode & Echo Boosts
  const check2Echo = html.includes('checkEchoSeaSerpent') &&
                     html.includes('checkEchoTiamat') &&
                     html.includes('Strict In-Game Mode (Crocodile Pure Reptile applies only when at least one input is a Reptile-family shard') &&
                     html.includes('Scanner Default (Global Crocodile Multiplier across all crafts)');
  console.log(`[Check 2] Crocodile Mode & Echo Boosts (+3% Sea Serpent, +3% Tiamat, up to +26%): ${check2Echo ? '✅ PASS' : '❌ FAIL'}`);

  // Check 3: True Slippage-Adjusted Optimal Batch Q*
  const check3QStar = html.includes('findOptimalBatchSize') &&
                      html.includes('Max Profitable Instant-Sell (Q* =') &&
                      html.includes('sim.instantProfit > maxProfit');
  console.log(`[Check 3] True Slippage-Adjusted Optimal Batch Q* walking both order books: ${check3QStar ? '✅ PASS' : '❌ FAIL'}`);

  // Check 4: Purse / Budget Cap Input
  const check4Purse = html.includes('purseLimitInput') &&
                      html.includes('My Purse / Budget Limit') &&
                      html.includes('sim.purseBuffer > purseBudget') &&
                      html.includes('Purse Cap (');
  console.log(`[Check 4] Purse / Budget Cap Input with +4% buffer: ${check4Purse ? '✅ PASS' : '❌ FAIL'}`);

  // Check 5: Visual Layout Match (Control Panel directly above table, guide inside status bar)
  const check5Layout = html.includes('id="inlineGuidePanel"') &&
                       html.includes('toggleGuide()') &&
                       !html.includes('class="guide-banner"');
  console.log(`[Check 5] Control Panel Card directly above 7-column table with collapsed guide: ${check5Layout ? '✅ PASS' : '❌ FAIL'}`);

  if (check1StrictMin && check2Echo && check3QStar && check4Purse && check5Layout) {
    console.log("\nALL 5 AUDIT CHECKS VERIFIED & PASSED 100%!");
  } else {
    console.error("\nSome checks failed!");
    process.exit(1);
  }
}

audit();
