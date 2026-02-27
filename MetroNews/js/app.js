/* =====================================================
   North Shore Dispatch — App JavaScript
   Work in Progress — QS3445/Claude
   ===================================================== */

'use strict';

// === LIVE DATE ===
(function setLiveDate() {
  const el = document.getElementById('live-date');
  if (!el) return;
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = now.toLocaleDateString('en-CA', opts);
})();


// === NAV HIGHLIGHT ON SCROLL ===
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + entry.target.id) a.classList.add('active');
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(s => observer.observe(s));
})();


// === POLLS ===
window.vote = function vote(btn, pollId) {
  const poll = btn.closest('.poll-widget');
  const buttons = poll.querySelectorAll('.poll-btn');
  const resultEl = document.getElementById(pollId + '-result');
  if (poll.dataset.voted) return;
  poll.dataset.voted = '1';
  buttons.forEach(b => { b.classList.remove('voted'); b.disabled = true; });
  btn.classList.add('voted');
  const totals = generateFakeVotes(buttons.length, btn);
  let html = '';
  buttons.forEach((b, i) => {
    const pct = totals[i];
    const bar = '█'.repeat(Math.round(pct / 5));
    const isVoted = b === btn;
    html += `<div class="poll-bar ${isVoted ? 'voted-bar' : ''}">
      <span class="poll-bar-label">${b.textContent.trim()}</span>
      <span class="poll-bar-track">${bar} <strong>${pct}%</strong></span>
    </div>`;
  });
  if (resultEl) resultEl.innerHTML = `<p class="poll-voted-msg">Thanks for voting! Informal results:</p>${html}`;
};

function generateFakeVotes(n, votedBtn) {
  const raw = [];
  for (let i = 0; i < n; i++) raw.push(5 + Math.floor(Math.random() * 30));
  const votedIdx = Array.from(votedBtn.parentElement.children).indexOf(votedBtn);
  raw[votedIdx] += 15;
  const sum = raw.reduce((a, b) => a + b, 0);
  const pcts = raw.map(v => Math.round((v / sum) * 100));
  const diff = 100 - pcts.reduce((a, b) => a + b, 0);
  pcts[0] += diff;
  return pcts;
}


// === SMOOTH SCROLL ===
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


