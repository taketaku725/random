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

  const resultCard = document.getElementById("result-card");
  resultCard.classList.remove("flip", "joker-glow");
  resultCard.querySelector(".card-face.front img").src = "img/ura.png";

  document.getElementById("log-list").innerHTML = "";
  updateCount();
}

/* ===== ドロー ===== */

function drawCard() {
  if (deck.length === 0 || isDrawing) return;
  isDrawing = true;

  animateDraw();

  setTimeout(() => {
    const card = deck.pop();

    const resultCard = document.getElementById("result-card");
    resultCard.classList.remove("joker-glow"); // まず消す

    frontImg.src = card.image;
    resultCard.classList.add("flip");

    if (card.image.includes("joker")) {
    resultCard.classList.add("joker-glow");
    }

    document.getElementById("flying-card").style.opacity = "0";

    frontImg.src = card.image;
    resultCard.classList.add("flip");

    addLog(card.image);
    updateCount();
    isDrawing = false;
  }, 400);
}

/* ===== 落下アニメ ===== */

function animateDraw() {
  const flying = document.getElementById("flying-card");
  const inner = flying.querySelector(".card-inner");
  const frontImg = flying.querySelector(".card-face.front img");

  inner.style.transform = "rotateY(0deg)";
  frontImg.src = "img/ura.png";

  flying.style.opacity = "1";
  flying.style.transform = "translateX(-50%) translateY(0)";

  requestAnimationFrame(() => {
    flying.style.transform =
      "translateX(-50%) translateY(240px)";
  });
}

/* ===== ログ ===== */

function addLog(src) {
  const li = document.createElement("li");
  li.className = "card small";

  const img = document.createElement("img");
  img.src = src;

  li.appendChild(img);
  document.getElementById("log-list").prepend(li);
}

/* ===== 残り枚数 ===== */

function updateCount() {
  document.getElementById("count").textContent = deck.length;
}

/* ===== ユーティリティ ===== */

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

