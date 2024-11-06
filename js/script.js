"use strict";

console.log("JavaScript is loaded and running");

// Select UI elements
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameScreen = document.getElementById('game-screen');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const endScreen = document.getElementById('end-screen');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// Game variables
let gameTimer = 30; // seconds
let timerInterval;
let score = 0;
let gameActive = false;

// Fly types
const flyTypes = ['normal', 'zigzag', 'sine'];

// Our frog
const frog = {
  body: {
    x: 320,
    y: 520,
    size: 150
  },
  tongue: {
    x: undefined,
    y: 480,
    size: 20,
    speed: 20,
    state: "idle" // State can be: idle, outbound, inbound
  }
};

// Our fly
let fly = {
  x: 0,
  y: 200, // Will be random
  size: 20, // Increased size for better visibility
  speed: 3,
  type: 'normal', // 'normal', 'zigzag', 'sine'
  direction: 1, // For zigzag and sine
  amplitude: 50, // For sine wave
  frequency: 0.05 // For sine wave
};

/**
 * Initializes the game variables
 */
function initializeGame() {
  gameTimer = 30;
  score = 0;
  gameActive = true;
  timerElement.textContent = `Time: ${gameTimer}s`;
  scoreElement.textContent = `Score: ${score}`;
  frog.body.x = width / 2;
  frog.tongue.x = frog.body.x;
  frog.tongue.y = frog.body.y - (frog.body.size / 2);
  frog.tongue.state = "idle";
  resetFly();
}

/**
 * Starts the game timer
 */
function startTimer() {
  timerInterval = setInterval(() => {
    gameTimer--;
    timerElement.textContent = `Time: ${gameTimer}s`;
    if (gameTimer <= 0) {
      endGame();
    }
  }, 1000);
}

/**
 * Ends the game
 */
function endGame() {
  gameActive = false;
  clearInterval(timerInterval);
  noLoop(); // Stops p5.js draw loop
  finalScoreElement.textContent = score;
  endScreen.classList.remove('hidden');
}

/**
 * Resets the fly with random properties based on type
 */
function resetFly() {
  fly.x = -fly.size; // Start off-screen for smooth entry
  fly.y = random(50, height - 50);
  fly.speed = random(2, 5); // Vary fly speed
  fly.type = random(flyTypes);
  fly.direction = random() < 0.5 ? -1 : 1; // Random initial direction for zigzag
}

/**
 * Launch the tongue on click (if it's not launched yet)
 */
function mousePressed() {
  if (gameActive && frog.tongue.state === "idle") {
    frog.tongue.state = "outbound";
    // No sound, so no action here
  }
}

/**
 * Increments the score when fly is caught
 */
function incrementScore() {
  score++;
  scoreElement.textContent = `Score: ${score}`;
}

/**
 * Handles keyboard inputs for additional controls
 */
function keyPressed() {
  if (key === ' ') { // Spacebar to launch tongue
    if (gameActive && frog.tongue.state === "idle") {
      frog.tongue.state = "outbound";
      // No sound, so no action here
    }
  }
}

/**
 * Event Listeners for Start and Restart Buttons
 */
startButton.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  initializeGame();
  startTimer();
  loop(); // Starts p5.js draw loop
});

restartButton.addEventListener('click', () => {
  endScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  initializeGame();
  startTimer();
  loop(); // Starts p5.js draw loop
});

// p5.js functions

function setup() {
  console.log("p5.js setup is running");
  const canvas = createCanvas(640, 600); // Adjust size as needed
  canvas.parent('game-screen'); // Attach canvas to game-screen div
  background("#ffe6f0"); // Soft pastel pink background

  // Initialize game elements
  initializeGame();
  noLoop(); // Start in paused state until game begins
}

function draw() {
  if (!gameActive) return;

  background("#ffe6f0"); // Soft pastel pink background

  moveFly();
  moveFrog();
  moveTongue();
  drawFrog();    // Draw the frog first
  drawFly();     // Then draw the fly on top
  checkTongueFlyOverlap();
}

/**
 * Moves the fly according to its speed and type
 */
