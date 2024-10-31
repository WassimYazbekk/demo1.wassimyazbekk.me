import setupDropdown from "./dropdown";
import "./style.css";

// Type definition for a letter
type TLetter = {
  char: string;
  x: number;
  y: number;
  velocity: number;
  element: HTMLElement;
};

// Game state variables
let keyboard: "qwerty" | "dvorak" = "dvorak";
let letters: TLetter[] = [];
let score = 0;
let mistakes = 0;
let speed = 1;
let isGameOver = false;
let isGameRunning = false;
let spawnInterval: number | undefined;
let spawnRate = 1000;

// UI elements
const scoreEl = document.getElementById("score");
const mistakesEl = document.getElementById("mistakes");
const speedEl = document.getElementById("speed");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

// Set the keyboard layout
function setKeyboard(_keyboard: "qwerty" | "dvorak") {
  keyboard = _keyboard;
  console.log(keyboard);
}

setupDropdown(setKeyboard);

// Start the game
export function startGame() {
  const app = document.querySelector("#app");
  if (!app || isGameOver || isGameRunning) return;

  // Initialize game state
  isGameRunning = true;
  resetGameState();

  // Start spawning letters and drawing frames
  spawnInterval = window.setInterval(
    () => spawnLetter(app.clientWidth),
    spawnRate,
  );
  requestAnimationFrame(drawFrame);
}

// Handle keyboard input
window.addEventListener("keydown", (event) => {
  if (isGameOver) return;

  const pressedKey = event.key.toUpperCase();
  const nearestLetter = findNearestLetter();

  if (nearestLetter) {
    handleKeyPress(pressedKey, nearestLetter);
  }
});

// Event listeners for buttons
startBtn?.addEventListener("click", startGame);
restartBtn?.addEventListener("click", resetGame);

// Game loop for drawing frames
export function drawFrame() {
  const app = document.querySelector("#app");
  if (!app || !isGameRunning) return;

  letters.forEach((letter) => {
    letter.y += letter.velocity;
    letter.element.style.top = `${letter.y}px`;

    if (letter.y >= app.clientHeight - 50) {
      handleLetterMiss(letter, app);
    }
  });

  if (!isGameOver) {
    requestAnimationFrame(drawFrame);
  } else {
    isGameRunning = false;
  }
}

// Update score and mistakes UI
function updateScoreAndMistakes() {
  if (scoreEl) scoreEl.innerText = score.toString();
  if (mistakesEl) mistakesEl.innerText = "X".repeat(mistakes);
  if (speedEl) speedEl.innerText = speed.toString();

  updateSpeedAndSpawnRate();
}

// Spawn a new letter
export function spawnLetter(width: number) {
  if (isGameOver) return;

  // Generate a random x position within the width of the app, leaving some margin
  const x = Math.random() * (width - 50); // 50 is the width of the letter div
  const char =
    keyboard === "dvorak"
      ? "AOEUHTNS"[Math.floor(Math.random() * 8)]
      : "ASDFJKL;"[Math.floor(Math.random() * 8)];

  const element = document.createElement("div");
  element.innerHTML = char;
  element.style.position = "absolute";
  element.style.left = `${x}px`; // Set the left position for the letter
  element.classList.add("letter");

  // Create the letter object and add it to the letters array
  const letter: TLetter = {
    char,
    x,
    y: 0, // Start from the top
    velocity: 2 * speed,
    element,
  };

  const app = document.querySelector("#app");
  if (app) app.appendChild(letter.element);
  letters.push(letter);
}
// Update the spawn rate based on the current score
function updateSpawnRate() {
  if (spawnInterval) {
    clearInterval(spawnInterval);
    const app = document.querySelector("#app");
    if (app) {
      spawnInterval = window.setInterval(
        () => spawnLetter(app.clientWidth),
        spawnRate,
      );
    }
  }
}

// Handle game over
function gameOver() {
  isGameOver = true;
  isGameRunning = false;
}

// Reset the game state
export function resetGame() {
  clearInterval(spawnInterval);
  isGameRunning = false;
  isGameOver = false;
  resetGameState();
  updateScoreAndMistakes();

  // Delay the restart slightly to ensure reset happens properly
  setTimeout(startGame, 100);
}

// Helper Functions
function resetGameState() {
  score = 0;
  mistakes = 0;
  speed = 1;
  spawnRate = 1000;
  letters.forEach((letter) => letter.element.remove());
  letters = [];
}

function findNearestLetter(): TLetter | undefined {
  return letters.reduce(
    (nearest, letter) => (letter.y > (nearest?.y || 0) ? letter : nearest),
    undefined as TLetter | undefined,
  );
}

function handleKeyPress(pressedKey: string, nearestLetter: TLetter) {
  if (pressedKey === nearestLetter.char) {
    score++;
    updateScoreAndMistakes();
    const app = document.querySelector("#app");
    if (app) app.removeChild(nearestLetter.element);
    letters.splice(letters.indexOf(nearestLetter), 1);
  } else {
    mistakes++;
    updateScoreAndMistakes();
    if (mistakes >= 3) gameOver();
  }
}

function handleLetterMiss(letter: TLetter, app: Element) {
  mistakes++;
  updateScoreAndMistakes();
  app.removeChild(letter.element);
  letters.splice(letters.indexOf(letter), 1);

  if (mistakes >= 3) {
    gameOver();
  }
}

function updateSpeedAndSpawnRate() {
  if (isGameRunning) {
    if (score >= 200) {
      speed = 4;
      spawnRate = 400;
    } else if (score >= 50) {
      speed = 3;
      spawnRate = 600;
    } else if (score >= 10) {
      speed = 2;
      spawnRate = 800;
    }
    updateSpawnRate();
  }
}