// === DYNAMIC STYLES ===
(function injectDynamicStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .poll-voted-msg { font-family:var(--sans); font-size:0.75rem; font-weight:700;
      text-transform:uppercase; letter-spacing:0.05em; color:var(--accent-cnv); margin-bottom:0.4rem; }
    .poll-bar { margin-bottom:0.3rem; font-size:0.78rem; }
    .poll-bar-label { display:block; color:var(--ink); margin-bottom:0.05rem; }
    .voted-bar .poll-bar-label { font-weight:700; }
    .poll-bar-track { font-family:var(--mono); font-size:0.75rem; color:var(--accent-dnv); word-break:break-all; }
    .voted-bar .poll-bar-track { color:var(--red); }
    .nav-link.active { background:var(--gold); color:var(--ink) !important; }
  `;
  document.head.appendChild(style);
})();


// =====================================================
// === 1. LIVE WEATHER — wttr.in API               ===
// === Location: 3445 Princess Ave, North Vancouver ===
// =====================================================

const WX_CODE_ICON = {
  113:'☀️', 116:'⛅', 119:'☁️', 122:'☁️',
  143:'🌫️', 248:'🌫️', 260:'🌫️',
  176:'🌦️', 263:'🌦️', 266:'🌦️', 293:'🌦️', 296:'🌦️',
  299:'🌧️', 302:'🌧️', 305:'🌧️', 308:'🌧️', 311:'🌧️', 314:'🌧️',
  317:'🌨️', 320:'🌨️', 362:'🌨️', 365:'🌨️', 374:'🌨️', 377:'🌨️',
  323:'❄️', 326:'❄️', 329:'❄️', 332:'❄️', 335:'❄️', 338:'❄️', 371:'❄️',
  200:'⛈️', 386:'⛈️', 389:'⛈️', 392:'⛈️', 395:'⛈️',
  359:'🌧️', 356:'🌧️', 353:'🌦️'
};

function wxIcon(code) {
  return WX_CODE_ICON[parseInt(code)] || '🌡️';
}

async function loadLiveWeather() {
  const widget = document.getElementById('weather-widget');
  if (!widget) return;

  // wttr.in geocodes addresses accurately — Princess Ave, North Van
  const url = 'https://wttr.in/3445+Princess+Ave+North+Vancouver+BC?format=j1';

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    const cur = data.current_condition[0];
    const today = data.weather[0];
    const tomorrow = data.weather[1];

    const tempC   = cur.temp_C;
    const feelsC  = cur.FeelsLikeC;
    const desc    = cur.weatherDesc[0].value;
    const humid   = cur.humidity;
    const windKph = cur.windspeedKmph;
    const windDir = cur.winddir16Point;
    const code    = cur.weatherCode;
    const icon    = wxIcon(code);

    const hiC  = today.maxtempC;
    const loC  = today.mintempC;
    const hi2  = tomorrow.maxtempC;
    const lo2  = tomorrow.mintempC;
    const icon2 = wxIcon(tomorrow.hourly[4]?.weatherCode || 116);

    widget.innerHTML = `
      <div class="wx-current">
        <span class="wx-icon">${icon}</span>
        <span class="wx-temp">${tempC}&deg;C</span>
        <span class="wx-desc">${desc}</span>
      </div>
      <div class="wx-details">
        Feels ${feelsC}&deg; &bull; H:${hiC}&deg; L:${loC}&deg; &bull; ${windDir} ${windKph}km/h &bull; Hum ${humid}%
      </div>
      <div class="wx-tomorrow">Tomorrow ${icon2} H:${hi2}&deg; L:${lo2}&deg;</div>
      <div class="wx-location">&#128205; 3445 Princess Ave, North Van</div>
    `;
  } catch (err) {
    // Graceful fallback — show static placeholder
    widget.innerHTML = `
      <div class="wx-current">
        <span class="wx-icon">⛅</span>
        <span class="wx-temp">—&deg;C</span>
        <span class="wx-desc">North Van</span>
      </div>
      <div class="wx-details">Weather unavailable &mdash; <a href="https://weather.gc.ca/city/pages/bc-74_metric_e.html" target="_blank" rel="noopener">Env. Canada &#8599;</a></div>
      <div class="wx-location">&#128205; 3445 Princess Ave, North Van</div>
    `;
  }
}


// =====================================================
// === 2. RSS NEWS FEEDS — via rss2json.com        ===
// =====================================================

const RSS_FEEDS = [
  {
    label: 'CBC BC',
    color: '#cc0000',
    url: 'https://www.cbc.ca/cmlink/rss-canada-britishcolumbia'
  },
  {
    label: 'Global BC',
    color: '#003da5',
    url: 'https://globalnews.ca/bc/feed/'
  },
  {
    label: 'Vancouver Sun',
    color: '#1a1a1a',
    url: 'https://vancouversun.com/feed'
  }
];

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?count=5&rss_url=';

async function loadRSSFeeds() {
  const container = document.getElementById('rss-feed-container');
  if (!container) return;

  container.innerHTML = '<p class="rss-loading">Fetching latest headlines&#8230;</p>';

  const results = await Promise.allSettled(
    RSS_FEEDS.map(feed =>
      fetch(RSS2JSON + encodeURIComponent(feed.url))
        .then(r => r.json())
        .then(data => ({ feed, data }))
    )
  );

  let html = '<div class="rss-grid">';
  let anySuccess = false;

  results.forEach(result => {
    if (result.status !== 'fulfilled') return;
    const { feed, data } = result.value;
    if (data.status !== 'ok' || !data.items?.length) return;
    anySuccess = true;

    const items = data.items.slice(0, 5);
    html += `<div class="rss-column">
      <div class="rss-col-header" style="border-color:${feed.color}">
        <span class="rss-source-dot" style="background:${feed.color}"></span>
        <span class="rss-source-name">${feed.label}</span>
        <span class="rss-live-badge">LIVE</span>
      </div>
      <ul class="rss-list">`;

    items.forEach(item => {
      const date = item.pubDate
        ? new Date(item.pubDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
        : '';
      const title = item.title.replace(/<[^>]+>/g, '').trim();
      html += `<li class="rss-item">
        <a href="${item.link}" target="_blank" rel="noopener">${title}</a>
        ${date ? `<span class="rss-date">${date}</span>` : ''}
      </li>`;
    });

    html += `</ul></div>`;
  });

  html += '</div>';

  if (!anySuccess) {
    html = `<div class="rss-fallback">
      <p>Live feeds temporarily unavailable. Visit directly:</p>
      <ul>
        <li><a href="https://www.cbc.ca/news/canada/british-columbia" target="_blank" rel="noopener">CBC BC News &#8599;</a></li>
        <li><a href="https://globalnews.ca/bc/" target="_blank" rel="noopener">Global BC &#8599;</a></li>
        <li><a href="https://www.nsnews.com" target="_blank" rel="noopener">North Shore News &#8599;</a></li>
      </ul>
    </div>`;
  }

  container.innerHTML = html + `<p class="rss-timestamp">Fetched: ${new Date().toLocaleTimeString('en-CA')}</p>`;
}


// =====================================================
// === 3. SITE-WIDE SEARCH                         ===
// =====================================================

window.toggleSearch = function toggleSearch() {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;
  const isHidden = overlay.style.display === 'none' || !overlay.style.display;
  overlay.style.display = isHidden ? 'block' : 'none';
  if (isHidden) {
    const inp = document.getElementById('search-input');
    if (inp) { inp.focus(); inp.value = ''; }
    renderSearchResults('');
  }
};

window.onSearchKey = function onSearchKey(e) {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('search-overlay');
    if (overlay) overlay.style.display = 'none';
  }
  renderSearchResults(e.target.value);
};

function buildSearchIndex() {
  const index = [];
  // Index all article cards
  document.querySelectorAll('article.card').forEach(card => {
    const heading = card.querySelector('h3, h4');
    const tag     = card.querySelector('.card-tag');
    const para    = card.querySelector('p:not(.byline)');
    const section = card.closest('section');
    if (!heading) return;
    index.push({
      title:   heading.textContent.trim(),
      tag:     tag ? tag.textContent.trim() : '',
      snippet: para ? para.textContent.trim().slice(0, 120) + '…' : '',
      anchor:  section ? '#' + section.id : '#',
      el:      heading
    });
  });
  // Index resource links
  document.querySelectorAll('.link-category a').forEach(a => {
    const cat = a.closest('.link-category')?.querySelector('h3');
    index.push({
      title:   a.textContent.trim(),
      tag:     cat ? cat.textContent.trim() : 'Resource',
      snippet: '',
      anchor:  a.href,
      el:      a,
      isExternal: true
    });
  });
  return index;
}

let _searchIndex = null;

function renderSearchResults(query) {
  const box = document.getElementById('search-results');
  if (!box) return;

  if (!query || query.trim().length < 2) {
    box.innerHTML = '<p class="search-hint">Type at least 2 characters to search articles, stats, resources, and more.</p>';
    return;
  }

  if (!_searchIndex) _searchIndex = buildSearchIndex();

  const q = query.toLowerCase().trim();
  const hits = _searchIndex.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.tag.toLowerCase().includes(q) ||
    item.snippet.toLowerCase().includes(q)
  );

  if (!hits.length) {
    box.innerHTML = `<p class="search-hint">No results for "<strong>${query}</strong>".</p>`;
    return;
  }

  box.innerHTML = hits.slice(0, 12).map(h => `
    <a class="search-result-item ${h.isExternal ? 'is-external' : ''}"
       href="${h.anchor}"
       target="${h.isExternal ? '_blank' : '_self'}"
       rel="${h.isExternal ? 'noopener' : ''}"
       onclick="document.getElementById('search-overlay').style.display='none'">
      ${h.tag ? `<span class="sr-tag">${h.tag}</span>` : ''}
      <span class="sr-title">${highlight(h.title, q)}</span>
      ${h.snippet ? `<span class="sr-snippet">${highlight(h.snippet, q)}</span>` : ''}
    </a>
  `).join('');
}

function highlight(text, q) {
  if (!q) return text;
  const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

// Initialise on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  loadLiveWeather();
  loadRSSFeeds();
  // Render empty search state
  renderSearchResults('');
});
