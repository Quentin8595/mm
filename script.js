/**************************
 * VARIABLES GLOBALES
 **************************/
let scores = {1:0, 2:0};
let suddenTarget = 7;
let funActions = [
  "Lancer de la mauvaise main à chaque lancé",
  "Lancer les yeux fermés à chaque lancé",
  "Lancer dos tourné à chaque lancé",
  "Lancer avec une jambe levée à chaque lancé",
  "Lancer accroupi à chaque lancé",
  "Si vous ne lancez pas sur la cible vous devez enlever un palet de votre choix à vous"
];

let tournamentPlayers = [];
let tournamentRounds = [];
let tournamentFinished = false; // empêche les clics multiples sur le vainqueur
let winnerSelected = false;     // empêche plusieurs clics sur un match déjà gagné

/**************************
 * NAVIGATION
 **************************/
function goTo(id){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id !== "score80") resetScore();
  if(id === "funMode") resetFun();
}

/**************************
 * MODE 80 POINTS
 **************************/
function add(team,val){
  scores[team] += val;
  if(scores[team] < 0) scores[team] = 0;
  updateScore(team);
}

function addInput(team){
  const val = parseInt(document.getElementById("input"+team).value);
  if(!isNaN(val)){
    scores[team] += val;
    updateScore(team);
    document.getElementById("input"+team).value = "";
  }
}

function updateScore(team){
  const el = document.getElementById("s"+team);
  el.textContent = scores[team];
  if(scores[team] >= 80){
    document.getElementById("winMsg").textContent = "Victoire de l’équipe " + team + "s";
  } else {
    document.getElementById("winMsg").textContent = "";
  }
}

function resetScore(){
  scores = {1:0, 2:0};
  ["s1","s2"].forEach(id => {
    document.getElementById(id).textContent = "0";
  });
  ["input1","input2"].forEach(id => document.getElementById(id).value="");
  document.getElementById("winMsg").textContent="";
}

/**************************
 * MORT SUBITE
 **************************/
function startSudden(){
  suddenTarget = Math.floor(Math.random()*6) + 5;
  document.getElementById("target").textContent = suddenTarget;
  goTo("sudden");
}

function nextSudden(){
  suddenTarget += Math.floor(Math.random()*3) + 1;
  document.getElementById("target").textContent = suddenTarget;
}

/**************************
 * FUN MODE
 **************************/
function resetFun(){
  document.getElementById("funMsg").innerHTML =
    "Chaque équipe lance à tour de rôle ses 6 palets en effectuant l'action demandée. " +
    "À la fin des 12 palets lancés, l'équipe avec le plus de points gagne la manche, " +
    "puis on recommence pour la suivante avec une nouvelle action. " +
    "<span style='font-style:italic;'>Pour plus de détails, consultez les règles.</span>";
}

function funAction(){
  const action = funActions[Math.floor(Math.random()*funActions.length)];
  document.getElementById("funMsg").textContent =
    "L'action de cette manche sera : " + action;
}

/**************************
 * PDF
 **************************/
function openPDF(){
  window.open("regles.pdf","_blank");
}

/**************************
 * TOURNOI
 **************************/
function startTournament(){
  tournamentPlayers = [];
  tournamentRounds = [];
  tournamentFinished = false;
  winnerSelected = false;

  let num = parseInt(prompt("Nombre de joueurs / équipes ? (3 à 8)"));
  if(isNaN(num) || num < 3 || num > 8){
    alert("Nombre invalide (3 à 8)");
    return;
  }

  for(let i=0;i<num;i++){
    tournamentPlayers.push(prompt("Nom du joueur "+(i+1)));
  }

  // Mélange aléatoire
  tournamentPlayers.sort(() => Math.random() - 0.5);

  // Si nombre impair, placer le joueur sans adversaire au début
  if(tournamentPlayers.length % 2 === 1){
    const solo = tournamentPlayers.pop();
    tournamentPlayers.unshift(solo);
  }

  generateBracket(tournamentPlayers);
}

function generateBracket(players){
  goTo("tournament");
  tournamentRounds = [];

  let p = [...players];

  // Premier tour
  let firstRound = [];
  for(let i=0;i<p.length;i+=2){
    firstRound.push([p[i], p[i+1] || ""]);
  }
  tournamentRounds.push(firstRound);

  // Tours suivants
  let matches = firstRound.length;
  while(matches > 1){
    matches = Math.ceil(matches / 2);
    let round = [];
    for(let i=0;i<matches;i++){
      round.push(["",""]);
    }
    tournamentRounds.push(round);
  }

  renderBracket();
}

function renderBracket(){
  const container = document.getElementById("tournamentBracket");
  container.innerHTML = "";
  document.getElementById("tournamentWinner")?.remove();

  tournamentRounds.forEach((round,rIdx)=>{
    const roundDiv = document.createElement("div");
    roundDiv.className = "round";

    round.forEach((match,mIdx)=>{
      const matchDiv = document.createElement("div");
      matchDiv.className = "match";

      match.forEach((team,tIdx)=>{
        const teamDiv = document.createElement("div");
        teamDiv.className = "team";
        teamDiv.textContent = team || "—";

        if(team && !tournamentFinished){
          teamDiv.style.cursor = "pointer";
          teamDiv.onclick = () => selectWinner(rIdx, mIdx, tIdx);
        }

        matchDiv.appendChild(teamDiv);
      });

      roundDiv.appendChild(matchDiv);
    });

    container.appendChild(roundDiv);
  });
}

function selectWinner(roundIdx, matchIdx, teamIdx){
  if(winnerSelected) return; // empêche les clics multiples
  const winner = tournamentRounds[roundIdx][matchIdx][teamIdx];
  if(!winner) return;

  const nextRoundIdx = roundIdx + 1;

  // Finale
  if(nextRoundIdx >= tournamentRounds.length){
    tournamentFinished = true;
    winnerSelected = true;

    const winnerEl = document.createElement("p");
    winnerEl.id = "tournamentWinner";
    winnerEl.style.fontSize = "24px";
    winnerEl.style.color = "#2c3e50";
    winnerEl.textContent = "Victoire : " + winner;
    document.getElementById("tournament").appendChild(winnerEl);

    return;
  }

  const nextMatchIdx = Math.floor(matchIdx / 2);
  const pos = matchIdx % 2;

  tournamentRounds[nextRoundIdx][nextMatchIdx][pos] = winner;
  renderBracket();
}
