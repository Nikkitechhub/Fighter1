```javascript
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player1HealthBar = document.getElementById("player1Health");
const player2HealthBar = document.getElementById("player2Health");
const timerElement = document.getElementById("timer");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const winnerText = document.getElementById("winnerText");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const FLOOR = 470;
const GRAVITY = 0.7;

let gameRunning = false;
let timer = 60;
let timerInterval;

const keys = {};

window.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

class Fighter {

    constructor(x, color, name, controls) {

        this.x = x;
        this.y = FLOOR - 100;

        this.width = 50;
        this.height = 100;

        this.color = color;
        this.name = name;

        this.controls = controls;

        this.velocityX = 0;
        this.velocityY = 0;

        this.speed = 5;

        this.health = 100;

        this.isJumping = false;
        this.isAttacking = false;
        this.isBlocking = false;

        this.attackCooldown = 0;
        this.attackTimer = 0;

        this.specialCooldown = 0;
    }

    update(opponent) {

        if (!gameRunning) return;

        this.velocityX = 0;

        // Movement
        if (keys[this.controls.left]) {
            this.velocityX = -this.speed;
        }

        if (keys[this.controls.right]) {
            this.velocityX = this.speed;
        }

        // Jump
        if (
            keys[this.controls.jump] &&
            !this.isJumping
        ) {
            this.velocityY = -14;
            this.isJumping = true;
        }

        // Attack
        if (
            keys[this.controls.punch] &&
            this.attackCooldown <= 0
        ) {
            this.attack(10, 20);
        }

        if (
            keys[this.controls.kick] &&
            this.attackCooldown <= 0
        ) {
            this.attack(15, 30);
        }

        if (
            keys[this.controls.special] &&
            this.specialCooldown <= 0
        ) {
            this.specialAttack();
        }

        // Gravity
        this.velocityY += GRAVITY;

        this.x += this.velocityX;
        this.y += this.velocityY;

        // Floor collision
        if (this.y + this.height >= FLOOR) {
            this.y = FLOOR - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // Arena boundaries
        this.x = Math.max(
            0,
            Math.min(canvas.width - this.width, this.x)
        );

        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        if (this.specialCooldown > 0) {
            this.specialCooldown--;
        }

        if (this.attackTimer > 0) {
            this.attackTimer--;
        } else {
            this.isAttacking = false;
        }
    }

    attack(damage, range) {

        this.isAttacking = true;
        this.attackTimer = 10;
        this.attackCooldown = 25;

        const distance = Math.abs(
            this.x - opponent.x
        );

        if (distance < range + 70) {

            opponent.takeDamage(damage);

            opponent.x +=
                this.x < opponent.x ? 25 : -25;
        }
    }

    specialAttack() {

        this.isAttacking = true;
        this.attackTimer = 20;
        this.specialCooldown = 120;

        const distance = Math.abs(
            this.x - opponent.x
        );

        if (distance < 160) {

            opponent.takeDamage(25);

            opponent.x +=
                this.x < opponent.x ? 60 : -60;
        }
    }

    takeDamage(amount) {

        this.health -= amount;

        if (this.health < 0) {
            this.health = 0;
        }

        updateHealthBars();
    }

    draw() {

        // Shadow
        ctx.beginPath();
        ctx.ellipse(
            this.x + 25,
            FLOOR + 5,
            35,
            8,
            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        // Body
        ctx.fillStyle = this.color;

        ctx.fillRect(
            this.x,
            this.y + 30,
            this.width,
            70
        );

        // Head
        ctx.beginPath();

        ctx.arc(
            this.x + 25,
            this.y + 18,
            18,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#f1c27d";
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#111";

        ctx.fillRect(
            this.x + 17,
            this.y + 14,
            5,
            5
        );

        ctx.fillRect(
            this.x + 29,
            this.y + 14,
            5,
            5
        );

        // Arms
        ctx.fillStyle = this.color;

        ctx.fillRect(
            this.x - 15,
            this.y + 35,
            15,
            45
        );

        ctx.fillRect(
            this.x + this.width,
            this.y + 35,
            15,
            45
        );

        // Legs
        ctx.fillRect(
            this.x + 5,
            this.y + 100,
            15,
            35
        );

        ctx.fillRect(
            this.x + 30,
            this.y + 100,
            15,
            35
        );

        // Attack effect
        if (this.isAttacking) {

            ctx.beginPath();

            ctx.arc(
                this.x + 25,
                this.y + 50,
                55,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 5;
            ctx.stroke();
        }
    }
}

let player1;
let player2;

function createPlayers() {

    player1 = new Fighter(
        200,
        "#00eaff",
        "PLAYER 1",
        {
            left: "a",
            right: "d",
            jump: "w",
            punch: "f",
            kick: "g",
            special: "h"
        }
    );

    player2 = new Fighter(
        750,
        "#ff1744",
        "PLAYER 2",
        {
            left: "arrowleft",
            right: "arrowright",
            jump: "arrowup",
            punch: "j",
            kick: "k",
            special: "l"
        }
    );
}

function drawBackground() {

    // Sky
    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    gradient.addColorStop(0, "#09091a");
    gradient.addColorStop(1, "#252545");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Moon
    ctx.beginPath();

    ctx.arc(
        500,
        120,
        60,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ddd";
    ctx.fill();

    // Buildings
    ctx.fillStyle = "#101020";

    for (let i = 0; i < 10; i++) {

        const x = i * 110;
        const height = 100 + (i % 4) * 30;

        ctx.fillRect(
            x,
            FLOOR - height,
            80,
            height
        );
    }

    // Ground
    ctx.fillStyle = "#222";
    ctx.fillRect(
        0,
        FLOOR,
        canvas.width,
        canvas.height - FLOOR
    );

    ctx.strokeStyle = "#00eaff";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, FLOOR);
    ctx.lineTo(canvas.width, FLOOR);
    ctx.stroke();
}

function updateHealthBars() {

    player1HealthBar.style.width =
        player1.health + "%";

    player2HealthBar.style.width =
        player2.health + "%";
}

function checkWinner() {

    if (player1.health <= 0) {
        endGame("PLAYER 2 WINS!");
    }

    if (player2.health <= 0) {
        endGame("PLAYER 1 WINS!");
    }

    if (timer <= 0) {

        if (player1.health > player2.health) {
            endGame("PLAYER 1 WINS!");
        }
        else if (player2.health > player1.health) {
            endGame("PLAYER 2 WINS!");
        }
        else {
            endGame("DRAW!");
        }
    }
}

function endGame(message) {

    gameRunning = false;

    clearInterval(timerInterval);

    winnerText.textContent = message;

    gameOverScreen.classList.remove("hidden");
}

function startGame() {

    createPlayers();

    timer = 60;

    timerElement.textContent = timer;

    updateHealthBars();

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    gameRunning = true;

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        if (!gameRunning) return;

        timer--;

        timerElement.textContent = timer;

        checkWinner();

    }, 1000);

    gameLoop();
}

function gameLoop() {

    if (!gameRunning) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBackground();

    player1.update(player2);
    player2.update(player1);

    player1.draw();
    player2.draw();

    checkWinner();

    requestAnimationFrame(gameLoop);
}

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    startGame
);
```
