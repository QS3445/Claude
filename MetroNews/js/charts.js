/* =====================================================
   North Shore Dispatch — Real Estate Charts
   Data: REBGV-style benchmark prices, rolling 12 months
   Source: REBGV monthly statistical reports (approximate)

   TO UPDATE EACH MONTH:
     1. Add a new entry to ALL_DATA below (key: 'YYYY-MM')
     2. Update LATEST_MIX with the new month's sales-type split
   All charts, labels and titles update automatically.
   ===================================================== */

'use strict';

// ── Monthly data — add one entry per month as published ──
// Prices in $000s. Source: REBGV monthly reports (approximate).
// yoy = benchmark price YoY % for North Van Detached
const ALL_DATA = {
  '2025-01': { nvDet: 2095, nvAtt: 1340, nvApt: 775,  wvDet: 3710, sales: 132, yoy: '-2.1%' },
  '2025-02': { nvDet: 2105, nvAtt: 1355, nvApt: 782,  wvDet: 3760, sales: 148, yoy: '-1.8%' },
  '2025-03': { nvDet: 2145, nvAtt: 1385, nvApt: 797,  wvDet: 3840, sales: 182, yoy: '+0.3%' },
  '2025-04': { nvDet: 2185, nvAtt: 1415, nvApt: 812,  wvDet: 3920, sales: 198, yoy: '+1.2%' },
  '2025-05': { nvDet: 2230, nvAtt: 1435, nvApt: 823,  wvDet: 3990, sales: 214, yoy: '+2.4%' },
  '2025-06': { nvDet: 2195, nvAtt: 1425, nvApt: 817,  wvDet: 3960, sales: 200, yoy: '+1.9%' },
  '2025-07': { nvDet: 2155, nvAtt: 1395, nvApt: 802,  wvDet: 3890, sales: 178, yoy: '+0.8%' },
  '2025-08': { nvDet: 2120, nvAtt: 1370, nvApt: 791,  wvDet: 3825, sales: 164, yoy: '+0.1%' },
  '2025-09': { nvDet: 2100, nvAtt: 1350, nvApt: 780,  wvDet: 3765, sales: 157, yoy: '-0.5%' },
  '2025-10': { nvDet: 2080, nvAtt: 1342, nvApt: 776,  wvDet: 3745, sales: 149, yoy: '-1.1%' },
  '2025-11': { nvDet: 2110, nvAtt: 1362, nvApt: 784,  wvDet: 3775, sales: 138, yoy: '+0.4%' },
  '2025-12': { nvDet: 2130, nvAtt: 1375, nvApt: 788,  wvDet: 3815, sales: 118, yoy: '+0.7%' },
  '2026-01': { nvDet: 2145, nvAtt: 1378, nvApt: 790,  wvDet: 3830, sales: 128, yoy: '+2.4%' },
  // '2026-02': { nvDet: ????,  nvAtt: ????,  nvApt: ???,  wvDet: ????, sales: ???, yoy: '???%' },
};

// Sales mix % for latest available month — update alongside ALL_DATA
// [Detached %, Attached/Townhouse %, Apartment/Condo %]
const LATEST_MIX = { pct: [38, 22, 40] };

// ── Derive rolling 12-month window ─────────────────────
const WINDOW   = 12;
const _allKeys = Object.keys(ALL_DATA).sort();
const _keys    = _allKeys.slice(-WINDOW);
const _rows    = _keys.map(k => ALL_DATA[k]);

// Label format: "Mon 'YY" when window spans >1 year, else "Mon"
const _years   = new Set(_keys.map(k => k.slice(0, 4)));
const _MON     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function monthLabel(key) {
  const [yr, mo] = key.split('-');
  const name = _MON[+mo - 1];
  return _years.size > 1 ? `${name} '${yr.slice(2)}` : name;
}

const LABELS      = _keys.map(monthLabel);
const firstLabel  = LABELS[0];
const lastLabel   = LABELS[LABELS.length - 1];

// Data arrays
const nvDetached  = _rows.map(r => r.nvDet);
const nvAttached  = _rows.map(r => r.nvAtt);
const nvApartment = _rows.map(r => r.nvApt);
const wvDetached  = _rows.map(r => r.wvDet);
const sales       = _rows.map(r => r.sales);
const yoyLabels   = _rows.map(r => r.yoy);

