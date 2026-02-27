# QS3445/Claude

This repository contains two things:

1. **Repository guidance** — `CLAUDE.md` provides conventions and workflows for AI assistants working here.
2. **MetroNews** — a Vancouver North Shore community newspaper project (see below).

---

## MetroNews

**Location:** [`MetroNews/`](MetroNews/)

A static HTML community newspaper covering North & West Vancouver, BC.
Open `MetroNews/index.html` in a browser to run locally — no build step required.

### Features
- Breaking news ticker, masthead, sticky navigation
- **Live weather** at 3445 Princess Ave, North Vancouver (wttr.in API)
- **Live RSS news feeds** — CBC BC, Global BC, Vancouver Sun
- **Site-wide search** across all articles and resources
- **Real estate charts** — Chart.js benchmark price and sales data
- **Council & Reports** — CNV, DNV, West Van meeting schedules
- **City Statistics** — population, income, housing (StatCan 2021)
- **Opinion & Polls** — community polls and letters to the editor
- **Video section** — curated links to council livestreams and news broadcasts
- **Neighbourhood pages** — Lonsdale, Deep Cove, Edgemont, Dundarave, Horseshoe Bay

### File Structure
```
MetroNews/
├── index.html               # Main newspaper page
├── css/
│   └── newspaper.css        # All styles (print-inspired, responsive)
├── js/
│   ├── app.js               # Weather, RSS feeds, search, polls
│   └── charts.js            # Chart.js real estate charts
└── neighbourhoods/
    ├── lonsdale.html
    ├── deep-cove.html
    ├── edgemont.html
    ├── dundarave.html
    └── horseshoe-bay.html
```

### Roadmap (work in progress)
- [ ] Add real photos to neighbourhood cards
- [ ] More neighbourhood pages (Lynn Valley, Capilano, British Properties…)
- [ ] Live council agenda integration
- [ ] Weather station data (Env. Canada API)
- [ ] Comments / community submission form
- [ ] Mobile-optimised navigation

---

*See `CLAUDE.md` for AI assistant conventions and git workflow.*
