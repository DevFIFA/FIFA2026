import fs from "fs";
import { chromium } from "playwright";

const URL =
  "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/match-schedule";

async function scrape() {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  await page.goto(URL, {
    waitUntil: "networkidle"
  });

  // Wait for content to load (important for JS-heavy sites)
  await page.waitForTimeout(5000);

  const matches = await page.evaluate(() => {
    const rows = [];

    // Try to locate match cards/tables dynamically
    const elements = document.querySelectorAll("tr, .match, .fixture, article");

    elements.forEach(el => {
      const text = el.innerText;

      if (!text || text.length < 10) return;

      // very flexible extraction
      const parts = text.split("\n").map(t => t.trim());

      if (parts.length >= 3) {
        rows.push({
          raw: text,
          date: parts[0] || "TBD",
          stage: "Group",
          home: parts[1] || "TBD",
          away: parts[2] || "TBD",
          venue: parts[3] || "TBD"
        });
      }
    });

    return rows.slice(0, 120); // FIFA WC max ~104 matches
  });

  await browser.close();

  const output = {
    updated: new Date().toISOString(),
    source: URL,
    matches
  };

  fs.writeFileSync(
    "data/schedule.json",
    JSON.stringify(output, null, 2)
  );

  console.log(`Scraped ${matches.length} matches`);
}

scrape();
