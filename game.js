const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Game variables
let paddleHeight = 15;
let paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleSpeed = 0; // Track paddle movement speed

let ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 2;
let ballSpeedY = -2;

let rightPressed = false;
let leftPressed = false;

const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 }; // Active bricks
    }
}

let score = 0;
let lives = 1;

// Initialize high score from localStorage
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;

// Sound effects
const paddleSound = new Audio('./sounds/paddle.wav');
const brickSound = new Audio('./sounds/brick.wav');
const gameOverSound = new Audio('./sounds/game-over.wav');

// Key handlers
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

// Draw paddle
function drawPaddle() {
    let previousPaddleX = paddleX;

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    paddleSpeed = paddleX - previousPaddleX; // Calculate paddle speed

    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
}

// Draw bricks
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Display high score
function drawHighScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('High Score: ' + highScore, canvas.width / 2 - 50, 20);
}

// Update high score
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

// Adjust ball speed based on remaining bricks
function adjustBallSpeed() {
    const totalBricks = brickRowCount * brickColumnCount;
    const remainingBricks = bricks.flat().filter(b => b.status === 1).length;

    const speedMultiplier = 1 + (totalBricks - remainingBricks) / totalBricks * 0.5;
    ballSpeedX = Math.sign(ballSpeedX) * (2 * speedMultiplier);
    ballSpeedY = Math.sign(ballSpeedY) * (2 * speedMultiplier);
}

// Detect ball collision with bricks
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                let brickLeft = b.x;
                let brickRight = b.x + brickWidth;
                let brickTop = b.y;
                let brickBottom = b.y + brickHeight;

                if (
                    ballX + ballRadius > brickLeft &&
                    ballX - ballRadius < brickRight &&
                    ballY + ballRadius > brickTop &&
                    ballY - ballRadius < brickBottom
                ) {
                    if (ballX - ballRadius < brickLeft || ballX + ballRadius > brickRight) {
                        ballSpeedX = -ballSpeedX;
                    } else {
                        ballSpeedY = -ballSpeedY;
                    }

                    b.status = 0;
                    score++;
                    brickSound.play();

                    adjustBallSpeed();

                    if (score === brickRowCount * brickColumnCount) {
                        updateHighScore();
                        alert('YOU WIN! High Score: ' + highScore);
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function detectPaddleCollision() {
    if (ballY + ballRadius >= canvas.height - paddleHeight && ballX >= paddleX && ballX <= paddleX + paddleWidth) {
        // Reverse vertical direction
        ballSpeedY = -ballSpeedY;

        // Reverse horizontal direction if paddle is moving opposite to the ball
        if ((paddleSpeed > 0 && ballSpeedX < 0) || (paddleSpeed < 0 && ballSpeedX > 0)) {
            ballSpeedX = -ballSpeedX;
        }

        paddleSound.play(); // Play paddle collision sound
    }
}


// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawHighScore();
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score, 8, 20);
    ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);

    collisionDetection();
    detectPaddleCollision();

    if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY + ballSpeedY < ballRadius) {
        ballSpeedY = -ballSpeedY;
    } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
        lives--;
        if (!lives) {
            gameOverSound.play();
            updateHighScore();
            alert('GAME OVER! Your Score: ' + score + ' | High Score: ' + highScore);
            document.location.reload();
        } else {
            resetBall();
            paddleX = (canvas.width - paddleWidth) / 2;
        }
    }

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    requestAnimationFrame(draw);
}

// Reset ball to starting position
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballSpeedX = (Math.random() * 4 - 2);
    ballSpeedY = -2;
}

draw();
