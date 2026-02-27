/* =====================================================
   North Shore Dispatch — Real Estate Charts
   Data: REBGV-style benchmark prices & sales, 2025
   Work in Progress — QS3445/Claude
   ===================================================== */

'use strict';

// ── Monthly labels (Jan–Dec 2025) ──────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Benchmark Prices ($000s) — North Shore 2025 ───────
// Source approximation: REBGV monthly reports, North Shore composite
const DATA = {
  nvDetached:  [2095, 2105, 2145, 2185, 2230, 2195, 2155, 2120, 2100, 2080, 2110, 2130],
  nvAttached:  [1340, 1355, 1385, 1415, 1435, 1425, 1395, 1370, 1350, 1342, 1362, 1375],
  nvApartment: [775,  782,  797,  812,  823,  817,  802,  791,  780,  776,  784,  788],
  wvDetached:  [3710, 3760, 3840, 3920, 3990, 3960, 3890, 3825, 3765, 3745, 3775, 3815],
  // Monthly sales (combined North Shore City + District + West Van)
  sales:       [132,  148,  182,  198,  214,  200,  178,  164,  157,  149,  138,  118]
};

// YoY change labels for each month (approximate % vs 2024)
const YOY_NV = ['-2.1%','-1.8%','+0.3%','+1.2%','+2.4%','+1.9%','+0.8%','+0.1%','-0.5%','-1.1%','+0.4%','+0.7%'];

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
      labels: MONTHS,
      datasets: [
        {
          label: 'Detached — North Van',
          data: DATA.nvDetached,
          borderColor: '#00529b',
          backgroundColor: 'rgba(0,82,155,0.08)',
          borderWidth: 2.5,
          pointRadius: 3,
          tension: 0.35,
          fill: true
        },
        {
          label: 'Detached — West Van',
          data: DATA.wvDetached,
          borderColor: '#8b1a1a',
          backgroundColor: 'rgba(139,26,26,0.06)',
          borderWidth: 2.5,
          pointRadius: 3,
          tension: 0.35,
          fill: false
        },
        {
          label: 'Attached — North Van',
          data: DATA.nvAttached,
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
          data: DATA.nvApartment,
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
          text: 'North Shore Benchmark Prices — Jan to Dec 2025',
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

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: 'Properties Sold — North Shore',
          data: DATA.sales,
          backgroundColor: MONTHS.map((_, i) => {
            // Highlight peak months
            return DATA.sales[i] >= 195 ? 'rgba(0,82,155,0.85)' : 'rgba(0,82,155,0.45)';
          }),
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
          text: 'Monthly Sales Volume — North Shore Combined, 2025',
          font: { size: 13, weight: '700' },
          color: '#1a1a1a',
          padding: { bottom: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => `  ${ctx.parsed.y} sales`,
            afterLabel: ctx => `  YoY: ${YOY_NV[ctx.dataIndex]}`
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
        data: [38, 22, 40],
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
          text: 'Sales Mix by Type — North Van, Dec 2025',
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
