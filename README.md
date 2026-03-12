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

## Table of Contents
- [Features](#features)
- [How to Use](#how-to-use)
- [Data Structure](#data-structure)

## Features
- **Organized:** Outputs parsed data neatly into standalone JSON files.
- **Up-to-date:** Allows you to fetch the latest data from the [Dead by Daylight - Wiki](https://deadbydaylight.fandom.com/wiki/Dead_by_Daylight_Wiki) whenever you need it via a headless Puppeteer browser.
- **No Database Required:** Modified from its original form to write directly to the local filesystem inside the `data/` folder, skipping MongoDB configuration entirely.

## How to Use
1. Install dependencies:
   ```bash
   pnpm install
   # Ensure puppeteer browsers are installed if not done already:
   npx puppeteer browsers install chrome
   ```

2. Run the update script:
   ```bash
   node update.js
   ```

The script will generate 4 files in the `data/` directory:
- `killer_perks.json`
- `survivor_perks.json`
- `killers.json`
- `survivors.json`

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
  }
  ]
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
  }
  ]
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
  }
  ]
}
```