// ── Chart defaults ─────────────────────────────────────
Chart.defaults.font.family = "'Helvetica Neue', Arial, sans-serif";
Chart.defaults.font.size   = 11;
Chart.defaults.color       = '#444';

// ── Tooltip currency formatter ─────────────────────────
function fmtPrice(val) {
  return '$' + (val >= 1000 ? (val / 1000).toFixed(2) + 'M' : val + 'K');
}

// ── 1. Benchmark Price Trends (line chart) ─────────────
function initPriceChart() {
  const canvas = document.getElementById('chart-prices');
  if (!canvas) return;

  new Chart(canvas, {
    type: 'line',
    data: {
      labels: LABELS,
      datasets: [
        {
          label: 'Detached — North Van',
          data: nvDetached,
          borderColor: '#00529b',
          backgroundColor: 'rgba(0,82,155,0.08)',
          borderWidth: 2.5,
          pointRadius: 3,
          tension: 0.35,
          fill: true
        },
        {
          label: 'Detached — West Van',
          data: wvDetached,
          borderColor: '#8b1a1a',
          backgroundColor: 'rgba(139,26,26,0.06)',
          borderWidth: 2.5,
          pointRadius: 3,
          tension: 0.35,
          fill: false
        },
        {
          label: 'Attached — North Van',
          data: nvAttached,
          borderColor: '#2a7a3b',
          backgroundColor: 'rgba(42,122,59,0.07)',
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.35,
          borderDash: [6, 3],
          fill: false
        },
        {
          label: 'Apartment — North Van',
          data: nvApartment,
          borderColor: '#c8992a',
          backgroundColor: 'rgba(200,153,42,0.07)',
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.35,
          borderDash: [3, 3],
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 14, padding: 14 }
        },
        tooltip: {
          callbacks: {
            label: ctx => `  ${ctx.dataset.label}: ${fmtPrice(ctx.parsed.y)}`
          }
        },
        title: {
          display: true,
          text: `North Shore Benchmark Prices — ${firstLabel} to ${lastLabel}`,
          font: { size: 13, weight: '700' },
          color: '#1a1a1a',
          padding: { bottom: 12 }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: val => fmtPrice(val)
          },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// ── 2. Monthly Sales Volume (bar chart) ───────────────
function initSalesChart() {
  const canvas = document.getElementById('chart-sales');
  if (!canvas) return;

  const peakSales = Math.max(...sales);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: LABELS,
      datasets: [
        {
          label: 'Properties Sold — North Shore',
          data: sales,
          backgroundColor: sales.map(v => v >= peakSales * 0.9 ? 'rgba(0,82,155,0.85)' : 'rgba(0,82,155,0.45)'),
          borderColor: '#00529b',
          borderWidth: 1.5,
          borderRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Monthly Sales Volume — North Shore, ${firstLabel} to ${lastLabel}`,
          font: { size: 13, weight: '700' },
          color: '#1a1a1a',
          padding: { bottom: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => `  ${ctx.parsed.y} sales`,
            afterLabel: ctx => `  YoY: ${yoyLabels[ctx.dataIndex]}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 250,
          ticks: { stepSize: 50 },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

// ── 3. Market Snapshot donut (current mix) ────────────
function initMixChart() {
  const canvas = document.getElementById('chart-mix');
  if (!canvas) return;

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Detached', 'Attached / Townhouse', 'Apartment / Condo'],
      datasets: [{
        data: LATEST_MIX.pct,
        backgroundColor: ['#00529b', '#2a7a3b', '#c8992a'],
        borderColor: '#faf8f3',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 12 }
        },
        title: {
          display: true,
          text: `Sales Mix by Type — North Van, ${lastLabel}`,
          font: { size: 12, weight: '700' },
          color: '#1a1a1a',
          padding: { bottom: 10 }
        },
        tooltip: {
          callbacks: {
            label: ctx => `  ${ctx.label}: ${ctx.parsed}%`
          }
        }
      }
    }
  });
}

// ── Init all charts on DOM ready ──────────────────────
document.addEventListener('DOMContentLoaded', function () {
  initPriceChart();
  initSalesChart();
  initMixChart();
});
