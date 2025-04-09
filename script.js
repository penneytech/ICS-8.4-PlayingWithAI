// --- Constants ---
const BOARD_SIZE = 12;
const CONNECT_N = 6; // Number of symbols in a row needed to win
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

// --- DOM Elements ---
const statusDisplay = document.getElementById('statusArea');
const gameBoard = document.getElementById('gameBoard');
// Cells will be selected after creation
let cells = []; // Array to hold cell elements after creation
const restartButton = document.getElementById('restartButton');
const scoreXDisplay = document.getElementById('scoreXDisplay');
const scoreODisplay = document.getElementById('scoreODisplay');
const playerXColorInput = document.getElementById('playerXColor');
const playerOColorInput = document.getElementById('playerOColor');
const rootStyles = document.documentElement.style;

// --- Game State Variables ---
let gameActive = true;
let currentPlayer = "X";
let gameState = Array(TOTAL_CELLS).fill(""); // Initialize 144 empty strings
let scoreX = 0;
let scoreO = 0;

// --- Messages ---
const winningMessage = () => `Player ${currentPlayer} has won!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `Player ${currentPlayer}'s turn`;

// --- Functions ---

// Create the 12x12 board dynamically
function createBoard() {
    gameBoard.innerHTML = ''; // Clear previous board
    cells = []; // Reset the cells array
    for (let i = 0; i < TOTAL_CELLS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-cell-index', i);
        cell.addEventListener('click', handleCellClick); // Add listener here
        gameBoard.appendChild(cell);
        cells.push(cell); // Store cell reference
    }
}

// Update the score display UI
function updateScoreDisplay() {
    scoreXDisplay.textContent = `X: ${scoreX}`;
    scoreODisplay.textContent = `O: ${scoreO}`;
}

// Update player colors
function updatePlayerColors() {
    const colorX = playerXColorInput.value;
    const colorO = playerOColorInput.value;
    rootStyles.setProperty('--player-x-color', colorX);
    rootStyles.setProperty('--player-o-color', colorO);
}

// Function to handle a cell being played
function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    // Make cell unclickable after played (important with event delegation OR individual listeners)
    // clickedCell.removeEventListener('click', handleCellClick); // Option 1: Remove listener
    // Option 2 (used here): Logic in handleCellClick prevents action
}

// Function to switch the player
function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerHTML = currentPlayerTurn();
}

// *** NEW Win Condition Check Logic ***
function checkWin(clickedCellIndex) {
    const row = Math.floor(clickedCellIndex / BOARD_SIZE);
    const col = clickedCellIndex % BOARD_SIZE;
    const player = gameState[clickedCellIndex]; // Should be currentPlayer

    // Directions to check: [dRow, dCol]
    const directions = [
        [0, 1],  // Horizontal ->
        [1, 0],  // Vertical   \/
        [1, 1],  // Diagonal   \
        [1, -1]  // Diagonal   / (check from top-right to bottom-left)
    ];

    for (const [dRow, dCol] of directions) {
        let count = 1; // Start with the clicked cell itself

        // Check in the positive direction (e.g., right, down, down-right, down-left)
        for (let i = 1; i < CONNECT_N; i++) {
            const newRow = row + i * dRow;
            const newCol = col + i * dCol;
            const newIndex = newRow * BOARD_SIZE + newCol;

            // Check boundaries and if the cell belongs to the current player
            if (newRow >= 0 && newRow < BOARD_SIZE &&
                newCol >= 0 && newCol < BOARD_SIZE &&
                gameState[newIndex] === player) {
                count++;
            } else {
                break; // Stop counting in this direction
            }
        }

        // Check in the negative direction (e.g., left, up, up-left, up-right)
        for (let i = 1; i < CONNECT_N; i++) {
            const newRow = row - i * dRow;
            const newCol = col - i * dCol;
            const newIndex = newRow * BOARD_SIZE + newCol;

             // Check boundaries and if the cell belongs to the current player
            if (newRow >= 0 && newRow < BOARD_SIZE &&
                newCol >= 0 && newCol < BOARD_SIZE &&
                gameState[newIndex] === player) {
                count++;
            } else {
                break; // Stop counting in this direction
            }
        }

        // Did we find enough consecutive symbols?
        if (count >= CONNECT_N) {
            return true; // Winner found
        }
    }

    return false; // No win condition met
}


// Function to validate result after a move
function handleResultValidation(clickedCellIndex) {
    const roundWon = checkWin(clickedCellIndex);

    // --- Handle Win ---
    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        if (currentPlayer === 'X') scoreX++; else scoreO++;
        updateScoreDisplay();
        gameActive = false;
        return;
    }

    // --- Handle Draw ---
    // A draw is extremely unlikely on 12x12 but check anyway
    let roundDraw = !gameState.includes("");
    if (roundDraw) { // No need for !roundWon check here, win is checked first
        statusDisplay.innerHTML = drawMessage();
        gameActive = false;
        return;
    }

    // --- Continue Game: Switch Player ---
    handlePlayerChange();
}

// Function to handle a click on a cell
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    // Is the cell already filled or game inactive?
    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation(clickedCellIndex); // Pass index to validation
}

// Function to restart the game
function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = Array(TOTAL_CELLS).fill(""); // Reset game state array
    statusDisplay.innerHTML = currentPlayerTurn();
    // Clear the visual board
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('x', 'o');
        // Optional: Re-add listener if it was removed in handleCellPlayed
        // cell.addEventListener('click', handleCellClick);
    });
    // Scores are NOT reset
}

// --- Event Listeners ---
// Board listeners are added in createBoard
restartButton.addEventListener('click', handleRestartGame);
playerXColorInput.addEventListener('input', updatePlayerColors);
playerOColorInput.addEventListener('input', updatePlayerColors);

// --- Initial Setup ---
createBoard(); // Create the initial board
updateScoreDisplay();
updatePlayerColors();
statusDisplay.innerHTML = currentPlayerTurn();