document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 16;
    const grid = document.getElementById('grid');
    const setupBtn = document.getElementById('setup-btn');
    const resetBtn = document.getElementById('reset-btn');
    const levelDisplay = document.getElementById('level-display');
    const scoreDisplay = document.getElementById('score-display');
    const highScoreDisplay = document.getElementById('high-score-display');

    // Always start in play mode (setupMode = false)
    let setupMode = false;

    // Track last clicked cell for shift-click functionality
    let lastClickedRow = null;
    let lastClickedCol = null;

    // Initialize high score from localStorage or set to 0
    let highScore = parseFloat(localStorage.getItem('highScore')) || 0;

    // Create a 2D array to track markers
    const markers = Array(gridSize).fill().map(() => Array(gridSize).fill(false));

    // Create the grid cells
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Click behavior based on marker presence, setup mode, and shift key
            cell.addEventListener('click', (e) => {
                if (setupMode) {
                    // If shift is pressed and we have a last clicked cell
                    if (e.shiftKey && lastClickedRow !== null && lastClickedCol !== null) {
                        // Calculate rectangle bounds based on last clicked cell and current cell
                        const startRow = Math.min(lastClickedRow, row);
                        const endRow = Math.max(lastClickedRow, row);
                        const startCol = Math.min(lastClickedCol, col);
                        const endCol = Math.max(lastClickedCol, col);

                        // Toggle all cells in the rectangle
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startCol; c <= endCol; c++) {
                                // Toggle marker state
                                if (markers[r][c]) {
                                    removeMarker(r, c);
                                } else {
                                    addMarker(r, c);
                                }
                            }
                        }

                        // Update the level after toggling all cells
                        updateLevel();
                    } else {
                        // Regular setup mode click - toggle single marker
                        if (markers[row][col]) {
                            removeMarker(row, col);
                        } else {
                            addMarker(row, col);
                        }
                        updateLevel();
                    }

                    // Always update last clicked position
                    lastClickedRow = row;
                    lastClickedCol = col;

                } else {
                    // Regular gameplay mode
                    // If there's a marker in this square, do split (left click) behavior
                    // If there's no marker, do join (right click) behavior
                    if (markers[row][col]) {
                        handleLeftClick(row, col);
                    } else {
                        handleRightClick(row, col);
                    }

                    // Reset last clicked position when in play mode
                    lastClickedRow = null;
                    lastClickedCol = null;
                }
            });

            // Keep right-click functionality for desktop users, but prevent context menu
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Prevent context menu
                if (!setupMode) {
                    handleRightClick(row, col);
                }
            });

            grid.appendChild(cell);
        }
    }

    // Function to handle left mouse click (split marker)
    function handleLeftClick(row, col) {
        // Check if this square has a marker
        if (markers[row][col]) {
            // Check if both target squares (above and right) are empty
            const canMoveUp = row > 0 && !markers[row-1][col];
            const canMoveRight = col < gridSize-1 && !markers[row][col+1];

            // Only proceed if both target squares are empty
            if (canMoveUp && canMoveRight) {
                // Remove current marker
                removeMarker(row, col);

                // Add marker above
                addMarker(row-1, col);

                // Add marker to the right
                addMarker(row, col+1);

                // Update level
                updateLevel();
            }
        }
    }

    // Function to handle right mouse click (join markers)
    function handleRightClick(row, col) {
        // Only proceed if current square is empty
        if (!markers[row][col]) {
            // Check if both source squares (above and right) have markers
            const hasMarkerAbove = row > 0 && markers[row-1][col];
            const hasMarkerRight = col < gridSize-1 && markers[row][col+1];

            // Only proceed if both source squares have markers
            if (hasMarkerAbove && hasMarkerRight) {
                // Remove marker above
                removeMarker(row-1, col);

                // Remove marker to the right
                removeMarker(row, col+1);

                // Add marker to current square
                addMarker(row, col);

                // Update level
                updateLevel();
            }
        }
    }

    // Function to add a marker
    function addMarker(row, col) {
        if (!markers[row][col]) {
            markers[row][col] = true;
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

            // Create marker element if it doesn't exist
            if (!cell.querySelector('.marker')) {
                const marker = document.createElement('div');
                marker.className = 'marker';
                cell.appendChild(marker);
            }
        }
    }

    // Function to remove a marker
    function removeMarker(row, col) {
        if (markers[row][col]) {
            markers[row][col] = false;
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            const marker = cell.querySelector('.marker');

            if (marker) {
                cell.removeChild(marker);
            }
        }
    }

    // Function to calculate and update the current level and score
    function updateLevel() {
        let minDistance = Infinity;
        let hasMarkers = false;

        // Calculate the minimum Manhattan distance from (15, 0)
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (markers[row][col]) {
                    hasMarkers = true;
                    // Calculate Manhattan distance from bottom left (15, 0)
                    // Note: y-axis is flipped in browser coordinates (0 is top)
                    const manhattanDistance = (15 - row) + col;
                    minDistance = Math.min(minDistance, manhattanDistance);
                }
            }
        }

        // Handle case where there are no markers
        const level = hasMarkers ? minDistance : 0;

        // Calculate score based on level and empty spaces in the current diagonal
        const score = calculateScore(level);

        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore.toString());
        }

        // Update the displays
        levelDisplay.textContent = `L ${level}`;
        scoreDisplay.textContent = `S ${score.toFixed(2)}`;
        highScoreDisplay.textContent = `H ${highScore.toFixed(2)}`;

        // Highlight the diagonal corresponding to the current level
        highlightDiagonal(level);
    }

    // Function to calculate score based on level and empty spaces in diagonal
    function calculateScore(level) {
        if (level === 0) return 0;

        let totalSquaresInDiagonal = 0;
        let markersInDiagonal = 0;

        // Count total squares and markers in the current level's diagonal
        for (let row = 0; row < gridSize; row++) {
            let col = level - (15 - row);
            // Only count if the column is within the grid
            if (col >= 0 && col < gridSize) {
                totalSquaresInDiagonal++;
                if (markers[row][col]) {
                    markersInDiagonal++;
                }
            }
        }

        // Calculate the fraction of empty squares in the diagonal
        const emptyFraction = (totalSquaresInDiagonal - markersInDiagonal) / totalSquaresInDiagonal;

        // Score is level plus fraction of empty squares
        return level + emptyFraction;
    }

    // Function to highlight diagonal cells corresponding to the current level
    function highlightDiagonal(level) {
        // Reset all cells to default background color
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('diagonal-highlight');
        });

        // Special case for level 0 - highlight just the bottom-left corner cell
        if (level === 0) {
            const cornerCell = document.querySelector(`.cell[data-row="15"][data-col="0"]`);
            if (cornerCell) {
                cornerCell.classList.add('diagonal-highlight');
            }
            return;
        }

        // Highlight cells where (15-row) + col = level
        for (let row = 0; row < gridSize; row++) {
            let col = level - (15 - row);
            // Only highlight if the column is within the grid
            if (col >= 0 && col < gridSize) {
                const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.add('diagonal-highlight');
                }
            }
        }
    }

    // Function to initialize the starting marker in the lower left corner
    function initializeMarkers() {
        // Clear all markers first
        clearAllMarkers();

        // Add marker at the lower left corner (row 15, col 0)
        addMarker(15, 0);

        // Update level and highlight diagonal
        updateLevel();
    }

    // Function to clear all markers from the grid
    function clearAllMarkers() {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (markers[row][col]) {
                    removeMarker(row, col);
                }
            }
        }
    }

    // Initialize setup button appearance - always shows "Setup" in play mode
    setupBtn.style.backgroundColor = '#2196F3'; // Blue for setup button
    setupBtn.textContent = 'Setup';

    // Setup/Play button event listener
    setupBtn.addEventListener('click', () => {
        // Toggle setup mode
        setupMode = !setupMode;

        // Update the button appearance based on mode - shows what mode you can switch to
        if (setupMode) {
            // In setup mode, button shows "Play" to return to play mode
            setupBtn.style.backgroundColor = '#4CAF50'; // Green for play button
            setupBtn.textContent = 'Play';
        } else {
            // When exiting setup mode, reset high score to 0
            highScore = 0;
            localStorage.setItem('highScore', '0');
            highScoreDisplay.textContent = `H 0.00`;

            // Reset last clicked position when exiting setup mode
            lastClickedRow = null;
            lastClickedCol = null;

            // In play mode, button shows "Setup" to enter setup mode
            setupBtn.style.backgroundColor = '#2196F3'; // Blue for setup button
            setupBtn.textContent = 'Setup';
        }
    });

    // Reset button event listener
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to start over?')) {
            initializeMarkers();

            // Exit setup mode if active
            if (setupMode) {
                setupMode = false;
                setupBtn.style.backgroundColor = '#2196F3';
                setupBtn.textContent = 'Setup';

                // Reset last clicked position
                lastClickedRow = null;
                lastClickedCol = null;
            }
        }
    });

    // Initialize the board
    initializeMarkers();
});
