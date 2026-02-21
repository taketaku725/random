import * as THREE from "three";
import { GLTFLoader } from "https://esm.sh/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";

let deck = [];
let isDrawing = false;
let drawnCount = 0;
let diceCubes = [];
let diceState = []; // 現在の角度を保持
let scene, camera, renderer, d20;
let isRolling20 = false;

const D20_POSES = {
  1:  new THREE.Quaternion( 0.0380,  0.2445,  0.9574, -0.1488).normalize(),
  2:  new THREE.Quaternion(-0.4981, -0.8052,  0.0448,  0.3186).normalize(),
  3:  new THREE.Quaternion( 0.1256,  0.2408, -0.8533,  0.4451).normalize(),
  4:  new THREE.Quaternion(-0.6111,  0.7245,  0.2975, -0.1148).normalize(),
  5:  new THREE.Quaternion( 0.7601,  0.0515,  0.5471,  0.3468).normalize(),
  6:  new THREE.Quaternion(-0.5594,  0.5254,  0.4621,  0.4444).normalize(),
  7:  new THREE.Quaternion( 0.3128, -0.0975,  0.9121,  0.2462).normalize(),
  8:  new THREE.Quaternion(-0.7428,  0.1123,  0.0986,  0.6526).normalize(),
  9:  new THREE.Quaternion( 0.5729,  0.2946, -0.3498,  0.6802).normalize(),
 10:  new THREE.Quaternion( 0.5029,  0.4068, -0.2865, -0.7068).normalize(),
 11:  new THREE.Quaternion( 0.6440, -0.4288, -0.4536,  0.4423).normalize(),
 12:  new THREE.Quaternion(-0.6966, -0.3582, -0.2843,  0.5528).normalize(),
 13:  new THREE.Quaternion( 0.6028, -0.0600,  0.1604,  0.7793).normalize(),
 14:  new THREE.Quaternion( 0.6721,  0.6583, -0.2372,  0.2422).normalize(),
 15:  new THREE.Quaternion( 0.4534, -0.4576,  0.5433,  0.5383).normalize(),
 16:  new THREE.Quaternion(-0.2442,  0.5814, -0.1699,  0.7573).normalize(),
 17:  new THREE.Quaternion(-0.2110,  0.2605, -0.8582,  0.3888).normalize(),
 18:  new THREE.Quaternion( 0.0895, -0.9454, -0.1571,  0.2712).normalize(),
 19:  new THREE.Quaternion(-0.1354,  0.2627,  0.8492,  0.4376).normalize(),
 20:  new THREE.Quaternion( 0.1429,  0.9368, -0.3163,  0.0438).normalize()
};

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

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      showScreen(btn.dataset.target, btn);
    });
  });

  document.getElementById("draw-btn").addEventListener("click", drawCard);
  document.getElementById("shuffle-btn").addEventListener("click", shuffleDeck);
  document.getElementById("roll6-btn").addEventListener("click", rollDice6);
  document.getElementById("roll20-btn").addEventListener("click", rollDice20);
  document.getElementById("dice-count").addEventListener("change", initDice6);

  // ① まずタブ復元
  const savedTab = localStorage.getItem("lastTab") || "card";
  const btn = document.querySelector(`.tab[data-target="${savedTab}"]`);
  showScreen(savedTab, btn);

  // ② その後初期化
  shuffleDeck();
  initDice6();

});

let dice20Initialized = false;

function showScreen(id, btn) {

  document.querySelectorAll(".screen")
    .forEach(s => s.classList.remove("active"));

  document.querySelectorAll(".tab")
    .forEach(t => t.classList.remove("active"));

  document.getElementById(id).classList.add("active");
  if (btn) btn.classList.add("active");

  localStorage.setItem("lastTab", id);

  if (id === "dice20" && !dice20Initialized) {
    initDice20();
    dice20Initialized = true;
  }
}

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


function initDice20() {

  const container = document.getElementById("dice20-canvas");
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 3);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  container.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const loader = new GLTFLoader();
    loader.load("assets/d20.glb", (gltf) => {
    d20 = gltf.scene;

    d20.position.set(0, 0, 0);
    d20.rotation.set(0, 0, 0);
    d20.scale.set(1, 1, 1);

    scene.add(d20);
    renderer.render(scene, camera);

    window.d20 = d20; // ← これ追加
    window.renderer = renderer; // ← ついでに
    window.camera = camera;
    window.scene = scene;
  });
}

function animate() {
  requestAnimationFrame(animate);
}


function rollDice20() {

  if (!d20 || isRolling20) return;
  isRolling20 = true;

  document.getElementById("dice20-result").textContent = "";

  const duration = 1500;
  const start = performance.now();

  const speedX = 0.6 + Math.random();
  const speedY = 0.6 + Math.random();
  const speedZ = 0.6 + Math.random();

  function spin(now) {

    const elapsed = now - start;
    const t = elapsed / duration;

    // 一定速度で回転（減速なし）
    d20.rotation.x += speedX;
    d20.rotation.y += speedY;
    d20.rotation.z += speedZ;

    renderer.render(scene, camera);

    if (t < 1) {
      requestAnimationFrame(spin);
    } else {

      const result = Math.floor(Math.random() * 20) + 1;

      // 即ビタ止め
      d20.quaternion.copy(D20_POSES[result]);
      renderer.render(scene, camera);

      document.getElementById("dice20-result").textContent = result;

      if (result === 20) {
        d20.scale.set(1.4,1.4,1.4);
        setTimeout(() => d20.scale.set(1,1,1), 200);
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

  // ★ まず今のカードを確定
  const drawnCard = deck.pop();
  const isJoker = drawnCard.image.includes("joker");

  // ★ current に即セット（飛ぶ前に）
  currentFront.src = drawnCard.image;

  if (isJoker) {
    current.classList.add("joker-glow");
  }

  addLog(drawnCard.image);
  updateCount();

  drawnCount++;

  // ★ 次のカードを先に仕込む
  if (deck.length > 0) {
    const upcoming = deck[deck.length - 1];
    nextFront.src = upcoming.image;
    next.classList.remove("flip");
  }

  // ★ 1枚目だけは飛ばさない
  if (drawnCount === 1) {
    isDrawing = false;
    return;
  }

  // ★ 2枚目以降は飛ばす
  current.classList.add("fly-up");

  setTimeout(() => {

    current.classList.remove("fly-up");

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






















