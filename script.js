const canvas = document.getElementById("carCanvas");
const ctx = canvas.getContext("2d");

// Elementos de la interfaz
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const endScreen = document.getElementById("end-screen");
const endMessage = document.getElementById("end-message");
const restartBtn = document.getElementById("restart-btn");
const nextGameBtn = document.getElementById("next-game-btn");
const timerDisplay = document.getElementById("timer");
const livesDisplay = document.getElementById("lives");

// Secciones
const gameSection = document.getElementById("game-section");
const puzzleSection = document.getElementById("puzzle-section");

// Configuración de carriles (3 carriles en ancho 300)
// Carril 1: 50, Carril 2: 150, Carril 3: 250
const lanes = [50, 150, 250];
let currentLaneIndex = 1; // Empezamos en el carril del centro

let car = {
    x: lanes[currentLaneIndex],
    y: 400,
    width: 40,
    height: 70
};

let obstacles = []; // Carros contrarios y gasolina
let gameRunning = false;
let lives = 3;
let timeLeft = 30;
let gameInterval, timerInterval, spawnerInterval;

// Controles de teclado
document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;
    if (e.key === "ArrowLeft" && currentLaneIndex > 0) {
        currentLaneIndex--;
        car.x = lanes[currentLaneIndex];
    } else if (e.key === "ArrowRight" && currentLaneIndex < lanes.length - 1) {
        currentLaneIndex++;
        car.x = lanes[currentLaneIndex];
    }
});

// Botones de control del juego de carros
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

function startGame() {
    startScreen.classList.add("hidden");
    endScreen.classList.add("hidden");
    nextGameBtn.classList.add("hidden");
    
    // Resetear variables
    gameRunning = true;
    lives = 3;
    timeLeft = 30;
    currentLaneIndex = 1;
    car.x = lanes[currentLaneIndex];
    obstacles = [];
    
    livesDisplay.textContent = lives;
    timerDisplay.textContent = timeLeft;

    clearInterval(gameInterval);
    clearInterval(timerInterval);
    clearInterval(spawnerInterval);

    // Ciclos del juego
    gameInterval = setInterval(updateGame, 1000 / 60); // 60 FPS
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame(true); // ¡Ganó por tiempo!
        }
    }, 1000);

    spawnerInterval = setInterval(spawnObstacle, 1200);
}

function spawnObstacle() {
    const laneIndex = Math.floor(Math.random() * lanes.length);
    const isGas = Math.random() < 0.3; // 30% de probabilidad de que sea gasolina/vida
    
    obstacles.push({
        x: lanes[laneIndex],
        y: -80,
        width: 40,
        height: 70,
        speed: 4,
        type: isGas ? 'gas' : 'enemy'
    });
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar líneas de la pista
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(100, 0); ctx.lineTo(100, canvas.height);
    ctx.moveTo(200, 0); ctx.lineTo(200, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]); // Resetear líneas

    // Dibujar carro del jugador
    ctx.fillStyle = "#00ffcc";
    ctx.fillRect(car.x - car.width / 2, car.y, car.width, car.height);

    // Actualizar y dibujar obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.y += obs.speed;

        // Dibujar obstáculo o gasolina
        if (obs.type === 'enemy') {
            ctx.fillStyle = "#ff3333"; // Carro contrario rojo
            ctx.fillRect(obs.x - obs.width / 2, obs.y, obs.width, obs.height);
        } else {
            ctx.fillStyle = "#ffcc00"; // Gasolina amarilla
            ctx.fillRect(obs.x - 15, obs.y, 30, 30);
        }

        // Colisión con el jugador
        let hitCondition = obs.type === 'enemy' ? 
            (car.x - car.width/2 < obs.x + obs.width/2 && car.x + car.width/2 > obs.x - obs.width/2 && car.y < obs.y + obs.height && car.y + car.height > obs.y) :
            (Math.abs(car.x - obs.x) < 30 && Math.abs(car.y - obs.y) < 30);

        if (hitCondition) {
            if (obs.type === 'enemy') {
                lives--;
                livesDisplay.textContent = lives;
                obstacles.splice(i, 1);
                if (lives <= 0) {
                    endGame(false);
                    return;
                }
            } else {
                // Recoger gasolina (suma una vida o bonificación)
                lives = Math.min(lives + 1, 5);
                livesDisplay.textContent = lives;
                obstacles.splice(i, 1);
            }
        } else if (obs.y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }
}

function endGame(won) {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    clearInterval(spawnerInterval);

    endScreen.classList.remove("hidden");
    if (won) {
        endMessage.textContent = "¡Sobreviviste a la carrera!";
        nextGameBtn.classList.remove("hidden"); // Mostrar botón para ir al rompecabezas
    } else {
        endMessage.textContent = "¡Te estrellaste! Fin del juego.";
        nextGameBtn.classList.add("hidden");
    }
}

// Botón para pasar al siguiente juego (Rompecabezas)
nextGameBtn.addEventListener("click", () => {
    gameSection.classList.add("hidden");
    puzzleSection.classList.remove("hidden");
    initPuzzle();
});

// --- LÓGICA DEL ROMPECABEZAS DE 8 DÍGITOS ---
const puzzleBoard = document.getElementById("puzzle-board");
const puzzleMessage = document.getElementById("puzzle-message");
const resetPuzzleBtn = document.getElementById("reset-puzzle-btn");

let puzzleTiles = [1, 2, 3, 4, 5, 6, 7, 8, ""];

function initPuzzle() {
    shufflePuzzle();
    renderPuzzle();
}

function shufflePuzzle() {
    // Mezclar de forma sencilla asegurando que sea jugable
    for (let i = puzzleTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [puzzleTiles[i], puzzleTiles[j]] = [puzzleTiles[j], puzzleTiles[i]];
    }
    puzzleMessage.textContent = "";
}

function renderPuzzle() {
    puzzleBoard.innerHTML = "";
    puzzleTiles.forEach((tile, index) => {
        const tileDiv = document.createElement("div");
        tileDiv.classList.add("tile");
        if (tile === "") {
            tileDiv.classList.add("empty");
        } else {
            tileDiv.textContent = tile;
            tileDiv.addEventListener("click", () => moveTile(index));
        }
        puzzleBoard.appendChild(tileDiv);
    });
}

function moveTile(index) {
    const emptyIndex = puzzleTiles.indexOf("");
    
    // Validar si el espacio vacío está al lado (arriba, abajo, izquierda, derecha)
    const validMoves = [
        emptyIndex - 1, emptyIndex + 1, 
        emptyIndex - 3, emptyIndex + 3
    ];

    // Evitar saltos de línea incorrectos en la cuadrícula de 3x3
    if (emptyIndex % 3 === 0 && index === emptyIndex - 1) return;
    if (emptyIndex % 3 === 2 && index === emptyIndex + 1) return;

    if (validMoves.includes(index)) {
        puzzleTiles[emptyIndex] = puzzleTiles[index];
        puzzleTiles[index] = "";
        renderPuzzle();
        checkWinPuzzle();
    }
}

function checkWinPuzzle() {
    const winningState = [1, 2, 3, 4, 5, 6, 7, 8, ""];
    if (puzzleTiles.every((val, i) => val === winningState[i])) {
        puzzleMessage.textContent = "¡Felicitaciones! ¡Completaste el rompecabezas!";
    }
}

resetPuzzleBtn.addEventListener("click", initPuzzle);