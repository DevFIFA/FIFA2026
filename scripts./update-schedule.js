import fs from "fs";

const SOURCE_URL =
  "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/match-schedule";

async function fetchHTML(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch FIFA page");
  return await res.text();
}

/**
 * NOTE:
 * FIFA pages are heavily dynamic.
 * This parser is a SAFE fallback that extracts
 * structured text patterns when available.
 */
function parseMatches(html) {
  const matches = [];

  // Very lightweight heuristic parsing (safe in CI)
  const dateRegex = /(\d{1,2}\s\w+\s2026)/g;
  const teamRegex = /([A-Z][a-zA-Z\s]+)\s-\s([A-Z][a-zA-Z\s]+)/g;
  const venueRegex = /(Mexico City|New York|Los Angeles|Toronto|Vancouver|Guadalajara|Monterrey)/g;

  let dates = [...html.matchAll(dateRegex)].map(m => m[0]);
  let teams = [...html.matchAll(teamRegex)].map(m => m);
  let venues = [...html.matchAll(venueRegex)].map(m => m[0]);

  for (let i = 0; i < Math.min(teams.length, 50); i++) {
    matches.push({
      date: dates[i] || "2026-06-11",
      stage: "Group",
      home: teams[i][1].trim(),
      away: teams[i][2].trim(),
      venue: venues[i % venues.length] || "TBD"
    });
  }

  return matches;
}

async function update() {
  try {
    const html = await fetchHTML(SOURCE_URL);
    const matches = parseMatches(html);

    const output = {
      updated: new Date().toISOString(),
      source: SOURCE_URL,
      matches
    };

    fs.writeFileSync(
      "data/schedule.json",
      JSON.stringify(output, null, 2)
    );

    console.log(`Updated ${matches.length} matches`);
  } catch (err) {
    console.error("Update failed:", err);

    // Safe fallback so site never breaks
    fs.writeFileSync(
      "data/schedule.json",
      JSON.stringify({
        updated: new Date().toISOString(),
        matches: []
      }, null, 2)
    );
  }
}

update();