function moveFly() {
  // Move the fly
  fly.x += fly.speed;

  // Apply different movement patterns based on type
  if (fly.type === 'zigzag') {
    fly.y += fly.direction * 2; // Move up and down
    // Change direction upon hitting bounds
    if (fly.y <= 50 || fly.y >= height - 50) {
      fly.direction *= -1;
    }
  } else if (fly.type === 'sine') {
    fly.y += sin(fly.x * fly.frequency) * fly.amplitude * 0.02;
  }

  // Handle the fly going off the canvas
  if (fly.x > width + fly.size) {
    resetFly();
  }
}

/**
 * Draws the fly with different appearances based on type
 */
function drawFly() {
  push();
  noStroke();

  // Set color based on fly type
  if (fly.type === 'normal') {
    fill("#ffb6c1"); // Light pastel pink
  } else if (fly.type === 'zigzag') {
    fill("#ff69b4"); // Hot pastel pink
  } else if (fly.type === 'sine') {
    fill("#ffcccb"); // Light red-pink
  }

  ellipse(fly.x, fly.y, fly.size);

  // Add cute eyes to the fly
  fill("#ffffff");
  ellipse(fly.x - 5, fly.y - 5, 5, 5);
  ellipse(fly.x + 5, fly.y - 5, 5, 5);
  fill("#000000");
  ellipse(fly.x - 5, fly.y - 5, 2, 2);
  ellipse(fly.x + 5, fly.y - 5, 2, 2);

  pop();
}

/**
 * Moves the frog to the mouse position on x
 */
function moveFrog() {
  frog.body.x = constrain(mouseX, frog.body.size / 2, width - frog.body.size / 2);
}

/**
 * Handles moving the tongue based on its state
 */
function moveTongue() {
  // Tongue matches the frog's x
  frog.tongue.x = frog.body.x;

  if (frog.tongue.state === "idle") {
    // Do nothing
  } else if (frog.tongue.state === "outbound") {
    frog.tongue.y += -frog.tongue.speed;
    // Check if tongue reaches maximum length
    if (frog.tongue.y <= 0) {
      frog.tongue.state = "inbound";
    }
  } else if (frog.tongue.state === "inbound") {
    frog.tongue.y += frog.tongue.speed;
    if (frog.tongue.y >= frog.body.y - (frog.body.size / 2)) {
      frog.tongue.y = frog.body.y - (frog.body.size / 2);
      frog.tongue.state = "idle";
    }
  }
}

/**
 * Displays the tongue (tip and line connection) and the frog (body)
 */
function drawFrog() {
  // Draw the tongue if active
  if (frog.tongue.state !== "idle") {
    // Tongue line
    push();
    stroke("#ff69b4"); // Hot pastel pink
    strokeWeight(8);
    line(frog.tongue.x, frog.tongue.y, frog.body.x, frog.body.y - (frog.body.size / 2));
    pop();

    // Tongue tip
    push();
    fill("#ff69b4");
    noStroke();
    ellipse(frog.tongue.x, frog.tongue.y, frog.tongue.size);
    pop();
  }

  // Draw the frog's body with a kawaii style
  push();
  fill("#ffb6c1"); // Light pastel pink
  stroke("#ff66b2"); // Slightly darker pink for outline
  strokeWeight(4);
  ellipse(frog.body.x, frog.body.y, frog.body.size, frog.body.size * 0.9); // Slightly oval for a cute look

  // Add cute eyes to the frog
  fill("#ffffff");
  ellipse(frog.body.x - 20, frog.body.y - 20, 20, 20); // Left eye
  ellipse(frog.body.x + 20, frog.body.y - 20, 20, 20); // Right eye
  fill("#000000");
  ellipse(frog.body.x - 20, frog.body.y - 20, 8, 8); // Left pupil
  ellipse(frog.body.x + 20, frog.body.y - 20, 8, 8); // Right pupil

  // Add a cute smile
  noFill();
  stroke("#000000");
  strokeWeight(2);
  arc(frog.body.x, frog.body.y + 10, 50, 30, 0, PI);
  pop();
}

/**
 * Handles the tongue overlapping the fly
 */
function checkTongueFlyOverlap() {
  // Get distance from tongue to fly
  const d = dist(frog.tongue.x, frog.tongue.y, fly.x, fly.y);
  // Check if it's an overlap
  const eaten = (d < (frog.tongue.size / 2) + (fly.size / 2));
  if (eaten && frog.tongue.state !== "idle") {
    // Reset the fly
    resetFly();
    // Bring back the tongue
    frog.tongue.state = "inbound";
    // Increment the score
    incrementScore();
  }
}
