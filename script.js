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

shuffleDeck();

/* ===== シャッフル ===== */

function shuffleDeck() {
  deck = [...masterDeck];
  shuffle(deck);

  const deckCard = document.getElementById("deck-card");
  deckCard.classList.remove("flip", "joker-glow");

  // 裏面に戻す
  deckCard.querySelector(".card-face.front img").src = "img/ura.png";

  document.getElementById("log-list").innerHTML = "";
  updateCount();
}

/* ===== ドロー ===== */

function drawCard() {
  if (deck.length === 0 || isDrawing) return;
  isDrawing = true;

  const card = deck.pop();

  const deckCard = document.getElementById("deck-card");
  const frontImg = deckCard.querySelector(".card-face.front img");

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

/* ===== ログ追加 ===== */

function addLog(src) {
  const li = document.createElement("li");
  li.className = "log-card";

  const img = document.createElement("img");
  img.src = src;

  li.appendChild(img);
  document.getElementById("log-list").prepend(li);
}

/* ===== 残り枚数 ===== */

function updateCount() {
  document.getElementById("count").textContent = deck.length;
}

/* ===== シャッフル処理 ===== */

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
