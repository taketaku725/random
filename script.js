const suits = ["s", "h", "d", "c"];
const ranks = ["a","2","3","4","5","6","7","8","9","10","j","q","k"];

const masterDeck = [];

for (const s of suits) {
  for (const r of ranks) {
    masterDeck.push({ image: `img/${s}_${r}.png` });
  }
}

masterDeck.push({ image: "img/joker1.png" });
masterDeck.push({ image: "img/joker2.png" });

let deck = [];
let isDrawing = false;
let drawnCount = 0;

document.addEventListener("DOMContentLoaded", () => {
  shuffleDeck();
  initDice6();
});

function showScreen(id, btn) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

  document.getElementById(id).classList.add("active");
  btn.classList.add("active");
}

let diceCubes = [];

function initDice6() {

  const count = Number(document.getElementById("dice-count").value);
  const area = document.getElementById("dice6-area");

  area.innerHTML = "";
  diceCubes = [];

  for (let i = 0; i < count; i++) {

    const cube = document.createElement("div");
    cube.className = "dice-cube";

    for (let n = 1; n <= 6; n++) {
      const face = document.createElement("div");
      face.className = "dice-face face" + n;

      const img = document.createElement("img");
      img.src = "img/dice" + n + ".png";

      face.appendChild(img);
      cube.appendChild(face);
    }

    cube.style.transform = "rotateX(0deg) rotateY(0deg)";

    area.appendChild(cube);
    diceCubes.push(cube);
  }
}

function rollDice6() {

  const totalEl = document.getElementById("dice6-total");

  // 回転開始で合計消す
  totalEl.textContent = "";

  let total = 0;
  let finished = 0;

  diceCubes.forEach(cube => {

    const value = Math.floor(Math.random() * 6) + 1;
    total += value;

    const rot = getRotationForValue(value);

    // 斜め軸4方向（XとYを同じ比率）
    const directions = [
      { x: 720,  y: 720  },   // 右前
      { x: 720,  y: -720 },   // 左前
      { x: -720, y: 720  },   // 右奥
      { x: -720, y: -720 }    // 左奥
    ];

    const dir = directions[Math.floor(Math.random() * 4)];

    cube.style.transition = "transform 0.8s linear";

    // 斜め一本回転
    cube.style.transform =
      `rotateX(${dir.x}deg) rotateY(${dir.y}deg)`;

    setTimeout(() => {

      cube.style.transition = "none";

      // 正面にスナップ
      cube.style.transform =
        `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;

      finished++;

      if (finished === diceCubes.length) {
        totalEl.textContent = "合計: " + total;
      }

    }, 800);

  });
}



function getRotationForValue(value) {

  switch(value) {
    case 1: return { x: 0, y: 0 };
    case 2: return { x: 0, y: -90 };
    case 3: return { x: -90, y: 0 };
    case 4: return { x: 90, y: 0 };
    case 5: return { x: 0, y: 90 };
    case 6: return { x: 0, y: 180 };
  }
}

function rollDice20() {
  const result = Math.floor(Math.random() * 20) + 1;
  document.getElementById("dice20-result").textContent = result;
}

function shuffleDeck() {
  deck = [...masterDeck];
  shuffle(deck);

  drawnCount = 0;

  const current = document.getElementById("current-card");
  const next = document.getElementById("next-card");

  current.classList.remove("flip", "fly-up", "joker-glow");
  next.classList.remove("flip", "fly-up", "joker-glow");

  current.querySelector(".card-face.front img").src = "img/ura.png";
  next.querySelector(".card-face.front img").src = "img/ura.png";

  document.getElementById("log-list").innerHTML = "";
  updateCount();
}

function drawCard() {
  if (deck.length === 0 || isDrawing) return;
  isDrawing = true;

  const drawBtn = document.getElementById("draw-btn");
  const current = document.getElementById("current-card");
  const next = document.getElementById("next-card");

  drawBtn.disabled = true;

  current.classList.remove("joker-glow");
  next.classList.remove("joker-glow");

  const currentFront = current.querySelector(".card-face.front img");
  const nextFront = next.querySelector(".card-face.front img");

  const nextCardData = deck[deck.length - 1];
  const isJoker = nextCardData.image.includes("joker");

  nextFront.src = nextCardData.image;
  next.classList.add("flip");

  if (drawnCount === 0) {
    deck.pop();
    currentFront.src = nextCardData.image;
    current.classList.add("flip");

    if (isJoker) {
      current.classList.add("joker-glow");
    }

    addLog(nextCardData.image);
    updateCount();
    drawnCount++;
    isDrawing = false;
    return;
  }

  current.classList.add("fly-up");

  setTimeout(() => {

    current.classList.remove("fly-up");

    currentFront.src = nextFront.src;

    if (isJoker) {
      current.classList.add("joker-glow");
    }

    addLog(currentFront.src);
    deck.pop();
    updateCount();
    drawnCount++;
    isDrawing = false;

  }, 600);
}

function addLog(src) {
  const logList = document.getElementById("log-list");
  if (!logList) return;

  const li = document.createElement("li");
  const img = document.createElement("img");
  img.src = src;

  li.appendChild(img);
  logList.prepend(li);
}

function updateCount() {
  const countEl = document.getElementById("count");
  const drawBtn = document.getElementById("draw-btn");

  countEl.textContent = deck.length;
  drawBtn.disabled = (deck.length === 0);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
