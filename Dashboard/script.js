/* ════════════════════════════════════════════════
   LUMINA ANALYTICS DASHBOARD — script.js
   Handles: Charts, Table, Sidebar, Refresh, Toast
   ════════════════════════════════════════════════ */

// ── Helpers ──────────────────────────────────────

/** Format a number as currency string */
const fmtCurrency = n =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0 });

/** Format a plain number with commas */
const fmtNum = n => n.toLocaleString('en-US');

/** Return a random int in [min, max] */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Show a toast notification */
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Chart.js Global Defaults ──────────────────────

Chart.defaults.color = '#8b91a7';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
Chart.defaults.font.family = "'DM Sans', sans-serif";
Chart.defaults.plugins.legend.display = false;
Chart.defaults.plugins.tooltip.backgroundColor = '#1a1e2a';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.titleColor = '#e8eaf0';
Chart.defaults.plugins.tooltip.bodyColor = '#8b91a7';

// ── Mock Data ─────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// 12 months of revenue data
const baseRevenue = [41200,38900,52400,47800,61200,58900,72400,68100,79800,76500,84254,90100];

// 12 months of sales units
const baseSales = [310,290,420,380,490,465,540,510,590,570,610,648];

// Traffic sources
const trafficData = {
  labels: ['Organic', 'Direct', 'Referral', 'Social', 'Email'],
  values: [34, 26, 18, 14, 8],
  colors: ['#6c63ff','#00d4b1','#ff5e7d','#ffb900','#4db8ff']
};

// Transactions table data
const transactions = [
  { name:'Jordan Lee',   email:'j.lee@mail.com',  date:'May 1, 2025',  amount:4320, channel:'Stripe',  status:'completed' },
  { name:'Priya Kapoor', email:'priya@acme.io',   date:'Apr 30, 2025', amount:1850, channel:'PayPal',  status:'completed' },
  { name:'Marcus Webb',  email:'m.webb@corp.com', date:'Apr 29, 2025', amount:7200, channel:'Wire',    status:'pending'   },
  { name:'Sofia Reyes',  email:'sofia@biz.mx',    date:'Apr 28, 2025', amount: 960, channel:'Stripe',  status:'completed' },
  { name:'Liam Chen',    email:'l.chen@dev.io',   date:'Apr 27, 2025', amount:3540, channel:'Crypto',  status:'failed'    },
  { name:'Amara Diallo', email:'amara@ng.co',     date:'Apr 26, 2025', amount:2100, channel:'PayPal',  status:'completed' },
  { name:'Nico Brandt',  email:'nico@eur.de',     date:'Apr 25, 2025', amount:5680, channel:'Stripe',  status:'pending'   },
  { name:'Yuki Tanaka',  email:'yuki@jp.co',      date:'Apr 24, 2025', amount:1230, channel:'Stripe',  status:'completed' },
];

// Sparkline mini-data sets
function miniData(base, points = 10) {
  return Array.from({ length: points }, (_, i) =>
    base * (0.75 + 0.3 * Math.sin(i / 2)) + rand(-base * 0.05, base * 0.05)
  );
}

// ── KPI Cards ─────────────────────────────────────

const kpiState = {
  revenue: { val: 84254,  pct: '+12.4%' },
  users:   { val: 24891,  pct: '+8.1%'  },
  sales:   { val: 3482,   pct: '-3.2%'  },
  growth:  { val: '18.6%',pct: '+2.3pp' },
};

function renderKPI() {
  document.getElementById('revenue-val').textContent = fmtCurrency(kpiState.revenue.val);
  document.getElementById('revenue-pct').textContent = kpiState.revenue.pct;
  document.getElementById('users-val').textContent   = fmtNum(kpiState.users.val);
  document.getElementById('users-pct').textContent   = kpiState.users.pct;
  document.getElementById('sales-val').textContent   = fmtNum(kpiState.sales.val);
  document.getElementById('sales-pct').textContent   = kpiState.sales.pct;
  document.getElementById('growth-val').textContent  = kpiState.growth.val;
  document.getElementById('growth-pct').textContent  = kpiState.growth.pct;
}

// ── Sparklines ────────────────────────────────────

