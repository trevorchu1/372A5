// constants
const THROWS = ["rock", "paper", "scissors"];
const IMG_BY_THROW = {
  rock: "img/rock.png",
  paper: "img/paper.png",
  scissors: "img/scissors.png",
};
const QUESTION = { src: "img/question-mark.png", label: "?" };

let isPlaying = false;
let shuffleTimer = null; 
let playerChoice = null;

// scoreboard 
let wins = 0, losses = 0, ties = 0;

// DOM
const choiceEls = Array.from(document.querySelectorAll(".choice"));
const computerImg = document.getElementById("computer-img");
const computerCaption = document.getElementById("computer-caption");
const outcomeText = document.getElementById("outcome-text");
const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const tiesEl = document.getElementById("ties");
const resetBtn = document.getElementById("reset-btn");

// helpers
function setComputerDisplay(src, caption) {
  computerImg.setAttribute("src", src);
  computerImg.setAttribute("alt", caption);
  computerCaption.textContent = caption;
}

function clearSelection() {
  choiceEls.forEach((el) => {
    el.classList.remove("selected");
    el.setAttribute("aria-pressed", "false");
  });
}

function highlightSelection(el) {
  el.classList.add("selected");
  el.setAttribute("aria-pressed", "true");
}

function randomThrow() {
  const idx = Math.floor(Math.random() * THROWS.length);
  return THROWS[idx];
}

function decideWinner(player, computer) {
  if (player === computer) return "tie";
  const winPairs = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };
  return winPairs[player] === computer ? "win" : "loss";
}

function updateScoreboard(result) {
  if (result === "win") wins++;
  else if (result === "loss") losses++;
  else ties++;

  winsEl.textContent = String(wins);
  lossesEl.textContent = String(losses);
  tiesEl.textContent = String(ties);
}

function setOutcomeText(player, computer, result) {
  const sentence =
    result === "tie"
      ? `Tie! You both chose ${player}.`
      : result === "win"
      ? `You win! ${capitalize(player)} beats ${capitalize(computer)}.`
      : `You lose! ${capitalize(computer)} beats ${capitalize(player)}.`;
  outcomeText.textContent = `${sentence}`;
}

function capitalize(s) { return s[0].toUpperCase() + s.slice(1); }

function resetGame() {
  isPlaying = false;
  playerChoice = null;
  clearSelection();
  if (shuffleTimer) {
    clearInterval(shuffleTimer);
    shuffleTimer = null;
  }
  setComputerDisplay(QUESTION.src, "Computer is thinking…");
  computerCaption.textContent = "?";
  outcomeText.textContent = "Make your move to begin.";
}

function hardResetScores() {
  wins = losses = ties = 0;
  winsEl.textContent = "0";
  lossesEl.textContent = "0";
  tiesEl.textContent = "0";
  resetGame();
}

// main functionality
function onPlayerChoose(e) {
  if (isPlaying) return; // ignore clicks while round is in progress

  const el = e.currentTarget;
  const picked = el.getAttribute("data-throw");

  // store and highlight
  playerChoice = picked;
  clearSelection();
  highlightSelection(el);

  isPlaying = true;
  outcomeText.textContent = "Computer is thinking…";

  // "think" for 3s, shuffle result every 0.5 seconds
  let shuffleIndex = 0;
  shuffleTimer = setInterval(() => {
    const t = THROWS[shuffleIndex % THROWS.length];
    setComputerDisplay(IMG_BY_THROW[t], capitalize(t));
    shuffleIndex++;
  }, 500);

  // timer ends, stop shuffling and decide
  setTimeout(() => {
    clearInterval(shuffleTimer);
    shuffleTimer = null;

    const comp = randomThrow();
    setComputerDisplay(IMG_BY_THROW[comp], capitalize(comp));

    const result = decideWinner(playerChoice, comp);
    updateScoreboard(result);
    setOutcomeText(playerChoice, comp, result);

    isPlaying = false;
  }, 3000);
}

// connect event listeners
choiceEls.forEach((el) => {
  el.addEventListener("click", onPlayerChoose);
  el.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter" || evt.key === " ") {
      evt.preventDefault();
      onPlayerChoose({ currentTarget: el });
    }
  });
});

resetBtn.addEventListener("click", hardResetScores);

resetGame();
