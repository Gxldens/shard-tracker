import fs from 'fs';
import path from 'path';

const rawDataPath = 'C:\\Users\\avima\\bazaar-shard-price-tracker\\raw_fusion_data.json';
const outputPath = 'C:\\Users\\avima\\bazaar-shard-price-tracker\\skyblock_shard_market_scanner.html';

console.log("Loading fusion data...");
const fusionData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

console.log(`Shards: ${Object.keys(fusionData.shards).length}, Recipes: ${Object.keys(fusionData.recipes).length}`);

// Minify fusion data for embedding
const minifiedFusionJson = JSON.stringify(fusionData);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hypixel SkyBlock · Bazaar Shard Market Scanner & Recursive Fusion Profit Optimizer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-canvas: #070b14;
      --bg-card: #0f172a;
      --bg-card-sub: #131c2e;
      --bg-input: #090d16;
      --border-main: #1e293b;
      --border-accent: #283750;
      
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      
      --accent-cyan: #38bdf8;
      --accent-blue: #60a5fa;
      --accent-purple: #a78bfa;
      --accent-emerald: #34d399;
      --accent-emerald-soft: #6ee7b7;
      --accent-amber: #fbbf24;
      --accent-orange: #f97316;
      --accent-red: #f87171;

      /* Column vertical tints */
      --col1-tint: rgba(15, 23, 42, 0.75);
      --col2-tint: rgba(30, 58, 138, 0.10);
      --col3-tint: rgba(88, 28, 135, 0.16);
      --col4-tint: rgba(14, 116, 144, 0.10);
      --col5-tint: rgba(6, 78, 59, 0.22);
      --col6-tint: rgba(15, 23, 42, 0.85);
      --col7-tint: rgba(15, 23, 42, 0.75);

      /* Rarity colors */
      --rarity-common: #cbd5e1;
      --rarity-uncommon: #22c55e;
      --rarity-rare: #3b82f6;
      --rarity-epic: #a855f7;
      --rarity-legendary: #f59e0b;
      --rarity-mythic: #ec4899;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background: radial-gradient(circle at 50% 0%, #111a2e 0%, #070b14 70%);
      background-attachment: fixed;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: var(--text-main);
      min-height: 100vh;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1160px;
      margin: 0 auto;
      padding: 32px 24px 64px;
    }

    /* Top Header */
    .header-block {
      margin-bottom: 20px;
    }

    .eyebrow {
      font-size: 11px;
      letter-spacing: 0.14em;
      font-weight: 700;
      color: var(--accent-cyan);
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .eyebrow .pulse-dot {
      width: 7px;
      height: 7px;
      background-color: var(--accent-cyan);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--accent-cyan);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .page-title {
      font-size: 28px;
      font-weight: 800;
      color: #f8fafc;
      margin: 4px 0 6px;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      max-width: 860px;
      line-height: 1.55;
    }

    /* Control Panel Card */
    .control-card {
      background: var(--bg-card);
      border: 1px solid var(--border-main);
      border-radius: 14px;
      padding: 18px 20px;
      margin-bottom: 20px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    .action-row {
      display: grid;
      grid-template-columns: auto 1fr 1fr auto;
      gap: 12px;
      align-items: end;
    }

    @media (max-width: 820px) {
      .action-row {
        grid-template-columns: 1fr 1fr;
      }
    }

    .field-group {
      display: flex;
      flex-direction: column;
    }

    .field-label {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 5px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .text-input, .select-input {
      background: var(--bg-input);
      border: 1px solid var(--border-main);
      border-radius: 8px;
      padding: 9px 12px;
      color: var(--text-main);
      font-size: 13px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .text-input:focus, .select-input:focus {
      border-color: var(--accent-cyan);
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.18);
    }

    .btn-primary {
      background: var(--accent-emerald);
      color: #042f2e;
      font-weight: 700;
      font-size: 13px;
      padding: 10px 18px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s, transform 0.05s;
      white-space: nowrap;
      height: 38px;
    }

    .btn-primary:hover {
      background: #10b981;
    }

    .btn-primary:active {
      transform: scale(0.98);
    }

    .btn-secondary {
      background: #162032;
      border: 1px solid var(--border-accent);
      color: #e2e8f0;
      font-weight: 600;
      font-size: 13px;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s, border-color 0.15s;
      white-space: nowrap;
      height: 38px;
    }

    .btn-secondary:hover {
      background: #1f2c44;
      border-color: #3b4d6e;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(4, 47, 46, 0.25);
      border-top-color: #042f2e;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: none;
    }

    .btn-primary.loading .spinner {
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* 3-Column Toggle Grid */
    .toggle-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 14px;
    }

    @media (max-width: 820px) {
      .toggle-grid {
        grid-template-columns: 1fr;
      }
    }

    .toggle-card {
      background: var(--bg-card-sub);
      border: 1px solid var(--border-main);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .toggle-header {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    .toggle-header input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #3b82f6;
      cursor: pointer;
    }

    .toggle-title {
      font-size: 12.5px;
      font-weight: 600;
      color: #f1f5f9;
    }

    .toggle-helper {
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.45;
      margin-top: 6px;
    }

    .fee-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .fee-input-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .fee-input {
      width: 80px;
      background: var(--bg-input);
      border: 1px solid var(--border-accent);
      border-radius: 6px;
      padding: 6px 8px;
      color: var(--text-main);
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      font-weight: 600;
      outline: none;
    }

    .fee-unit {
      font-size: 11.5px;
      color: var(--text-dim);
    }

    /* Bottom Status & Options Bar */
    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      flex-wrap: wrap;
      gap: 10px;
    }

    .status-summary {
      font-size: 12px;
      color: var(--text-muted);
    }

    .status-highlight {
      color: var(--accent-emerald-soft);
      font-weight: 600;
    }

    .status-pills {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pill-badge {
      background: var(--bg-input);
      border: 1px solid var(--border-main);
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 11px;
      color: #cbd5e1;
      font-family: 'JetBrains Mono', monospace;
    }

    .btn-more-options {
      background: var(--bg-card-sub);
      border: 1px solid var(--border-accent);
      border-radius: 6px;
      padding: 5px 12px;
      font-size: 11px;
      font-weight: 600;
      color: var(--accent-cyan);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: background 0.15s;
    }

    .btn-more-options:hover {
      background: #1c2942;
    }

    /* Collapsible More Options Panel */
    .more-options-panel {
      display: none;
      margin-top: 14px;
      padding: 16px;
      background: #090e1a;
      border: 1px solid var(--border-accent);
      border-radius: 10px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
      animation: fadeIn 0.2s ease-in;
    }

    .more-options-panel.open {
      display: grid;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .panel-option {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .panel-option-title {
      font-size: 11.5px;
      font-weight: 600;
      color: #cbd5e1;
    }

    .slider-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .slider-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--accent-cyan);
      font-weight: 700;
      min-width: 44px;
    }

    /* Beginner Guide Banner */
    .guide-banner {
      background: #091222;
      border: 1px solid #1e3a5f;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }

    .guide-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }

    .guide-toggle-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .guide-badge {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: var(--accent-cyan);
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .guide-title {
      font-size: 13px;
      font-weight: 700;
      color: #f1f5f9;
    }

    .guide-content {
      display: none;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid rgba(56, 189, 248, 0.12);
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    @media (max-width: 900px) {
      .guide-content {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 550px) {
      .guide-content {
        grid-template-columns: 1fr;
      }
    }

    .guide-step {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(56, 189, 248, 0.15);
      border-radius: 8px;
      padding: 12px;
    }

    .guide-step-num {
      font-size: 11px;
      font-weight: 800;
      color: var(--accent-cyan);
      margin-bottom: 4px;
    }

    .guide-step-head {
      font-size: 12.5px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 4px;
    }

    .guide-step-text {
      font-size: 11.5px;
      color: var(--text-muted);
      line-height: 1.45;
    }

    .guide-step-text code {
      background: #090e1a;
      color: var(--accent-emerald-soft);
      padding: 1px 4px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
    }

    /* Main Data Table */
    .table-container {
      background: #0c1322;
      border: 1px solid var(--border-main);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    }

    .scanner-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .scanner-table th {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-main);
      font-weight: 700;
      vertical-align: bottom;
      user-select: none;
    }

    .th-line1 {
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-weight: 700;
    }

    .th-line2 {
      font-size: 10px;
      font-weight: 400;
      color: var(--text-dim);
      margin-top: 2px;
      text-transform: lowercase;
    }

    /* Headers specific colors */
    .th-col1 .th-line1 { color: #94a3b8; }
    .th-col2 .th-line1 { color: var(--accent-blue); text-align: right; }
    .th-col3 .th-line1 { color: var(--accent-purple); text-align: right; }
    .th-col4 .th-line1 { color: var(--accent-cyan); text-align: right; }
    .th-col5 .th-line1 { color: var(--accent-emerald); text-align: right; }
    .th-col6 .th-line1 { color: #cbd5e1; text-align: center; }
    .th-col7 .th-line1 { color: #cbd5e1; text-align: right; }

    .th-col2 .th-line2, .th-col3 .th-line2, .th-col4 .th-line2, .th-col5 .th-line2, .th-col7 .th-line2 {
      text-align: right;
    }
    .th-col6 .th-line2 {
      text-align: center;
    }

    .scanner-table td {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(30, 41, 59, 0.6);
      font-size: 13px;
      vertical-align: middle;
    }

    .scanner-table tr.data-row:hover td {
      filter: brightness(1.15);
    }

    /* Distinct vertical column background tints */
    .col-tint-1 { background: var(--col1-tint); }
    .col-tint-2 { background: var(--col2-tint); text-align: right; }
    .col-tint-3 { background: var(--col3-tint); text-align: right; }
    .col-tint-4 { background: var(--col4-tint); text-align: right; }
    .col-tint-5 { background: var(--col5-tint); text-align: right; }
    .col-tint-6 { background: var(--col6-tint); text-align: center; }
    .col-tint-7 { background: var(--col7-tint); text-align: right; }

    /* Col 1: Shard name & ID */
    .shard-name-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .shard-title-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      color: #ffffff;
      font-size: 13.5px;
    }

    .shard-link {
      color: var(--accent-cyan);
      text-decoration: none;
      font-size: 12px;
      transition: opacity 0.15s;
    }

    .shard-link:hover {
      opacity: 0.8;
      text-decoration: underline;
    }

    .shard-id-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      color: var(--text-dim);
    }

    .pill-instant-profit {
      display: inline-block;
      width: fit-content;
      background: rgba(245, 158, 11, 0.16);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #fbbf24;
      font-size: 9.5px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.05em;
      margin-top: 3px;
    }

    /* Col 2 & 3: Market Prices */
    .market-price {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13.5px;
      color: #e2e8f0;
      font-weight: 500;
    }

    /* Col 4: Cost to Fuse */
    .fuse-cost-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: #38bdf8;
    }

    .cell-sublabel {
      font-size: 10.5px;
      color: var(--text-dim);
      margin-top: 1px;
    }

    .btn-toggle-route {
      background: none;
      border: none;
      color: var(--accent-cyan);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 4px;
      display: inline-block;
      transition: color 0.15s;
      padding: 0;
    }

    .btn-toggle-route:hover {
      color: #7dd3fc;
      text-decoration: underline;
    }

    /* Col 5: Fusion Profit */
    .profit-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: var(--accent-emerald);
    }

    .profit-val.negative {
      color: var(--accent-red);
    }

    .instant-profit-sub {
      font-size: 11px;
      font-weight: 600;
      color: #fde68a;
      margin-top: 2px;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Col 6: Outgoing Sell Offers & Instant Depth */
    .split-metric-wrap {
      display: flex;
      justify-content: center;
      gap: 18px;
    }

    .metric-side {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .metric-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13.5px;
      font-weight: 700;
      color: #f8fafc;
    }

    .metric-val.amber {
      color: var(--accent-amber);
    }

    .metric-sub {
      font-size: 10px;
      color: var(--text-dim);
    }

    .metric-sub.amber {
      color: #d97706;
    }

    /* Col 7: Volume */
    .vol-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13.5px;
      font-weight: 700;
      color: #f8fafc;
    }

    /* Inline SkyShards Drawer */
    .drawer-row {
      display: none;
    }

    .drawer-row.open {
      display: table-row;
    }

    .drawer-cell {
      padding: 0 !important;
      background: #090e1a !important;
      border-bottom: 2px solid var(--accent-cyan) !important;
    }

    .drawer-content {
      padding: 20px 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Drawer Top Controls & Stats */
    .drawer-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      background: #0f172a;
      border: 1px solid var(--border-accent);
      border-radius: 10px;
      padding: 12px 16px;
    }

    .batch-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .batch-label {
      font-size: 12px;
      font-weight: 700;
      color: #cbd5e1;
    }

    .batch-input {
      width: 70px;
      background: var(--bg-input);
      border: 1px solid var(--border-accent);
      border-radius: 6px;
      padding: 6px 8px;
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      text-align: right;
    }

    .preset-btn {
      background: #162032;
      border: 1px solid var(--border-accent);
      color: #94a3b8;
      border-radius: 6px;
      padding: 5px 9px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .preset-btn:hover {
      background: #22324e;
      color: #fff;
    }

    .preset-btn.highlight {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.4);
      color: #fbbf24;
    }

    /* 5 Summary Stat Cards */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
    }

    @media (max-width: 950px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .stat-card {
      background: #0f172a;
      border: 1px solid var(--border-main);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-card-title {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-dim);
    }

    .stat-card-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      font-weight: 800;
      color: #f8fafc;
    }

    .stat-card-sub {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Materials Needed Section */
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-badge {
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: var(--accent-cyan);
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 5px;
      font-weight: 600;
    }

    .materials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }

    .material-card {
      background: #111a2e;
      border: 1px solid var(--border-main);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .material-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .rarity-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .rarity-common { background-color: var(--rarity-common); }
    .rarity-uncommon { background-color: var(--rarity-uncommon); }
    .rarity-rare { background-color: var(--rarity-rare); }
    .rarity-epic { background-color: var(--rarity-epic); }
    .rarity-legendary { background-color: var(--rarity-legendary); }

    .material-name {
      font-weight: 700;
      font-size: 13px;
      color: #f8fafc;
    }

    .material-amount {
      color: var(--accent-cyan);
      font-family: 'JetBrains Mono', monospace;
    }

    .material-details {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      color: var(--text-muted);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 6px;
      margin-top: 2px;
    }

    .supply-badge {
      font-size: 10.5px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      width: fit-content;
      margin-top: 4px;
    }

    .supply-badge.ok {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .supply-badge.warn {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    /* Fusion Tree */
    .fusion-tree-card {
      background: #0f172a;
      border: 1px solid var(--border-main);
      border-radius: 10px;
      padding: 16px;
    }

    .tree-header-actions {
      display: flex;
      gap: 8px;
    }

    .tree-node {
      margin-left: 20px;
      position: relative;
      padding-left: 14px;
      border-left: 2px solid #1e293b;
      margin-top: 8px;
    }

    .tree-node:before {
      content: "";
      position: absolute;
      top: 12px;
      left: 0;
      width: 10px;
      height: 2px;
      background: #1e293b;
    }

    .tree-item-box {
      background: #131c2e;
      border: 1px solid var(--border-accent);
      border-radius: 8px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tree-item-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tree-craft-count {
      background: #1e293b;
      color: #94a3b8;
      font-size: 10.5px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .tree-cost-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      color: var(--accent-cyan);
    }

    /* Empty state & error */
    .empty-state {
      text-align: center;
      padding: 48px 20px;
      color: var(--text-muted);
    }

    .empty-title {
      font-size: 16px;
      font-weight: 700;
      color: #cbd5e1;
      margin-bottom: 6px;
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      border: 1px solid var(--accent-cyan);
      color: #fff;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: none;
      animation: fadeIn 0.2s;
    }
  </style>
</head>
<body>

  <div class="container">
    
    <!-- Top Header Block -->
    <header class="header-block">
      <div class="eyebrow">
        <span class="pulse-dot"></span>
        HYPIXEL SKYBLOCK · BAZAAR
      </div>
      <h1 class="page-title">Shard Market Scanner</h1>
      <p class="page-subtitle">
        Compare live Bazaar prices, four-level fusion costs, and instant-sell opportunities. Uses Crocodile level 10 and a configurable fusion fee (default 1,000 coins per craft). Prices refresh automatically every five minutes.
      </p>
    </header>

    <!-- Top Control Panel Card -->
    <section class="control-card">
      
      <!-- Top Action & Filter Bar -->
      <div class="action-row">
        <button id="btnFetch" class="btn-primary" onclick="fetchLiveBazaarData()">
          <span class="spinner"></span>
          <span>Fetch live Bazaar data</span>
        </button>

        <div class="field-group">
          <label class="field-label" for="filterInput">Filter shard name / ID</label>
          <input type="text" id="filterInput" class="text-input" placeholder="e.g. Molthorn, SHARD_..." oninput="onFilterChange()">
        </div>

        <div class="field-group">
          <label class="field-label" for="rankSelect">Rank by</label>
          <select id="rankSelect" class="select-input" onchange="onRankChange()">
            <option value="fusionProfit">Highest fusion profit (most → least)</option>
            <option value="instantProfit">Highest instant-sell profit (most → least)</option>
            <option value="costToFuse">Lowest cost to fuse (least → most)</option>
            <option value="roi">Highest ROI % (profit / cost)</option>
            <option value="vol7d">Highest 7d bought volume (most → least)</option>
            <option value="velocity">Highest velocity profit / hour</option>
          </select>
        </div>

        <button id="btnExport" class="btn-secondary" onclick="exportCSV()">
          <span>Export CSV</span>
        </button>
      </div>

      <!-- Middle 3-Column Toggle Grid -->
      <div class="toggle-grid">
        
        <!-- Option Card 1 -->
        <div class="toggle-card">
          <label class="toggle-header">
            <input type="checkbox" id="checkHighlightInstant" checked onchange="onSettingChange()">
            <span class="toggle-title">Highlight instant-sell profits above 15k</span>
          </label>
          <p class="toggle-helper">
            When on, show the extra instant-sell profit and rank qualifying shards first (highest instant profit first). When off, use only the chosen sort.
          </p>
        </div>

        <!-- Option Card 2 -->
        <div class="toggle-card">
          <label class="toggle-header">
            <input type="checkbox" id="checkChameleonBuyOrder" onchange="onSettingChange()">
            <span class="toggle-title">Use buy-order price for Chameleon ingredients</span>
          </label>
          <p class="toggle-helper">
            Price Chameleon inputs at the current highest buy order instead of their instant-buy offer. Assumes your buy order fills; applies to all fusion levels.
          </p>
        </div>

        <!-- Option Card 3 -->
        <div class="toggle-card">
          <div class="fee-row">
            <div>
              <div class="toggle-title">Fusion cost per craft</div>
              <p class="toggle-helper">
                Coins charged for each fusion, including intermediate crafts. Changes instantly recalculate prices and profits.
              </p>
            </div>
            <div class="fee-input-wrap">
              <input type="number" id="feeInput" class="fee-input" value="1000" min="0" step="100" oninput="onSettingChange()">
              <span class="fee-unit">coins</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Status & More options Bar -->
      <div class="status-bar">
        <div class="status-summary" id="statusSummary">
          <span class="status-highlight" id="statusShards">Loaded 322 shard markets</span> · 
          <span id="statusRecipes">131,512 recipe options</span> · 
          <span id="statusLevels">up to 4 fusion levels</span> · 
          <span id="statusFee">1,000 coins/craft.</span>
        </div>

        <div class="status-pills">
          <div class="pill-badge" id="snapshotBadge">Data snapshot: Initializing · Auto-refresh &lt; 5 min</div>
          <button class="btn-more-options" onclick="toggleMoreOptions()">
            <span id="moreOptionsText">More options ▾</span>
          </button>
        </div>
      </div>

      <!-- Collapsible More Options Panel -->
      <div class="more-options-panel" id="moreOptionsPanel">
        
        <div class="panel-option">
          <div class="panel-option-title">Crocodile Level (Pure Reptile)</div>
          <div class="slider-row">
            <input type="range" id="crocSlider" min="0" max="10" value="10" step="1" oninput="onCrocSliderChange(this.value)">
            <span class="slider-val" id="crocVal">Lvl 10 (1.20x)</span>
          </div>
          <div style="display:flex; gap:6px; margin-top:4px;">
            <button class="preset-btn" onclick="setCrocLevel(10)">Level 10</button>
            <button class="preset-btn" onclick="setCrocLevel(0)">Level 0 (No Double)</button>
          </div>
        </div>

        <div class="panel-option">
          <div class="panel-option-title">Multiplier Application Mode</div>
          <select id="multiplierModeSelect" class="select-input" onchange="onSettingChange()">
            <option value="global">Scanner Default Mode (Global expected multiplier)</option>
            <option value="strict">Strict Mode (Reptile recipes only)</option>
          </select>
        </div>

        <div class="panel-option">
          <div class="panel-option-title">Bazaar Sales Tax Deduction</div>
          <select id="taxSelect" class="select-input" onchange="onSettingChange()">
            <option value="0">0% (Raw Spread / default scanner)</option>
            <option value="0.01">1.0% (Maxed Bazaar Flipper II)</option>
            <option value="0.0125" selected>1.25% (Standard Bazaar Tax)</option>
          </select>
        </div>

        <div class="panel-option">
          <div class="panel-option-title">Instant-Sell Highlight Threshold</div>
          <div class="fee-input-wrap">
            <input type="number" id="instantThresholdInput" class="fee-input" value="15000" step="1000" oninput="onSettingChange()" style="width:100px;">
            <span class="fee-unit">coins</span>
          </div>
        </div>

        <div class="panel-option">
          <div class="panel-option-title">Max Fusion Search Depth</div>
          <select id="depthSelect" class="select-input" onchange="onSettingChange()">
            <option value="1">1 Fusion Level (Direct Ingredients)</option>
            <option value="2">2 Fusion Levels</option>
            <option value="3">3 Fusion Levels</option>
            <option value="4" selected>4 Fusion Levels (Full Recursive)</option>
          </select>
        </div>

        <div class="panel-option">
          <div class="panel-option-title">Ingredient Acquisition Mode</div>
          <select id="ingredientModeSelect" class="select-input" onchange="onSettingChange()">
            <option value="instant">Instant-Buy All Ingredients (Fastest)</option>
            <option value="buyOrder">Place Buy Orders for All Ingredients (Cheaper/Slower)</option>
          </select>
        </div>

      </div>

    </section>

    <!-- Collapsible Beginner Guide -->
    <section class="guide-banner">
      <div class="guide-toggle" onclick="toggleGuide()">
        <div class="guide-toggle-left">
          <span class="guide-badge">Beginner Guide</span>
          <span class="guide-title">How to use this scanner & execute an instant flip (4 steps)</span>
        </div>
        <span id="guideToggleIcon" style="color:var(--accent-cyan); font-weight:700;">▾ Show guide</span>
      </div>

      <div class="guide-content" id="guideContent">
        <div class="guide-step">
          <div class="guide-step-num">STEP 1</div>
          <div class="guide-step-head">Find Gold Badges</div>
          <div class="guide-step-text">
            Look for the gold <code>INSTANT-SELL PROFIT</code> badge in Column 1. This means the highest active Buy Order is higher than the Cost to Fuse even with instant buys!
          </div>
        </div>

        <div class="guide-step">
          <div class="guide-step-num">STEP 2</div>
          <div class="guide-step-head">Check Instant Depth</div>
          <div class="guide-step-text">
            Look at the amber <code>instant</code> number under Outgoing Sell Offers. That indicates exactly how many shards you can instantly sell before the order book shifts.
          </div>
        </div>

        <div class="guide-step">
          <div class="guide-step-num">STEP 3</div>
          <div class="guide-step-head">Buy Ingredients</div>
          <div class="guide-step-text">
            Click <code>▸ View recursive route</code> and enter your desired quantity. Instant-Buy the listed raw materials at Bazaar, then right-click them into <code>/huntingbox</code>.
          </div>
        </div>

        <div class="guide-step">
          <div class="guide-step-num">STEP 4</div>
          <div class="guide-step-head">Fuse & Sell</div>
          <div class="guide-step-text">
            Open <code>/fusionbox</code> (or call Kysha). Follow the Fusion Tree from bottom to top. Shift + Right-Click the output shard to your inventory and click <b>Sell Instantly</b>!
          </div>
        </div>
      </div>
    </section>

    <!-- Main Scanner Data Table -->
    <div class="table-container">
      <table class="scanner-table" id="scannerTable">
        <thead>
          <tr>
            <th class="th-col1">
              <div class="th-line1"># / SHARD</div>
            </th>
            <th class="th-col2">
              <div class="th-line1">SELL ORDER PRICE</div>
              <div class="th-line2">lowest current offer</div>
            </th>
            <th class="th-col3">
              <div class="th-line1">BUY ORDER PRICE</div>
              <div class="th-line2">highest current bid</div>
            </th>
            <th class="th-col4">
              <div class="th-line1">COST TO FUSE</div>
              <div class="th-line2">coins per shard</div>
            </th>
            <th class="th-col5">
              <div class="th-line1">FUSION PROFIT</div>
              <div class="th-line2">offer - cost · instant sell &gt; 15k</div>
            </th>
            <th class="th-col6">
              <div class="th-line1">OUTGOING SELL OFFERS</div>
              <div class="th-line2">active sell orders · profitable buy depth</div>
            </th>
            <th class="th-col7">
              <div class="th-line1">BOUGHT (7D)</div>
              <div class="th-line2">buyMovingWeek · per hour</div>
            </th>
          </tr>
        </thead>
        <tbody id="tableBody">
          <!-- Populated by JS -->
        </tbody>
      </table>

      <div id="emptyMessage" class="empty-state" style="display:none;">
        <div class="empty-title">No shards match your filter</div>
        <p>Try searching for a different name or clear the filter input.</p>
      </div>
    </div>

  </div>

  <div id="toast" class="toast"></div>

  <!-- EMBEDDED CANONICAL FUSION DATA -->
  <script>
    const EMBEDDED_FUSION_DATA = ${minifiedFusionJson};
  </script>

  <!-- MAIN SCANNER APPLICATION SCRIPT -->
  <script>
    // --- GLOBAL STATE ---
    let bazaarData = null;
    let fusionData = EMBEDDED_FUSION_DATA;
    let lastSnapshotTime = null;
    let autoRefreshTimer = null;
    let secondsUntilRefresh = 300;

    // Normalization Alias Map
    const SHARD_ALIASES = {
      'SHARD_ENDSTONE_PROTECTOR': 'SHARD_END_STONE_PROTECTOR',
      'SHARD_WITHER_SPECTER': 'SHARD_WITHER_SPECTRE',
      'SHARD_STRIDER_SURFER': 'SHARD_STRIDERSURFER',
      'SHARD_MAGMA_CUBE': 'SHARD_MAGMACUBE',
      'SHARD_ZOMBIE_PIGMAN': 'SHARD_PIGMAN'
    };

    // Precompiled indexes
    let shardList = []; // Array of { idx, code, name, internal_id, rarity, family, fuse_amount, isReptile }
    let codeToIdx = new Map();
    let internalIdToIdx = new Map();
    let flatRecipes = []; // Flat recipe list for sub-50ms DP
    let numShards = 0;
    let numRecipes = 0;

    // Fast Typed Arrays for Recipes
    let rOut, rInA, rCountA, rInB, rCountB, rBaseYield, rIsReptile;

    // Solver Solution
    let solverResults = null;
    let expandedDrawerShardIdx = null;

    // --- INITIALIZATION ---
    function initializeCatalog() {
      const shardsObj = fusionData.shards;
      const shardCodes = Object.keys(shardsObj);
      numShards = shardCodes.length;

      shardList = new Array(numShards);
      codeToIdx.clear();
      internalIdToIdx.clear();

      for (let i = 0; i < numShards; i++) {
        const code = shardCodes[i];
        const s = shardsObj[code];
        const internalId = s.internal_id || ('SHARD_' + s.name.toUpperCase().replace(/\\s+/g, '_'));
        const isReptile = (s.family || '').toLowerCase().includes('reptile');

        const item = {
          idx: i,
          code,
          name: s.name,
          internal_id: internalId,
          rarity: (s.rarity || 'common').toLowerCase(),
          family: s.family || '',
          fuse_amount: s.fuse_amount || 5,
          isReptile
        };

        shardList[i] = item;
        codeToIdx.set(code, i);
        internalIdToIdx.set(internalId, i);
      }

      // Precompile Flat Recipes
      flatRecipes = [];
      for (const [outCode, yields] of Object.entries(fusionData.recipes)) {
        const outIdx = codeToIdx.get(outCode);
        if (outIdx === undefined) continue;

        for (const [yieldStr, pairs] of Object.entries(yields)) {
          const baseYield = parseInt(yieldStr, 10);
          for (const [inACode, inBCode] of pairs) {
            const inAIdx = codeToIdx.get(inACode);
            const inBIdx = codeToIdx.get(inBCode);
            if (inAIdx === undefined || inBIdx === undefined) continue;

            flatRecipes.push({
              outIdx,
              inAIdx,
              countA: shardList[inAIdx].fuse_amount,
              inBIdx,
              countB: shardList[inBIdx].fuse_amount,
              baseYield,
              isReptile: shardList[inAIdx].isReptile || shardList[inBIdx].isReptile || shardList[outIdx].isReptile
            });
          }
        }
      }

      numRecipes = flatRecipes.length;

      // Allocate Typed Arrays
      rOut = new Int32Array(numRecipes);
      rInA = new Int32Array(numRecipes);
      rCountA = new Int32Array(numRecipes);
      rInB = new Int32Array(numRecipes);
      rCountB = new Int32Array(numRecipes);
      rBaseYield = new Float64Array(numRecipes);
      rIsReptile = new Uint8Array(numRecipes);

      for (let r = 0; r < numRecipes; r++) {
        const rec = flatRecipes[r];
        rOut[r] = rec.outIdx;
        rInA[r] = rec.inAIdx;
        rCountA[r] = rec.countA;
        rInB[r] = rec.inBIdx;
        rCountB[r] = rec.countB;
        rBaseYield[r] = rec.baseYield;
        rIsReptile[r] = rec.isReptile ? 1 : 0;
      }

      document.getElementById('statusRecipes').textContent = numRecipes.toLocaleString() + ' recipe options';
    }

    // --- DATA LAYER (FETCH LIVE BAZAAR) ---
    async function fetchLiveBazaarData() {
      const btn = document.getElementById('btnFetch');
      btn.classList.add('loading');
      btn.disabled = true;

      try {
        const res = await fetch('https://api.hypixel.net/v2/skyblock/bazaar');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        if (!json.success || !json.products) throw new Error('Invalid Bazaar payload');

        bazaarData = json.products;
        lastSnapshotTime = new Date();
        secondsUntilRefresh = 300;
        showToast('Live Bazaar data updated successfully!');

        // Update active market count
        const activeShardMarkets = Object.keys(bazaarData).filter(k => k.startsWith('SHARD_')).length;
        document.getElementById('statusShards').textContent = 'Loaded ' + activeShardMarkets + ' shard markets';

        runSolverAndRender();
        startAutoRefreshTimer();
      } catch (err) {
        console.error('Bazaar fetch error:', err);
        showToast('Could not reach Hypixel Bazaar API. Running in offline mode.');
        // If offline and bazaarData is null, initialize with mock / empty
        if (!bazaarData) {
          bazaarData = {};
        }
        runSolverAndRender();
      } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    }

    function startAutoRefreshTimer() {
      if (autoRefreshTimer) clearInterval(autoRefreshTimer);
      updateSnapshotBadge();

      autoRefreshTimer = setInterval(() => {
        secondsUntilRefresh--;
        if (secondsUntilRefresh <= 0) {
          fetchLiveBazaarData();
        } else {
          updateSnapshotBadge();
        }
      }, 1000);
    }

    function updateSnapshotBadge() {
      const badge = document.getElementById('snapshotBadge');
      if (!lastSnapshotTime) {
        badge.textContent = 'Data snapshot: Offline · Auto-refresh paused';
        return;
      }

      const timeStr = lastSnapshotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const min = Math.floor(secondsUntilRefresh / 60);
      const sec = secondsUntilRefresh % 60;
      const countdownStr = min + ':' + (sec < 10 ? '0' : '') + sec;
      badge.textContent = 'Data snapshot: ' + timeStr + ' · Auto-refresh in ' + countdownStr;
    }

    // --- DP SOLVER (SUB-50MS 4-LEVEL BELLMAN-FORD) ---
    function solveFusionCosts() {
      if (!bazaarData) return null;

      const fusionCostPerCraft = parseFloat(document.getElementById('feeInput').value) || 0;
      const useBuyOrderForChameleon = document.getElementById('checkChameleonBuyOrder').checked;
      const crocLevel = parseInt(document.getElementById('crocSlider').value, 10) || 0;
      const crocMultiplier = 1.0 + 0.02 * crocLevel;
      const multiplierMode = document.getElementById('multiplierModeSelect').value;
      const ingredientMode = document.getElementById('ingredientModeSelect').value;
      const taxRate = parseFloat(document.getElementById('taxSelect').value) || 0;
      const instantThreshold = parseFloat(document.getElementById('instantThresholdInput').value) || 15000;
      const maxLevels = parseInt(document.getElementById('depthSelect').value, 10) || 4;

      document.getElementById('statusFee').textContent = fusionCostPerCraft.toLocaleString() + ' coins/craft.';
      document.getElementById('statusLevels').textContent = 'up to ' + maxLevels + ' fusion levels';

      const chamIdx = internalIdToIdx.get('SHARD_CHAMELEON');

      // Arrays for current prices
      const sellOrderPrices = new Float64Array(numShards);
      const buyOrderPrices = new Float64Array(numShards);
      const cost0 = new Float64Array(numShards);
      const buyOrdersCount = new Int32Array(numShards);
      const buyMovingWeek = new Float64Array(numShards);

      for (let i = 0; i < numShards; i++) {
        const s = shardList[i];
        let prod = bazaarData[s.internal_id];
        if (!prod && SHARD_ALIASES[s.internal_id]) {
          prod = bazaarData[SHARD_ALIASES[s.internal_id]];
        }

        if (prod) {
          const bestSellOffer = (prod.buy_summary && prod.buy_summary.length > 0) ? prod.buy_summary[0].pricePerUnit : Infinity;
          const bestBuyOrder = (prod.sell_summary && prod.sell_summary.length > 0) ? prod.sell_summary[0].pricePerUnit : 0;
          
          sellOrderPrices[i] = bestSellOffer;
          buyOrderPrices[i] = bestBuyOrder;
          buyOrdersCount[i] = prod.quick_status ? prod.quick_status.buyOrders : 0;
          buyMovingWeek[i] = prod.quick_status ? prod.quick_status.buyMovingWeek : 0;

          // Acquisition cost at Level 0
          if (i === chamIdx && useBuyOrderForChameleon) {
            cost0[i] = bestBuyOrder > 0 ? bestBuyOrder : bestSellOffer;
          } else if (ingredientMode === 'buyOrder') {
            cost0[i] = bestBuyOrder > 0 ? bestBuyOrder : bestSellOffer;
          } else {
            cost0[i] = bestSellOffer;
          }
        } else {
          sellOrderPrices[i] = Infinity;
          buyOrderPrices[i] = 0;
          cost0[i] = Infinity;
          buyOrdersCount[i] = 0;
          buyMovingWeek[i] = 0;
        }
      }

      // Precalculate Effective Yield for each flat recipe
      const rYield = new Float64Array(numRecipes);
      for (let r = 0; r < numRecipes; r++) {
        let mult = 1.0;
        if (multiplierMode === 'global') {
          mult = crocMultiplier;
        } else {
          mult = (rIsReptile[r] === 1) ? crocMultiplier : 1.0;
        }
        rYield[r] = rBaseYield[r] * mult;
      }

      // DP Storage
      const bestCost = new Array(maxLevels + 1);
      const recipeCost = new Array(maxLevels + 1);
      const bestRecipe = new Array(maxLevels + 1);

      bestCost[0] = new Float64Array(cost0);
      for (let d = 1; d <= maxLevels; d++) {
        bestCost[d] = new Float64Array(numShards).fill(Infinity);
        recipeCost[d] = new Float64Array(numShards).fill(Infinity);
        bestRecipe[d] = new Int32Array(numShards).fill(-1);
      }

      // Run synchronous DP
      for (let d = 1; d <= maxLevels; d++) {
        const prevCost = bestCost[d - 1];
        const curRecipeCost = recipeCost[d];
        const curBestRecipe = bestRecipe[d];
        const curBestCost = bestCost[d];

        // Seed curBestCost with best from previous levels
        for (let i = 0; i < numShards; i++) {
          curBestCost[i] = prevCost[i];
        }

        // Walk all recipes
        for (let r = 0; r < numRecipes; r++) {
          const out = rOut[r];
          const inA = rInA[r];
          const inB = rInB[r];
          const costA = prevCost[inA];
          const costB = prevCost[inB];

          if (costA === Infinity || costB === Infinity) continue;

          const craftCost = (rCountA[r] * costA + rCountB[r] * costB + fusionCostPerCraft) / rYield[r];
          if (craftCost < curRecipeCost[out]) {
            curRecipeCost[out] = craftCost;
            curBestRecipe[out] = r;
          }
        }

        // Update overall bestCost at level d
        for (let i = 0; i < numShards; i++) {
          if (curRecipeCost[i] < curBestCost[i]) {
            curBestCost[i] = curRecipeCost[i];
          }
        }
      }

      // Compute final shard metrics
      const results = new Array(numShards);

      for (let i = 0; i < numShards; i++) {
        const s = shardList[i];
        let minCostToFuse = Infinity;
        let bestLevel = -1;

        for (let d = 1; d <= maxLevels; d++) {
          if (recipeCost[d][i] < minCostToFuse) {
            minCostToFuse = recipeCost[d][i];
            bestLevel = d;
          }
        }

        const sellOffer = sellOrderPrices[i];
        const buyBid = buyOrderPrices[i];

        // Fusion profit = sellOffer * (1 - tax) - costToFuse
        const fusionProfit = (sellOffer !== Infinity && minCostToFuse !== Infinity)
          ? (sellOffer * (1 - taxRate) - minCostToFuse)
          : -Infinity;

        // Instant-sell profit = buyBid * (1 - tax) - costToFuse
        const instantProfit = (buyBid > 0 && minCostToFuse !== Infinity)
          ? (buyBid * (1 - taxRate) - minCostToFuse)
          : -Infinity;

        // Profitable Buy Depth (X instant)
        let profitableBuyDepth = 0;
        let prod = bazaarData[s.internal_id];
        if (!prod && SHARD_ALIASES[s.internal_id]) prod = bazaarData[SHARD_ALIASES[s.internal_id]];

        if (prod && prod.sell_summary && minCostToFuse !== Infinity) {
          const effectiveThreshold = document.getElementById('checkHighlightInstant').checked ? instantThreshold : 0;
          for (let k = 0; k < prod.sell_summary.length; k++) {
            const tier = prod.sell_summary[k];
            if (tier.pricePerUnit * (1 - taxRate) - minCostToFuse >= effectiveThreshold) {
              profitableBuyDepth += tier.amount;
            }
          }
        }

        const volWeek = buyMovingWeek[i];
        const hourlyVelocity = Math.round(volWeek / 168);
        const velocityProfit = (fusionProfit > 0) ? (fusionProfit * hourlyVelocity) : 0;
        const roi = (minCostToFuse > 0 && minCostToFuse !== Infinity && fusionProfit !== -Infinity)
          ? (fusionProfit / minCostToFuse * 100)
          : -Infinity;

        results[i] = {
          idx: i,
          code: s.code,
          name: s.name,
          internal_id: s.internal_id,
          rarity: s.rarity,
          sellOrderPrice: sellOffer,
          buyOrderPrice: buyBid,
          costToFuse: minCostToFuse,
          bestLevel,
          fusionProfit,
          instantProfit,
          activeSellOrders: buyOrdersCount[i],
          profitableBuyDepth,
          vol7d: volWeek,
          hourlyVelocity,
          velocityProfit,
          roi,
          isInstantProfitable: (instantProfit >= instantThreshold)
        };
      }

      return {
        results,
        bestRecipe,
        recipeCost,
        bestCost,
        taxRate,
        crocLevel,
        crocMultiplier,
        maxLevels
      };
    }

    // --- RECURSIVE ROUTE & BATCH SLIPPAGE CALCULATOR ---
    function buildCraftingPlan(targetShardIdx, targetQty, crocMultiplier) {
      const plan = {
        targetShardIdx,
        targetQty,
        nodes: [],
        rawLeaves: new Map(), // shardIdx -> totalRawQty
        totalCrafts: 0
      };

      if (!solverResults) return plan;
      const { bestRecipe, maxLevels } = solverResults;

      // Find which level produced the optimal cost
      let optLevel = solverResults.results[targetShardIdx].bestLevel;
      if (optLevel <= 0) return plan;

      // Helper to traverse tree and determine integer craft counts
      function recurse(shardIdx, qtyNeeded, currentLevel) {
        if (currentLevel <= 0 || !bestRecipe[currentLevel]) {
          // Leaf / raw bazaar purchase
          const prev = plan.rawLeaves.get(shardIdx) || 0;
          plan.rawLeaves.set(shardIdx, prev + qtyNeeded);
          return {
            shardIdx,
            qtyNeeded,
            isRaw: true
          };
        }

        const rIdx = bestRecipe[currentLevel][shardIdx];
        if (rIdx === -1) {
          const prev = plan.rawLeaves.get(shardIdx) || 0;
          plan.rawLeaves.set(shardIdx, prev + qtyNeeded);
          return {
            shardIdx,
            qtyNeeded,
            isRaw: true
          };
        }

        const rec = flatRecipes[rIdx];
        const effectiveYieldPerCraft = rec.baseYield * crocMultiplier;
        const craftsNeeded = Math.ceil(qtyNeeded / effectiveYieldPerCraft);
        plan.totalCrafts += craftsNeeded;

        const qtyA = craftsNeeded * rec.countA;
        const qtyB = craftsNeeded * rec.countB;

        const subA = recurse(rec.inAIdx, qtyA, currentLevel - 1);
        const subB = recurse(rec.inBIdx, qtyB, currentLevel - 1);

        return {
          shardIdx,
          qtyNeeded,
          craftsNeeded,
          recipe: rec,
          isRaw: false,
          subA,
          subB
        };
      }

      plan.root = recurse(targetShardIdx, targetQty, optLevel);
      return plan;
    }

    function simulateBatchExecution(plan, taxRate) {
      let totalMaterialsCost = 0;
      let allSupplyOk = true;
      const leafDetails = [];

      // Walk buy_summary for each raw ingredient cumulatively
      for (const [shardIdx, neededQty] of plan.rawLeaves.entries()) {
        const s = shardList[shardIdx];
        let prod = bazaarData[s.internal_id];
        if (!prod && SHARD_ALIASES[s.internal_id]) prod = bazaarData[SHARD_ALIASES[s.internal_id]];

        let remaining = neededQty;
        let costForShard = 0;
        let availableSupply = 0;

        if (prod && prod.buy_summary) {
          for (let i = 0; i < prod.buy_summary.length; i++) {
            const tier = prod.buy_summary[i];
            availableSupply += tier.amount;
            if (remaining > 0) {
              const take = Math.min(remaining, tier.amount);
              costForShard += take * tier.pricePerUnit;
              remaining -= take;
            }
          }
        }

        let isLowSupply = false;
        if (remaining > 0) {
          isLowSupply = true;
          allSupplyOk = false;
          // Extrapolate with last tier price or fallback
          const lastPrice = (prod && prod.buy_summary && prod.buy_summary.length > 0)
            ? prod.buy_summary[prod.buy_summary.length - 1].pricePerUnit
            : (solverResults.results[shardIdx].sellOrderPrice || 0);
          costForShard += remaining * lastPrice;
        }

        totalMaterialsCost += costForShard;
        const vwap = (neededQty > 0) ? (costForShard / neededQty) : 0;

        leafDetails.push({
          shardIdx,
          name: s.name,
          rarity: s.rarity,
          neededQty,
          costForShard,
          vwap,
          availableSupply,
          isLowSupply
        });
      }

      const fusionCostPerCraft = parseFloat(document.getElementById('feeInput').value) || 0;
      const totalCraftFees = plan.totalCrafts * fusionCostPerCraft;
      const totalBatchCost = totalMaterialsCost + totalCraftFees;
      const costPerShard = (plan.targetQty > 0) ? (totalBatchCost / plan.targetQty) : 0;
      const purseBuffer = totalMaterialsCost * 1.04 + totalCraftFees;

      // Walk sell_summary for target shard
      const targetS = shardList[plan.targetShardIdx];
      let prod = bazaarData[targetS.internal_id];
      if (!prod && SHARD_ALIASES[targetS.internal_id]) prod = bazaarData[SHARD_ALIASES[targetS.internal_id]];

      let remSell = plan.targetQty;
      let instantRevenueGross = 0;
      let instantDepthTotal = 0;

      if (prod && prod.sell_summary) {
        for (let i = 0; i < prod.sell_summary.length; i++) {
          const tier = prod.sell_summary[i];
          instantDepthTotal += tier.amount;
          if (remSell > 0) {
            const take = Math.min(remSell, tier.amount);
            instantRevenueGross += take * tier.pricePerUnit;
            remSell -= take;
          }
        }
      }

      const instantRevenueNet = instantRevenueGross * (1 - taxRate);
      const instantProfit = instantRevenueNet - totalBatchCost;
      const sellOfferPrice = solverResults.results[plan.targetShardIdx].sellOrderPrice;
      const sellOfferRevenueNet = (sellOfferPrice !== Infinity) ? (sellOfferPrice * plan.targetQty * (1 - taxRate)) : 0;
      const sellOfferProfit = sellOfferRevenueNet - totalBatchCost;

      return {
        totalMaterialsCost,
        totalCraftFees,
        totalBatchCost,
        costPerShard,
        purseBuffer,
        allSupplyOk,
        leafDetails,
        instantRevenueNet,
        instantProfit,
        sellOfferProfit,
        instantDepthTotal
      };
    }

    // --- UI RENDERING & SORTING ---
    function runSolverAndRender() {
      solverResults = solveFusionCosts();
      if (!solverResults) return;
      renderTable();
      if (expandedDrawerShardIdx !== null) {
        renderDrawer(expandedDrawerShardIdx);
      }
    }

    function renderTable() {
      const tbody = document.getElementById('tableBody');
      const emptyMsg = document.getElementById('emptyMessage');
      const filterText = document.getElementById('filterInput').value.trim().toLowerCase();
      const rankBy = document.getElementById('rankSelect').value;
      const highlightInstant = document.getElementById('checkHighlightInstant').checked;

      let items = solverResults.results.slice();

      // Apply Filter
      if (filterText) {
        items = items.filter(it => 
          it.name.toLowerCase().includes(filterText) ||
          it.internal_id.toLowerCase().includes(filterText) ||
          it.code.toLowerCase().includes(filterText)
        );
      }

      if (items.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
      }
      emptyMsg.style.display = 'none';

      // Sorters
      function baseCompare(a, b) {
        switch (rankBy) {
          case 'fusionProfit':
            return b.fusionProfit - a.fusionProfit;
          case 'instantProfit':
            return b.instantProfit - a.instantProfit;
          case 'costToFuse':
            return a.costToFuse - b.costToFuse;
          case 'roi':
            return b.roi - a.roi;
          case 'vol7d':
            return b.vol7d - a.vol7d;
          case 'velocity':
            return b.velocityProfit - a.velocityProfit;
          default:
            return b.fusionProfit - a.fusionProfit;
        }
      }

      if (highlightInstant) {
        items.sort((a, b) => {
          if (a.isInstantProfitable && !b.isInstantProfitable) return -1;
          if (!a.isInstantProfitable && b.isInstantProfitable) return 1;
          if (a.isInstantProfitable && b.isInstantProfitable) {
            return b.instantProfit - a.instantProfit;
          }
          return baseCompare(a, b);
        });
      } else {
        items.sort(baseCompare);
      }

      // Build HTML fragment
      let html = '';
      for (let rank = 1; rank <= items.length; rank++) {
        const item = items[rank - 1];
        const isExpanded = (expandedDrawerShardIdx === item.idx);

        // Price formatting
        const sellOrderStr = (item.sellOrderPrice !== Infinity)
          ? item.sellOrderPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
          : '—';

        const buyOrderStr = (item.buyOrderPrice > 0)
          ? item.buyOrderPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
          : '—';

        const costToFuseStr = (item.costToFuse !== Infinity)
          ? item.costToFuse.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : '—';

        const fusionProfitStr = (item.fusionProfit !== -Infinity)
          ? (item.fusionProfit > 0 ? '+' : '') + item.fusionProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : '—';

        const instantSellStr = (item.instantProfit !== -Infinity)
          ? (item.instantProfit > 0 ? '+' : '') + item.instantProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : null;

        html += \`
          <tr class="data-row" id="row-\${item.idx}">
            <!-- Col 1: # / Shard -->
            <td class="col-tint-1">
              <div class="shard-name-wrap">
                <div class="shard-title-row">
                  <span>\${rank}. \${item.name}</span>
                  <a href="https://skyblock.bz/product/\${item.internal_id}" target="_blank" rel="noopener" class="shard-link" title="Open on skyblock.bz">↗</a>
                </div>
                <div class="shard-id-code">\${item.internal_id}</div>
                \${item.isInstantProfitable ? '<div class="pill-instant-profit">INSTANT-SELL PROFIT</div>' : ''}
              </div>
            </td>

            <!-- Col 2: Sell Order Price -->
            <td class="col-tint-2">
              <div class="market-price">\${sellOrderStr}</div>
            </td>

            <!-- Col 3: Buy Order Price -->
            <td class="col-tint-3">
              <div class="market-price">\${buyOrderStr}</div>
            </td>

            <!-- Col 4: Cost to Fuse -->
            <td class="col-tint-4">
              <div class="fuse-cost-val">\${costToFuseStr}</div>
              <div class="cell-sublabel">coins per shard</div>
              \${item.costToFuse !== Infinity ? \`
                <button class="btn-toggle-route" onclick="toggleRouteDrawer(\${item.idx})">
                  \${isExpanded ? '▾ Hide recursive route' : '▸ View recursive route'}
                </button>
              \` : ''}
            </td>

            <!-- Col 5: Fusion Profit -->
            <td class="col-tint-5">
              <div class="profit-val \${item.fusionProfit < 0 ? 'negative' : ''}">\${fusionProfitStr}</div>
              <div class="cell-sublabel" style="color:var(--accent-emerald-soft);">coins per shard</div>
              \${instantSellStr ? \`<div class="instant-profit-sub">Instant sell: \${instantSellStr}</div>\` : ''}
            </td>

            <!-- Col 6: Outgoing Sell Offers & Instant Depth -->
            <td class="col-tint-6">
              <div class="split-metric-wrap">
                <div class="metric-side">
                  <span class="metric-val">\${item.activeSellOrders.toLocaleString()}</span>
                  <span class="metric-sub">sell orders</span>
                </div>
                <div class="metric-side">
                  <span class="metric-val amber">\${item.profitableBuyDepth.toLocaleString()}</span>
                  <span class="metric-sub amber">instant</span>
                </div>
              </div>
            </td>

            <!-- Col 7: Volume -->
            <td class="col-tint-7">
              <div class="vol-val">\${Math.round(item.vol7d).toLocaleString()}</div>
              <div class="cell-sublabel">~\${item.hourlyVelocity.toLocaleString()} / hour</div>
            </td>
          </tr>

          <!-- Inline Drawer Row -->
          <tr class="drawer-row \${isExpanded ? 'open' : ''}" id="drawer-row-\${item.idx}">
            <td colspan="7" class="drawer-cell">
              <div class="drawer-content" id="drawer-content-\${item.idx}">
                <!-- Populated by renderDrawer() -->
              </div>
            </td>
          </tr>
        \`;
      }

      tbody.innerHTML = html;
    }

    // --- DRAWER CONTROLS & RENDERING ---
    function toggleRouteDrawer(shardIdx) {
      if (expandedDrawerShardIdx === shardIdx) {
        expandedDrawerShardIdx = null;
      } else {
        expandedDrawerShardIdx = shardIdx;
      }
      renderTable();
      if (expandedDrawerShardIdx !== null) {
        renderDrawer(expandedDrawerShardIdx);
        // Scroll slightly into view
        const el = document.getElementById('row-' + shardIdx);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function renderDrawer(shardIdx) {
      const container = document.getElementById('drawer-content-' + shardIdx);
      if (!container || !solverResults) return;

      const targetShard = shardList[shardIdx];
      const resItem = solverResults.results[shardIdx];

      // Retrieve batch quantity from input if exists, or default
      let batchQty = 1;
      const existingInput = document.getElementById('batchQtyInput-' + shardIdx);
      if (existingInput) {
        batchQty = parseInt(existingInput.value, 10) || 1;
      }

      const crocMultiplier = solverResults.crocMultiplier;
      const taxRate = solverResults.taxRate;

      const plan = buildCraftingPlan(shardIdx, batchQty, crocMultiplier);
      const sim = simulateBatchExecution(plan, taxRate);

      // Max profitable instant-sell quantity
      const maxInstantQty = resItem.profitableBuyDepth > 0 ? resItem.profitableBuyDepth : 1;

      let html = \`
        <!-- Drawer Top Control Bar -->
        <div class="drawer-top-bar">
          <div class="batch-controls">
            <span class="batch-label">Batch Quantity:</span>
            <input type="number" id="batchQtyInput-\${shardIdx}" class="batch-input" value="\${batchQty}" min="1" oninput="updateDrawerBatch(\${shardIdx}, this.value)">
            <button class="preset-btn" onclick="setDrawerBatch(\${shardIdx}, 1)">1x</button>
            <button class="preset-btn" onclick="setDrawerBatch(\${shardIdx}, 24)">24x</button>
            <button class="preset-btn" onclick="setDrawerBatch(\${shardIdx}, 40)">40x</button>
            <button class="preset-btn highlight" onclick="setDrawerBatch(\${shardIdx}, \${maxInstantQty})">Max Instant (\${maxInstantQty}x)</button>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <button class="preset-btn" onclick="toggleDrawerCroc(\${shardIdx})">
              Crocodile: Lvl \${solverResults.crocLevel} (\${crocMultiplier.toFixed(2)}x)
            </button>
            <span class="pill-badge">Bazaar Tax: \${(taxRate * 100).toFixed(2)}%</span>
          </div>
        </div>

        <!-- 5 Summary Stat Cards -->
        <div class="summary-grid">
          
          <div class="stat-card">
            <div class="stat-card-title">Cost per Shard</div>
            <div class="stat-card-val" style="color:var(--accent-cyan);">\${sim.costPerShard.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div class="stat-card-sub">expected avg / shard</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-title">Total Batch Cost</div>
            <div class="stat-card-val">\${formatCoinMillions(sim.totalBatchCost)}</div>
            <div class="stat-card-sub">Purse +4% Buffer: \${formatCoinMillions(sim.purseBuffer)}</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-title">Instant-Sell Profit</div>
            <div class="stat-card-val" style="color:\${sim.instantProfit > 0 ? 'var(--accent-emerald)' : 'var(--accent-red)'}">
              \${(sim.instantProfit > 0 ? '+' : '') + formatCoinMillions(sim.instantProfit)}
            </div>
            <div class="stat-card-sub">Sell-Offer: \${(sim.sellOfferProfit > 0 ? '+' : '') + formatCoinMillions(sim.sellOfferProfit)}</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-title">Total Fusions</div>
            <div class="stat-card-val">\${plan.totalCrafts.toLocaleString()}x</div>
            <div class="stat-card-sub">in-game /fusionbox crafts</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-title">Order Book Supply</div>
            <div class="stat-card-val">
              \${sim.allSupplyOk 
                ? '<span style="color:#4ade80;">✅ Sufficient</span>' 
                : '<span style="color:#fbbf24;">⚠️ Low Supply</span>'}
            </div>
            <div class="stat-card-sub">\${sim.allSupplyOk ? 'Instant-buy fully filled' : 'High slippage on ingredients'}</div>
          </div>

        </div>

        <!-- Materials Needed Panel -->
        <div class="section-title">
          <span>Materials Needed</span>
          <span class="section-badge">\${batchQty}x \${targetShard.name} (\${plan.totalCrafts} crafts)</span>
        </div>

        <div class="materials-grid">
          \${sim.leafDetails.map(leaf => \`
            <div class="material-card">
              <div class="material-header">
                <span class="rarity-dot rarity-\${leaf.rarity}"></span>
                <span class="material-name"><span class="material-amount">\${leaf.neededQty.toLocaleString()}x</span> \${leaf.name}</span>
              </div>
              <div class="material-details">
                <span>Total: \${formatCoinMillions(leaf.costForShard)}</span>
                <span>@ \${leaf.vwap.toLocaleString(undefined, { maximumFractionDigits: 1 })}/ea</span>
              </div>
              <div class="supply-badge \${leaf.isLowSupply ? 'warn' : 'ok'}">
                \${leaf.isLowSupply 
                  ? '⚠️ ' + leaf.availableSupply.toLocaleString() + ' in offers (Shortfall)' 
                  : '✅ ' + leaf.availableSupply.toLocaleString() + ' available in offers'}
              </div>
            </div>
          \`).join('')}
        </div>

        <!-- Fusion Tree Panel -->
        <div class="fusion-tree-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div class="section-title" style="margin:0;">
              <span>Fusion Tree Hierarchy</span>
            </div>
            <div class="tree-header-actions">
              <button class="preset-btn" onclick="copyTreeToClipboard(\${shardIdx})">Copy Tree</button>
            </div>
          </div>

          <div id="treeContainer-\${shardIdx}">
            \${renderTreeNode(plan.root, crocMultiplier)}
          </div>
        </div>
      \`;

      container.innerHTML = html;
    }

    function renderTreeNode(node, crocMultiplier) {
      if (!node) return '';
      const s = shardList[node.shardIdx];

      if (node.isRaw) {
        return \`
          <div class="tree-node">
            <div class="tree-item-box" style="border-left: 3px solid var(--accent-emerald);">
              <div class="tree-item-left">
                <span class="rarity-dot rarity-\${s.rarity}"></span>
                <span style="font-weight:700; color:#f8fafc;">\${node.qtyNeeded.toLocaleString()}x \${s.name}</span>
                <span class="badge" style="background:#090d16; color:var(--accent-emerald-soft); font-size:10.5px; padding:2px 6px; border-radius:4px;">Raw Ingredient</span>
              </div>
            </div>
          </div>
        \`;
      }

      return \`
        <div class="tree-node">
          <div class="tree-item-box">
            <div class="tree-item-left">
              <span class="rarity-dot rarity-\${s.rarity}"></span>
              <span style="font-weight:700; color:#f8fafc;">\${node.qtyNeeded.toLocaleString()}x \${s.name}</span>
              <span class="tree-craft-count">\${node.craftsNeeded} crafts</span>
              <span style="font-size:11px; color:var(--text-dim);">yield \${node.recipe.baseYield}x</span>
            </div>
          </div>
          \${renderTreeNode(node.subA, crocMultiplier)}
          \${renderTreeNode(node.subB, crocMultiplier)}
        </div>
      \`;
    }

    function updateDrawerBatch(shardIdx, val) {
      renderDrawer(shardIdx);
    }

    function setDrawerBatch(shardIdx, val) {
      const input = document.getElementById('batchQtyInput-' + shardIdx);
      if (input) {
        input.value = Math.max(1, parseInt(val, 10) || 1);
        renderDrawer(shardIdx);
      }
    }

    function toggleDrawerCroc(shardIdx) {
      const cur = parseInt(document.getElementById('crocSlider').value, 10);
      const next = cur === 10 ? 0 : 10;
      setCrocLevel(next);
      renderDrawer(shardIdx);
    }

    function formatCoinMillions(val) {
      if (val === Infinity || val === -Infinity || isNaN(val)) return '—';
      const abs = Math.abs(val);
      if (abs >= 1_000_000) {
        return (val / 1_000_000).toFixed(2) + 'M';
      }
      if (abs >= 1_000) {
        return (val / 1_000).toFixed(1) + 'k';
      }
      return val.toFixed(0);
    }

    function copyTreeToClipboard(shardIdx) {
      const s = shardList[shardIdx];
      const text = 'Hypixel Shard Fusion Tree: ' + s.name + ' (' + s.internal_id + ')';
      navigator.clipboard.writeText(text).then(() => {
        showToast('Crafting tree copied to clipboard!');
      });
    }

    // --- CONTROL EVENTS ---
    function onFilterChange() {
      renderTable();
    }

    function onRankChange() {
      renderTable();
    }

    function onSettingChange() {
      runSolverAndRender();
    }

    function onCrocSliderChange(val) {
      const lvl = parseInt(val, 10);
      const mult = (1.0 + 0.02 * lvl).toFixed(2);
      document.getElementById('crocVal').textContent = 'Lvl ' + lvl + ' (' + mult + 'x)';
      runSolverAndRender();
    }

    function setCrocLevel(lvl) {
      document.getElementById('crocSlider').value = lvl;
      onCrocSliderChange(lvl);
    }

    function toggleMoreOptions() {
      const panel = document.getElementById('moreOptionsPanel');
      panel.classList.toggle('open');
      const text = document.getElementById('moreOptionsText');
      text.textContent = panel.classList.contains('open') ? 'Fewer options ▴' : 'More options ▾';
    }

    function toggleGuide() {
      const content = document.getElementById('guideContent');
      const icon = document.getElementById('guideToggleIcon');
      if (content.style.display === 'grid') {
        content.style.display = 'none';
        icon.textContent = '▾ Show guide';
      } else {
        content.style.display = 'grid';
        icon.textContent = '▴ Hide guide';
      }
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => {
        t.style.display = 'none';
      }, 3000);
    }

    // --- CSV EXPORT ---
    function exportCSV() {
      if (!solverResults) return;
      const items = solverResults.results;

      const headers = [
        'Rank',
        'Shard Name',
        'Product ID',
        'Sell Offer Price',
        'Buy Order Price',
        'Cost to Fuse',
        'Fusion Profit',
        'Instant-Sell Profit',
        'Active Sell Orders',
        'Profitable Buy Depth',
        '7D Volume',
        'Hourly Velocity'
      ];

      const rows = items.map((it, idx) => [
        idx + 1,
        '"' + it.name.replace(/"/g, '""') + '"',
        it.internal_id,
        it.sellOrderPrice === Infinity ? '' : it.sellOrderPrice.toFixed(1),
        it.buyOrderPrice === 0 ? '' : it.buyOrderPrice.toFixed(1),
        it.costToFuse === Infinity ? '' : it.costToFuse.toFixed(2),
        it.fusionProfit === -Infinity ? '' : it.fusionProfit.toFixed(2),
        it.instantProfit === -Infinity ? '' : it.instantProfit.toFixed(2),
        it.activeSellOrders,
        it.profitableBuyDepth,
        Math.round(it.vol7d),
        it.hourlyVelocity
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'skyblock_shard_market_scanner_' + new Date().toISOString().slice(0, 10) + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exported CSV with ' + items.length + ' shards!');
    }

    // --- BOOTSTRAP ---
    window.addEventListener('DOMContentLoaded', () => {
      initializeCatalog();
      fetchLiveBazaarData();
    });
  </script>
</body>
</html>`;

console.log("Writing skyblock_shard_market_scanner.html...");
fs.writeFileSync(outputPath, htmlContent, 'utf8');

const stats = fs.statSync(outputPath);
console.log(`Generated ${outputPath} successfully!`);
console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);