function createSparkline(canvasId, data, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_,i) => i),
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 1.5,
        tension: 0.45,
        fill: true,
        backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
        pointRadius: 0,
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 600 },
      scales: { x: { display: false }, y: { display: false } },
      plugins: { tooltip: { enabled: false } },
    }
  });
}

const sparks = {};

function initSparklines() {
  sparks.revenue = createSparkline('sparkRevenue', miniData(84254, 12), '#6c63ff');
  sparks.users   = createSparkline('sparkUsers',   miniData(24891, 12), '#00d4b1');
  sparks.sales   = createSparkline('sparkSales',   miniData(3482,  12), '#ff5e7d');
  sparks.growth  = createSparkline('sparkGrowth',  miniData(18.6,  12), '#ffb900');
}

function updateSparklines() {
  Object.values(sparks).forEach(s => {
    s.data.datasets[0].data = s.data.datasets[0].data.map(v =>
      Math.max(0, v * (0.92 + Math.random() * 0.16))
    );
    s.update();
  });
}

// ── Line Chart (Revenue) ──────────────────────────

let lineChart;

function buildLineGradient(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(108,99,255,0.35)');
  gradient.addColorStop(1, 'rgba(108,99,255,0)');
  return gradient;
}

function initLineChart() {
  const ctx = document.getElementById('lineChart').getContext('2d');
  const gradient = buildLineGradient(ctx);

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [{
        label: 'Revenue',
        data: baseRevenue,
        borderColor: '#6c63ff',
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        backgroundColor: gradient,
        pointBackgroundColor: '#6c63ff',
        pointBorderColor: '#1a1e2a',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeInOutCubic' },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            font: { size: 11 },
            callback: v => '$' + (v / 1000).toFixed(0) + 'k',
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => '  Revenue: ' + fmtCurrency(ctx.raw),
          }
        }
      }
    }
  });
}

/** Update line chart with a time-range filter */
function updateLineChart(range) {
  let count = 12;
  if (range === '6m') count = 6;
  else if (range === '1y') count = 12;
  else count = 12; // 'all' – same in this demo

  lineChart.data.labels = MONTHS.slice(-count);
  lineChart.data.datasets[0].data = baseRevenue.slice(-count);
  lineChart.update();
}

// ── Bar Chart (Sales) ─────────────────────────────

let barChart;

function initBarChart() {
  const ctx = document.getElementById('barChart').getContext('2d');
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [{
        label: 'Sales',
        data: baseSales,
        backgroundColor: MONTHS.map((_, i) =>
          i === MONTHS.length - 2
            ? '#6c63ff'
            : 'rgba(108,99,255,0.25)'
        ),
        borderColor: MONTHS.map((_, i) =>
          i === MONTHS.length - 2 ? '#6c63ff' : 'rgba(108,99,255,0.5)'
        ),
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: '#8a82ff',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeInOutCubic' },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { font: { size: 11 } }
        }
      },
      plugins: {
        tooltip: {
          callbacks: { label: ctx => '  Units: ' + fmtNum(ctx.raw) }
        }
      }
    }
  });
}

// ── Doughnut Chart (Traffic) ──────────────────────

let doughnutChart;

function initDoughnutChart() {
  const ctx = document.getElementById('doughnutChart').getContext('2d');
  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: trafficData.labels,
      datasets: [{
        data: trafficData.values,
        backgroundColor: trafficData.colors.map(c => c + '99'),
        borderColor: trafficData.colors,
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '72%',
      animation: { duration: 900 },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `  ${ctx.label}: ${ctx.raw}%`
          }
        }
      }
    }
  });

  // Build custom legend
  const legend = document.getElementById('doughnut-legend');
  trafficData.labels.forEach((label, i) => {
    const li = document.createElement('li');
    li.classList.add('legend-item');
    li.innerHTML = `
      <span class="legend-label">
        <span class="legend-dot" style="background:${trafficData.colors[i]}"></span>
        ${label}
      </span>
      <span class="legend-pct">${trafficData.values[i]}%</span>
    `;
    legend.appendChild(li);
  });
}

// ── Transactions Table ────────────────────────────

