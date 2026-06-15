let matches = [];

fetch("schedule.json")
.then(r=>r.json())
.then(data=>{
  matches = data.matches;
  document.getElementById("matchCount").textContent = matches.length;
  render(matches);
  renderStandings(matches);
  globalCountdown();
});

/* THEME */
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("light");
};

/* FLAGS */
function flag(team){
  const map={
    USA:"🇺🇸", Mexico:"🇲🇽", Canada:"🇨🇦",
    Brazil:"🇧🇷", France:"🇫🇷", Argentina:"🇦🇷",
    Germany:"🇩🇪", Spain:"🇪🇸", England:"🏴"
  };
  return map[team] || "⚽";
}

/* RENDER MATCHES */
function render(data){
  const body = document.getElementById("scheduleBody");

  body.innerHTML = data.map(m => {
    const countdown = getCountdown(m.date);

    return `
      <tr>
        <td>${m.date}</td>
        <td>${flag(m.home)} ${m.home} vs ${flag(m.away)} ${m.away}</td>
        <td>${m.venue}</td>
        <td>${countdown}</td>
      </tr>
    `;
  }).join("");
}

/* COUNTDOWN */
function getCountdown(date){
  const diff = new Date(date) - new Date();
  const days = Math.max(0, Math.floor(diff/86400000));
  return days + " days";
}

/* GLOBAL COUNTDOWN */
function globalCountdown(){
  const target = new Date("2026-06-11");
  setInterval(()=>{
    const diff = target - new Date();
    document.getElementById("globalCountdown").innerText =
      Math.max(0, Math.floor(diff/86400000)) + " days to kickoff";
  },1000);
}

/* FILTERS */
const stageFilter = document.getElementById("stageFilter");
const teamFilter = document.getElementById("teamFilter");

function applyFilters(){
  let filtered = matches;

  if(stageFilter.value){
    filtered = filtered.filter(m =>
      m.stage.includes(stageFilter.value)
    );
  }

  if(teamFilter.value){
    const q = teamFilter.value.toLowerCase();
    filtered = filtered.filter(m =>
      m.home.toLowerCase().includes(q) ||
      m.away.toLowerCase().includes(q)
    );
  }

  render(filtered);
}

stageFilter.onchange = applyFilters;
teamFilter.oninput = applyFilters;

/* STANDINGS (SIMPLE AUTO GENERATOR) */
function renderStandings(matches){
  const groups = {};

  matches.forEach(m=>{
    const g = m.group || "Group A";
    groups[g] = groups[g] || [];
  });

  document.getElementById("standings").innerHTML =
    Object.keys(groups).map(g=>`
      <div class="card">
        <h3>${g}</h3>
        <p>Standings coming after match results update</p>
      </div>
    `).join("");
}
