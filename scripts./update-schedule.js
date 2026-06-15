const fs=require("fs");

async function run(){

const response=await fetch(
"https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums"
);

const html=await response.text();

/*
Parse FIFA schedule page here.

Extract:
date
stage
home
away
venue

Build full 104-match JSON
*/

const output={
lastUpdated:new Date().toISOString(),
matches:[]
};

fs.writeFileSync(
"schedule.json",
JSON.stringify(output,null,2)
);
}

run();
