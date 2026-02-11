/* ===== デッキ生成 ===== */

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

/* ===== 初期化 ===== */

document.addEventListener("DOMContentLoaded", () => {
  shuffleDeck();
});

/* ===== シャッフル ===== */

function shuffleDeck() {
  deck = [...masterDeck];
  shuffle(deck);

  const deckCard = document.getElementById("deck-card");
  if (!deckCard) {
    console.error("deck-card が見つかりません");
    return;
  }

  deckCard.classList.remove("flip", "joker-glow");

  const frontImg = deckCard.querySelector(".card-face.front img");
  if (frontImg) {
    frontImg.src = "img/ura.png";
  }

  const logList = document.getElementById("log-list");
  if (logList) {
    logList.innerHTML = "";
  }

  updateCount();
}

/* ===== ドロー（山札その場でめくる） ===== */

function drawCard() {
  if (deck.length === 0 || isDrawing) return;
  isDrawing = true;

  const card = deck.pop();

  const deckCard = document.getElementById("deck-card");
  if (!deckCard) {
    isDrawing = false;
    return;
  }

  const frontImg = deckCard.querySelector(".card-face.front img");
  if (!frontImg) {
    isDrawing = false;
    return;
  }

  deckCard.classList.remove("flip", "joker-glow");

  // 表を仕込む
  frontImg.src = card.image;

  // めくる
  requestAnimationFrame(() => {
    deckCard.classList.add("flip");
  });

  // ジョーカー演出
  if (card.image.includes("joker")) {
    deckCard.classList.add("joker-glow");
  }

  addLog(card.image);
  updateCount();
  isDrawing = false;
}

/* ===== ログ ===== */

function addLog(src) {
  const logList = document.getElementById("log-list");
  if (!logList) return;

  const li = document.createElement("li");
  li.className = "log-card";

  const img = document.createElement("img");
  img.src = src;

  li.appendChild(img);
  logList.prepend(li);
}

/* ===== 残り枚数 ===== */

function updateCount() {
  const countEl = document.getElementById("count");
  if (countEl) {
    countEl.textContent = deck.length;
  }
}

/* ===== シャッフル用 ===== */

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

