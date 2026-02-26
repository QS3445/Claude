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
          if (a.getAttribute('href') === '#' + entry.target.id) {
            a.classList.add('active');
          }
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
})();


// === POLLS ===
// Tracks votes per poll in sessionStorage (not persistent — resets on tab close)
window.vote = function vote(btn, pollId) {
  const poll = btn.closest('.poll-widget');
  const buttons = poll.querySelectorAll('.poll-btn');
  const resultEl = document.getElementById(pollId + '-result');

  // Prevent double-voting
  if (poll.dataset.voted) return;
  poll.dataset.voted = '1';

  buttons.forEach(b => {
    b.classList.remove('voted');
    b.disabled = true;
  });
  btn.classList.add('voted');

  // Simulate results with seeded random numbers for reproducibility
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

  if (resultEl) {
    resultEl.innerHTML = `<p class="poll-voted-msg">Thanks for voting! Informal results:</p>${html}`;
  }
};

function generateFakeVotes(n, votedBtn) {
  // Weighted toward the voted option for authenticity
  const raw = [];
  for (let i = 0; i < n; i++) raw.push(5 + Math.floor(Math.random() * 30));
  // Boost the voted button slightly
  const votedIdx = Array.from(votedBtn.parentElement.children).indexOf(votedBtn);
  raw[votedIdx] += 15;
  const sum = raw.reduce((a, b) => a + b, 0);
  const pcts = raw.map(v => Math.round((v / sum) * 100));
  // Fix rounding so they sum to 100
  const diff = 100 - pcts.reduce((a, b) => a + b, 0);
  pcts[0] += diff;
  return pcts;
}


// === SMOOTH SCROLL for internal links ===
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


// === DYNAMIC STYLES for poll results ===
(function injectPollResultStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .poll-voted-msg {
      font-family: var(--sans);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-cnv);
      margin-bottom: 0.4rem;
    }
    .poll-bar {
      margin-bottom: 0.3rem;
      font-size: 0.78rem;
    }
    .poll-bar-label {
      display: block;
      color: var(--ink);
      margin-bottom: 0.05rem;
    }
    .voted-bar .poll-bar-label {
      font-weight: 700;
    }
    .poll-bar-track {
      font-family: var(--mono);
      font-size: 0.75rem;
      color: var(--accent-dnv);
      word-break: break-all;
    }
    .voted-bar .poll-bar-track {
      color: var(--red);
    }
    .nav-link.active {
      background: var(--gold);
      color: var(--ink) !important;
    }
  `;
  document.head.appendChild(style);
})();


// === FUTURE HOOKS (work in progress) ===
// These functions are stubs for planned features.

/**
 * fetchLatestCouncilAgenda(municipality)
 * TODO: Pull live agenda data from municipal APIs when available.
 * @param {string} municipality — 'cnv' | 'dnv' | 'wv'
 */
// function fetchLatestCouncilAgenda(municipality) { /* TODO */ }

/**
 * loadLiveWeather()
 * TODO: Connect to Environment Canada or OpenWeatherMap for live weather.
 */
// function loadLiveWeather() { /* TODO */ }

/**
 * initSearchBar()
 * TODO: Add site-wide article/resource search functionality.
 */
// function initSearchBar() { /* TODO */ }

/**
 * loadRSS(feedUrl, containerId)
 * TODO: Parse and display RSS feeds from nsnews.com, CBC BC, etc.
 */
// function loadRSS(feedUrl, containerId) { /* TODO */ }
