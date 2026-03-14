<h1 align="center">Dead by Daylight - Database (JSON Scraper)</h1>

<div align="center">
  Fetches new information from the <a href="https://deadbydaylight.fandom.com/wiki/Dead_by_Daylight_Wiki">Dead by Daylight - Wiki</a> and outputs to local JSON files.
</div>

<br />

<div align="center">
  <sub>Originally built with ❤︎ by
  <a href="https://github.com/Techial">Techial</a> and
  <a href="https://github.com/Techial/DBD-Database/graphs/contributors">
    contributors
  </a>
</div>

---

> **⚠️ Merged into chaoticshuffle**
>
> The scraper scripts from this directory have been moved into the `chaoticshuffle` Worker project at `chaoticshuffle/scripts/`.  
> All future work on the scraper should happen there.
>
> **New location:** `d:\Cloudflare\chaoticshuffle\scripts\`  
> **New docs:** [`chaoticshuffle/scripts/README.md`](../chaoticshuffle/scripts/README.md)

---

## New Workflow (from `chaoticshuffle/`)

```bash
# Install deps
pnpm install

# Install Puppeteer's Chrome binary (first time only)
npx puppeteer browsers install chrome

# Scrape wiki + generate SQL seed in one step
pnpm scrape
```

This produces `data/` JSON files and `database_seed.sql` in the `chaoticshuffle/` root.

### Apply seed to D1

```bash
# Local dev
wrangler d1 execute chaoticshuffle-db --local --file=./database_seed.sql

# Production
wrangler d1 execute chaoticshuffle-db --remote --file=./database_seed.sql
```

---

## Legacy Reference

The original standalone workflow (before the merge) used to be:

```bash
# (in DBD-Database/)
pnpm install
node update.js        # → data/*.json
node generate_seed.js # → database_seed.sql
```

This folder is retained for historical reference only.

---

## Data Structure

Perks (`killer_perks.json`, `survivor_perks.json`):
```json
{
  "perks": [{
    "URIName": "URL safe string (name of perk)",
    "name": "Perk display name (With space and all characters)",
    "iconURL": "Perk icon URL",
    "content": "Display text (with HTML elements) scraped from the wiki",
    "contentText": "Same as `content` without HTML elements",
    "characterName": "Name of Character perk belongs to (Omitted if general perk)",
    "character": "URIName of Character perk belongs to (Omitted if general perk)"
  }]
}
```

Survivors (`survivors.json`):
```json
{
  "survivors": [{
    "name": "Character display name (With space and all characters)",
    "URIName": "URL safe string (name of survivor)",
    "iconURL": "Character image URL",
    "link": "Character URL at https://deadbydaylight.fandom.com/"
  }]
}
```

Killers (`killers.json`):
```json
{
  "killers": [{
    "name": "Full Character name (With space and all characters)",
    "killerName": "Short name used in-game (e.g Trapper, Wraith etc)",
    "URIName": "URL safe string (name of Killer)",
    "iconURL": "Character image URL",
    "link": "Character URL at https://deadbydaylight.fandom.com/"
  }]
}
```
