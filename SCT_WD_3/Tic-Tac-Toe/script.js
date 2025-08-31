        document.addEventListener('DOMContentLoaded', () => {
            const homeScreen = document.getElementById('homeScreen');
            const gameScreen = document.getElementById('gameScreen');
            const pvpBtn = document.getElementById('pvpBtn');
            const pvcBtn = document.getElementById('pvcBtn');
            const homeBtn = document.getElementById('homeBtn');
            const gameMode = document.getElementById('gameMode');
            const board = document.getElementById('board');
            const cells = document.querySelectorAll('.cell');
            const status = document.getElementById('status');
            const resetBtn = document.getElementById('resetBtn');
            const scoreX = document.getElementById('scoreX');
            const scoreO = document.getElementById('scoreO');
            const scoreDraw = document.getElementById('scoreDraw');
            const resultMessage = document.getElementById('resultMessage');
            const player1Label = document.getElementById('player1Label');
            const player2Label = document.getElementById('player2Label');

            let currentMode = '';
            let currentPlayer = 'X';
            let gameState = ['', '', '', '', '', '', '', '', ''];
            let gameActive = false;
            let scores = {
                X: 0,
                O: 0,
                draw: 0
            };

            const winningConditions = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];

            pvpBtn.addEventListener('click', () => {
                startGame('pvp');
            });

            pvcBtn.addEventListener('click', () => {
                startGame('pvc');
            });

            homeBtn.addEventListener('click', () => {
                showHomeScreen();
            });

            resetBtn.addEventListener('click', resetGame);

            cells.forEach(cell => {
                cell.addEventListener('click', () => handleCellClick(cell));
            });

            function startGame(mode) {
                currentMode = mode;
                gameActive = true;
                currentPlayer = 'X';
                gameState = ['', '', '', '', '', '', '', '', ''];
                cells.forEach(cell => {
                    cell.textContent = '';
                    cell.classList.remove('x', 'o');
                });

                scores = {
                    X: 0,
                    O: 0,
                    draw: 0
                };
                updateScoreBoard();

                if (mode === 'pvp') {
                    gameMode.textContent = 'Player vs Player';
                    player1Label.textContent = 'Player 1';
                    player2Label.textContent = 'Player 2';
                    status.textContent = `Player 1's turn`;
                } else {
                    gameMode.textContent = 'Player vs Computer';
                    player1Label.textContent = 'You';
                    player2Label.textContent = 'Computer';
                    status.textContent = `Your turn`;
                }

                homeScreen.classList.add('hidden');
                gameScreen.classList.remove('hidden');
                hideResultMessage();
            }

            function showHomeScreen() {
                homeScreen.classList.remove('hidden');
                gameScreen.classList.add('hidden');
            }

            function handleCellClick(cell) {
                const index = cell.getAttribute('data-index');

                if (gameState[index] !== '' || !gameActive) {
                    return;
                }

                updateCell(cell, index);
                checkGameResult();

                if (gameActive && currentMode === 'pvc' && currentPlayer === 'O') {
                    setTimeout(() => {
                        makeComputerMove();
                        checkGameResult();
                    }, 500);
                }
            }

            function updateCell(cell, index) {
                gameState[index] = currentPlayer;
                cell.textContent = currentPlayer;
                cell.classList.add(currentPlayer.toLowerCase());

                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                
                if (currentMode === 'pvp') {
                    status.textContent = `Player ${currentPlayer === 'X' ? '1' : '2'}'s turn`;
                } else {
                    status.textContent = currentPlayer === 'X' ? 'Your turn' : 'Computer is thinking...';
                }
            }

            function makeComputerMove() {
                for (let i = 0; i < gameState.length; i++) {
                    if (gameState[i] === '') {
                        gameState[i] = 'O';
                        
                        if (checkWinner('O')) {
                            const cell = document.querySelector(`.cell[data-index="${i}"]`);
                            cell.textContent = 'O';
                            cell.classList.add('o');
                            return;
                        }
                        
                        gameState[i] = '';
                    }
                }

                for (let i = 0; i < gameState.length; i++) {
                    if (gameState[i] === '') {
                        gameState[i] = 'X';
                        
                        if (checkWinner('X')) {
                            gameState[i] = 'O';
                            const cell = document.querySelector(`.cell[data-index="${i}"]`);
                            cell.textContent = 'O';
                            cell.classList.add('o');
                            currentPlayer = 'X';
                            status.textContent = 'Your turn';
                            return;
                        }
                        
                        gameState[i] = '';
                    }
                }

                if (gameState[4] === '') {
                    gameState[4] = 'O';
                    const cell = document.querySelector('.cell[data-index="4"]');
                    cell.textContent = 'O';
                    cell.classList.add('o');
                    currentPlayer = 'X';
                    status.textContent = 'Your turn';
                    return;
                }

                const emptyCells = [];
                gameState.forEach((cell, index) => {
                    if (cell === '') {
                        emptyCells.push(index);
                    }
                });

                if (emptyCells.length > 0) {
                    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                    gameState[randomIndex] = 'O';
                    const cell = document.querySelector(`.cell[data-index="${randomIndex}"]`);
                    cell.textContent = 'O';
                    cell.classList.add('o');
                    currentPlayer = 'X';
                    status.textContent = 'Your turn';
                }
            }

            function checkWinner(player) {
                return winningConditions.some(condition => {
                    return condition.every(index => {
                        return gameState[index] === player;
                    });
                });
            }

            function checkGameResult() {
                let roundWon = false;
                let winningPlayer = '';

                for (let i = 0; i < winningConditions.length; i++) {
                    const [a, b, c] = winningConditions[i];
                    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                        roundWon = true;
                        winningPlayer = gameState[a];
                        break;
                    }
                }

                if (roundWon) {
                    if (currentMode === 'pvp') {
                        showResultMessage(`Player ${winningPlayer === 'X' ? '1' : '2'} wins!`, 'win');
                    } else {
                        if (winningPlayer === 'X') {
                            showResultMessage('You won!', 'win');
                        } else {
                            showResultMessage('Computer won!', 'win');
                        }
                    }
                    
                    scores[winningPlayer]++;
                    updateScoreBoard();
                    gameActive = false;
                    return;
                }

                if (!gameState.includes('')) {
                    showResultMessage(`Game ended in a draw!`, 'draw');
                    scores.draw++;
                    updateScoreBoard();
                    gameActive = false;
                    return;
                }
            }

            function showResultMessage(message, type) {
                resultMessage.textContent = message;
                resultMessage.className = 'result-message ' + type;
                resultMessage.classList.remove('hidden');
                status.textContent = 'Game Over';
            }

            function hideResultMessage() {
                resultMessage.classList.add('hidden');
            }

            function updateScoreBoard() {
                scoreX.textContent = scores.X;
                scoreO.textContent = scores.O;
                scoreDraw.textContent = scores.draw;
            }

            function resetGame() {
                gameActive = true;
                currentPlayer = 'X';
                gameState = ['', '', '', '', '', '', '', '', ''];
                
                if (currentMode === 'pvp') {
                    status.textContent = `Player 1's turn`;
                } else {
                    status.textContent = 'Your turn';
                }
                
                cells.forEach(cell => {
                    cell.textContent = '';
                    cell.classList.remove('x', 'o');
                });
                hideResultMessage();
            }

            updateScoreBoard();
        });
    