import fs from "fs";
import { chromium } from "playwright";

/**
 * 1. TRY JSON SOURCE FIRST (FAST + RELIABLE)
 * 2. FALLBACK TO PLAYWRIGHT SCRAPER
 */

const PRIMARY_JSON_SOURCE =
  "https://raw.githubusercontent.com/YOUR_USERNAME/fifa-2026-live-data/main/schedule.json";

async function tryFetchJSON() {
  try {
    const res = await fetch(PRIMARY_JSON_SOURCE);
    if (!res.ok) throw new Error("No JSON feed");
    const data = await res.json();

    if (data?.matches?.length > 10) {
      return data.matches;
    }
  } catch (e) {
    console.log("Primary JSON failed, using scraper...");
  }
  return null;
}

/* ---------------- SCRAPER FALLBACK ---------------- */

async function scrapeWithPlaywright() {
  const browser = await chromium.launch({ headless: true });

  const page = await browser.newPage();

  await page.goto(
    "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/match-schedule",
    { waitUntil: "networkidle" }
  );

  await page.waitForTimeout(8000);

  /**
   * IMPORTANT FIX:
   * We extract ALL visible text blocks and reconstruct matches
   * instead of relying on fragile selectors
   */
  const matches = await page.evaluate(() => {
    const text = document.body.innerText;

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    const results = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // detect teams pattern (very loose but robust)
      if (line.includes(" vs ") || line.includes(" v ")) {
        const parts = line.split(/vs|v/);

        if (parts.length === 2) {
          results.push({
            date: lines[i - 1] || "TBD",
            stage: "Group",
            home: parts[0].trim(),
            away: parts[1].trim(),
            venue: lines[i + 1] || "TBD"
          });
        }
      }
    }

    return results.slice(0, 120);
  });

  await browser.close();

  return matches;
}

/* ---------------- NORMALIZER ---------------- */

function normalize(matches) {
  return matches.map(m => ({
    date: m.date || "TBD",
    stage: m.stage || "Group",
    home: m.home || "TBD",
    away: m.away || "TBD",
    venue: m.venue || "TBD"
  }));
}

/* ---------------- MAIN RUNNER ---------------- */

async function run() {
  let matches = await tryFetchJSON();

  if (!matches) {
    matches = await scrapeWithPlaywright();
  }

  matches = normalize(matches || []);

  const output = {
    updated: new Date().toISOString(),
    total: matches.length,
    source: matches.length ? "live" : "fallback",
    matches
  };

  fs.writeFileSync(
    "data/schedule.json",
    JSON.stringify(output, null, 2)
  );

  console.log(`✅ Updated ${matches.length} matches`);
}

run();