function renderTable(data) {
  const tbody = document.getElementById('txTable');
  tbody.innerHTML = '';

  data.forEach((tx, i) => {
    const seed = encodeURIComponent(tx.name.toLowerCase().replace(' ', ''));
    const row = document.createElement('tr');
    row.style.animationDelay = `${i * 0.04}s`;
    row.innerHTML = `
      <td>
        <div class="customer-cell">
          <img class="customer-avatar"
               src="https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9"
               alt="${tx.name}" />
          <div>
            <div class="customer-name">${tx.name}</div>
            <div class="customer-email">${tx.email}</div>
          </div>
        </div>
      </td>
      <td>${tx.date}</td>
      <td class="amount">${fmtCurrency(tx.amount)}</td>
      <td>${tx.channel}</td>
      <td><span class="status status--${tx.status}">${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</span></td>
    `;
    tbody.appendChild(row);
  });
}

// ── Sidebar Toggle ────────────────────────────────

function initSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburgerBtn');

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener('click', closeSidebar);

  // Nav link active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(li => li.classList.remove('active'));
      link.closest('.nav-item').classList.add('active');
      const page = link.dataset.page;
      document.querySelector('.topbar__title h1').textContent =
        page.charAt(0).toUpperCase() + page.slice(1);
      if (window.innerWidth <= 720) closeSidebar();
    });
  });
}

// ── Range Chips (line chart) ──────────────────────

function initChips() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      updateLineChart(chip.dataset.range);
    });
  });
}

// ── Refresh Button (simulate live data) ──────────

function initRefresh() {
  const btn = document.getElementById('refreshBtn');

  btn.addEventListener('click', () => {
    btn.classList.add('spinning');
    setTimeout(() => btn.classList.remove('spinning'), 620);

    // Mutate KPI values slightly
    kpiState.revenue.val = rand(80000, 92000);
    kpiState.users.val   = rand(23000, 27000);
    kpiState.sales.val   = rand(3100, 3900);
    const g = (15 + Math.random() * 8).toFixed(1);
    kpiState.growth.val  = g + '%';

    renderKPI();
    updateSparklines();

    // Randomise line chart data
    lineChart.data.datasets[0].data = baseRevenue.map(v =>
      Math.round(v * (0.88 + Math.random() * 0.24))
    );
    lineChart.update();

    // Randomise bar chart data
    barChart.data.datasets[0].data = baseSales.map(v =>
      Math.round(v * (0.85 + Math.random() * 0.3))
    );
    barChart.update();

    showToast('✨  Dashboard refreshed with latest data');
  });
}

// ── Notifications Badge ───────────────────────────

function initNotifications() {
  const btn = document.getElementById('notifBtn');
  const badge = document.getElementById('notifBadge');
  let count = 3;

  btn.addEventListener('click', () => {
    count = 0;
    badge.textContent = count;
    badge.style.opacity = '0';
    showToast('🔔  All notifications cleared');
  });
}

// ── Search ────────────────────────────────────────

function initSearch() {
  const input = document.getElementById('searchInput');
  let debounce;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim().toLowerCase();

    debounce = setTimeout(() => {
      if (!q) {
        renderTable(transactions);
        return;
      }
      const filtered = transactions.filter(tx =>
        tx.name.toLowerCase().includes(q) ||
        tx.email.toLowerCase().includes(q) ||
        tx.channel.toLowerCase().includes(q) ||
        tx.status.toLowerCase().includes(q)
      );
      renderTable(filtered);
      if (filtered.length === 0) {
        document.getElementById('txTable').innerHTML =
          '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px;">No results found.</td></tr>';
      }
    }, 250);
  });
}

// ── Export CSV ────────────────────────────────────

function initExport() {
  document.getElementById('exportBtn').addEventListener('click', () => {
    const header = ['Customer','Email','Date','Amount','Channel','Status'];
    const rows = transactions.map(tx =>
      [tx.name, tx.email, tx.date, '$' + tx.amount, tx.channel, tx.status]
    );
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'lumina-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥  CSV exported successfully');
  });
}

// ── Init Everything ───────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderKPI();
  initSparklines();
  initLineChart();
  initBarChart();
  initDoughnutChart();
  renderTable(transactions);
  initSidebar();
  initChips();
  initRefresh();
  initNotifications();
  initSearch();
  initExport();
});