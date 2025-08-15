document.addEventListener('DOMContentLoaded', () => {
    // Game canvas setup
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start-btn');
    const scoreElement = document.getElementById('score');
    
    // Start screen modal elements
    const startScreenModal = document.getElementById('start-screen-modal');
    const startGameButton = document.getElementById('start-game-btn');
    const startHighScoreElement = document.getElementById('start-high-score');
    
    // Game over modal elements
    const gameOverModal = document.getElementById('game-over-modal');
    const finalScoreElement = document.getElementById('final-score');
    const highScoreElement = document.getElementById('high-score');
    const playAgainButton = document.getElementById('play-again-btn');
    
    // Mobile control buttons
    const upButton = document.getElementById('up-btn');
    const downButton = document.getElementById('down-btn');
    const leftButton = document.getElementById('left-btn');
    const rightButton = document.getElementById('right-btn');
    
    // Game constants
    const GRID_SIZE = 20;
    const GAME_SPEED = 100; // milliseconds
    
    // Game variables
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let gameRunning = false;
    let gameLoop;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    
    // Initialize game
    function initGame() {
        // Reset game state
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
        score = 0;
        scoreElement.textContent = score;
        direction = 'right';
        nextDirection = 'right';
        generateFood();
        if (gameLoop) clearInterval(gameLoop);
        
        // Hide modals
        startScreenModal.classList.remove('show');
        gameOverModal.classList.remove('show');
    }
    
    // Generate food at random position
    function generateFood() {
        const maxX = canvas.width / GRID_SIZE - 1;
        const maxY = canvas.height / GRID_SIZE - 1;
        
        // Generate random position
        let foodX, foodY;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            foodX = Math.floor(Math.random() * maxX);
            foodY = Math.floor(Math.random() * maxY);
            
            // Check if food is on snake
            for (let segment of snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        food = {x: foodX, y: foodY};
    }
    
    // Update game state
    function update() {
        // Update direction
        direction = nextDirection;
        
        // Calculate new head position
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Check for collisions
        if (checkCollision(head)) {
            gameOver();
            return;
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score += 10;
            scoreElement.textContent = score;
            
            // Generate new food
            generateFood();
        } else {
            // Remove tail if no food was eaten
            snake.pop();
        }
    }
    
    // Check for collisions
    function checkCollision(head) {
        // Check wall collision
        if (head.x < 0 || head.x >= canvas.width / GRID_SIZE ||
            head.y < 0 || head.y >= canvas.height / GRID_SIZE) {
            return true;
        }
        
        // Check self collision (skip the last segment as it will be removed)
        for (let i = 1; i < snake.length - 1; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    // Game over
    function gameOver() {
        clearInterval(gameLoop);
        gameRunning = false;
        startButton.textContent = 'Restart Game';
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Update modal with final scores
        finalScoreElement.textContent = score;
        highScoreElement.textContent = highScore;
        
        // Show the game over modal with animation
        gameOverModal.classList.add('show');
        
        // Add a dark overlay to the game canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Render game
    function render() {
        // Clear canvas
        ctx.fillStyle = '#a7b78f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            // Head is darker than body
            if (index === 0) {
                ctx.fillStyle = '#2e2e2e';
            } else {
                ctx.fillStyle = '#3e3e3e';
            }
            
            ctx.fillRect(
                segment.x * GRID_SIZE,
                segment.y * GRID_SIZE,
                GRID_SIZE - 1,
                GRID_SIZE - 1
            );
        });
        
        // Draw food
        ctx.fillStyle = '#e63946';
        ctx.fillRect(
            food.x * GRID_SIZE,
            food.y * GRID_SIZE,
            GRID_SIZE - 1,
            GRID_SIZE - 1
        );
    }
    
    // Game loop
    function gameStep() {
        update();
        render();
    }
    
    // Start game
    function startGame() {
        if (!gameRunning) {
            initGame();
            gameRunning = true;
            startButton.textContent = 'Game Running';
            gameLoop = setInterval(gameStep, GAME_SPEED);
        }
    }
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    startGameButton.addEventListener('click', () => {
        initGame();
        startGame();
    });
    playAgainButton.addEventListener('click', () => {
        initGame();
        startGame();
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    });
    
    // Mobile controls
    upButton.addEventListener('click', () => {
        if (direction !== 'down') nextDirection = 'up';
    });
    
    downButton.addEventListener('click', () => {
        if (direction !== 'up') nextDirection = 'down';
    });
    
    leftButton.addEventListener('click', () => {
        if (direction !== 'right') nextDirection = 'left';
    });
    
    rightButton.addEventListener('click', () => {
        if (direction !== 'left') nextDirection = 'right';
    });
    
    // Initialize start screen
    startHighScoreElement.textContent = highScore;
    
    // Initial render
    initGame();
    render();
});