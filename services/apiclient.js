const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

export async function getMatches() {
  const res = await fetch(`${BASE_URL}/fixtures?season=2026`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await res.json();

  return data.response.map(m => ({
    date: m.fixture.date,
    status: m.fixture.status.short,
    home: m.teams.home.name,
    away: m.teams.away.name,
    venue: m.fixture.venue.name
  }));
}
