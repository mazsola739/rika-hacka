const isValid = (row, col, n, maze) => {
    return row >= 0 && col >= 0 && row < n && col < n
        && maze[row][col] === 1;
}

const pathfinder = (row, col, maze, n, ans, currentPath) => {
if (row === n - 1 && col === n - 1) {
        ans.push(currentPath);
        return;
    }
    // Mark the current cell as blocked
    maze[row][col] = 0;

    for (let i = 0; i < 4; i++) {
        // Find the next row based on the current row (row)
        // and the dr[] array
        const nextrow = row + dr[i];
        // Find the next column based on the current column
        // (col) and the dc[] array
        const nextcol = col + dc[i];

        // Check if the next cell is valid or not
        if (isValid(nextrow, nextcol, n, maze)) {
            currentPath += direction[i];
            // Recursively call the findPath function for
            // the next cell
            findPath(nextrow, nextcol, maze, n, ans, currentPath);
            // Remove the last direction when backtracking
            currentPath = currentPath.slice(0, -1);
        }
    }
    // Mark the current cell as unblocked
    maze[row][col] = 1;
}

const result = [];
// Store current path
let currentPath = "";

if (maze[0][0] !== 0 && maze[17 - 1][17 - 1] !== 0) {
    // Function call to get all valid paths
    findPath(0, 0, maze, n, result, currentPath);
}

if (result.length === 0)
    console.log(-1);
else
    console.log(result.join(" "));

