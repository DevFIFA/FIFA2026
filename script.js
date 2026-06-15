let matches=[];

fetch("schedule.json")
.then(r=>r.json())
.then(data=>{
  matches=data.matches;
  render(matches);
});

function render(items){
  const body=document.getElementById("scheduleBody");

  body.innerHTML=items.map(match=>`
    <tr>
      <td>${match.date}</td>
      <td>${match.stage}</td>
      <td>${match.home}</td>
      <td>${match.away}</td>
      <td>${match.venue}</td>
    </tr>
  `).join("");
}

document
.getElementById("search")
.addEventListener("input",e=>{

const q=e.target.value.toLowerCase();

render(
matches.filter(m=>
JSON.stringify(m)
.toLowerCase()
.includes(q))
);
});

const kickoff=new Date("2026-06-11T13:00:00");

setInterval(()=>{
const now=new Date();
const diff=kickoff-now;

const d=Math.floor(diff/86400000);

document.getElementById("countdown")
.textContent=`${d} Days Until Kickoff`;
},1000);
