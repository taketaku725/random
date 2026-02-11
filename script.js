import * as THREE from "three";
import { GLTFLoader } from "https://esm.sh/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";

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
  initDice20();
});

function showScreen(id, btn) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

  document.getElementById(id).classList.add("active");
  btn.classList.add("active");
}

let diceCubes = [];

let diceState = []; // 現在の角度を保持

function initDice6() {

  const count = Number(document.getElementById("dice-count").value);
  const area = document.getElementById("dice6-area");

  area.innerHTML = "";
  diceCubes = [];
  diceState = [];

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
    diceState.push({ x: 0, y: 0 });
  }
}

function rollDice6() {

  const totalEl = document.getElementById("dice6-total");
  totalEl.textContent = "";

  let total = 0;
  let finished = 0;

  diceCubes.forEach(cube => {

    const value = Math.floor(Math.random() * 6) + 1;
    total += value;

    const axes = [
      { x: 1,   y: 0.7, z: 1.2 },
      { x: 1,   y: -0.8, z: 1 },
      { x: -1.1,y: 1,   z: 0.9 },
      { x: -0.9,y: -1,  z: 1.1 }
    ];

    const axis = axes[Math.floor(Math.random() * 4)];

    cube.style.transition = "transform 1s linear";

    // 空間で捻るだけ
    cube.style.transform =
      `rotate3d(${axis.x}, ${axis.y}, ${axis.z}, 1440deg)`;

    setTimeout(() => {

      cube.style.transition = "none";
      cube.style.transform = "rotateX(0deg) rotateY(0deg)";

      // 正面（face1）の画像を差し替える
      const frontFace = cube.querySelector(".face1 img");
      frontFace.src = "img/dice" + value + ".png";

      finished++;

      if (finished === diceCubes.length) {
        totalEl.textContent = "合計: " + total;
      }

    }, 1000);

  });
}

let scene, camera, renderer, d20;

function initDice20() {

  const container = document.getElementById("dice20-canvas");
  if (!container) return;

  const width = container.clientWidth || 300;
  const height = container.clientHeight || 300;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const loader = new GLTFLoader();
  loader.load("assets/d20.glb", (gltf) => {
    d20 = gltf.scene;
    scene.add(d20);
    animate();
  });
}

function animate() {
  requestAnimationFrame(animate);
}

let isRolling20 = false;

function rollDice20() {

  if (!d20 || isRolling20) return;
  isRolling20 = true;

  const result = Math.floor(Math.random() * 20) + 1;
  document.getElementById("dice20-result").textContent = "";

  const duration = 1500;
  const start = performance.now();

  const speedX = 0.6 + Math.random();
  const speedY = 0.6 + Math.random();
  const speedZ = 0.6 + Math.random();

  function spin(now) {

    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);

    // イージング（減速）
    const ease = 1 - Math.pow(1 - t, 3);

    d20.rotation.x += speedX * (1 - ease);
    d20.rotation.y += speedY * (1 - ease);
    d20.rotation.z += speedZ * (1 - ease);

    renderer.render(scene, camera);

    if (t < 1) {
      requestAnimationFrame(spin);
    } else {

      document.getElementById("dice20-result").textContent = result;

      if (result === 20) {
        d20.scale.set(1.4,1.4,1.4);
        setTimeout(() => d20.scale.set(1,1,1), 400);
      }
      isRolling20 = false;
    }
  }
  requestAnimationFrame(spin);
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

window.showScreen = showScreen;
window.rollDice6 = rollDice6;
window.rollDice20 = rollDice20;
window.drawCard = drawCard;
window.shuffleDeck = shuffleDeck;
