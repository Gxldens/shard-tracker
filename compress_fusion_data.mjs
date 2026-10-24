import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json'));

// In raw, shards and recipes are stored by code (C1, U12, L42, etc.)
// Let's see: if we keep it clean as raw JSON minified:
const minified = JSON.stringify(raw);
console.log('Minified JSON size in bytes:', minified.length, '(', (minified.length / 1024 / 1024).toFixed(2), 'MB )');

// Can we encode it even more efficiently?
// Shards array: [code, name, internal_id, rarity, fuse_amount, isReptile]
// Recipes: outCode: { 1: [[A, B], ...], 2: [[A, B], ...] }
// That's already very standard and easy to inspect.
