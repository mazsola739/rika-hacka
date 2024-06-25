const direction = "DLRU";


const directionRow = [1, 0, 0, -1];
const directionColumn = [0, -1, 1, 0];


const isValid = (row, column, maze) => {
    return row >= 0 && column >= 0 && row < 17 && column < 17
        && maze[row][column] === 1
}

// Function to get all valid paths
const pathFinder = (row, column, maze, escapeRow, escapeColumn, answer, currentPath) => {

    if (row === escapeRow && column === escapeColumn) {
        answer.push(currentPath)
        return
    }

    maze[row][column] = 0

    for (let i = 0; i < 4; i++) {

        const nextRow = row + directionRow[i]
        const nextColumn = column + directionColumn[i]

        if (isValid(nextRow, nextColumn, maze)) {
            currentPath += direction[i]

            pathFinder(nextRow, nextColumn, maze, escapeRow, escapeColumn, answer, currentPath);
            currentPath = currentPath.slice(0, -1);
        }
    }

    maze[row][column] = 1
}


// Array to store all the valid paths
const result = [];
// Store current path
let currentPath = "";

if (maze[0][0] !== 0 && maze[17 - 1][17 - 1] !== 0) {
    // Function call to get all valid paths
    pathFinder(0, 0, maze, 16, 16, result, currentPath);
}

if (result.length === 0)
    console.log(-1);
else
    console.log(result.join(" "));