const direction = ["MD", "ML", "MR", "MU"];
const directionRow = [1, 0, 0, -1];
const directionColumn = [0, -1, 1, 0];
const isValid = (row, column, maze, disarmedTraps) => {
    return (row >= 0 &&
        column >= 0 &&
        row < maze.length &&
        column < maze[0].length &&
        (maze[row][column] === " " || maze[row][column] === "e" || disarmedTraps.has(`${row},${column}`)));
};
// Breadth-first search
export const findPath = (json) => {
    const { start, escape, maze } = json;
    let queue = [[start[0], start[1], [], new Set()]];
    maze[start[0]][start[1]] = "o";
    while (queue.length > 0) {
        let [row, column, path, disarmedTraps] = queue.shift();
        if (row === escape[0] && column === escape[1]) {
            return path;
        }
        for (let i = 0; i < 4; i++) {
            const nextRow = row + directionRow[i];
            const nextColumn = column + directionColumn[i];
            if (maze[nextRow] && maze[nextRow][nextColumn] === "h" && !disarmedTraps.has(`${nextRow},${nextColumn}`)) {
                let newDisarmedTraps = new Set(disarmedTraps);
                newDisarmedTraps.add(`${nextRow},${nextColumn}`);
                queue.push([start[0], start[1], [...path, direction[i], ...path, direction[i]], newDisarmedTraps]);
            }
            else if (isValid(nextRow, nextColumn, maze, disarmedTraps)) {
                queue.push([nextRow, nextColumn, [...path, direction[i]], disarmedTraps]);
                maze[nextRow][nextColumn] = "o";
            }
        }
    }
    return [];
};
/* const isValid = (row: number, column: number, maze: Maze) => {
  return (
    row >= 0 &&
    column >= 0 &&
    row < maze.length &&
    column < maze[0].length &&
    (maze[row][column] === " " || maze[row][column] === "e")
  )
}

// Breadth-first search
export const findPath = (json: Json) => {
  const {start, escape, maze} = json
  let queue: Queue = [[start[0], start[1], []]]
  maze[start[0]][start[1]] = "o"

  while (queue.length > 0) {
    let [row, column, path]: Path = queue.shift()!

    if (row === escape[0] && column === escape[1]) {
      return path
    }

    for (let i = 0; i < 4; i++) {
      const nextRow = row + directionRow[i]
      const nextColumn = column + directionColumn[i]

      if (isValid(nextRow, nextColumn, maze)) {
        queue.push([nextRow, nextColumn, [...path, direction[i]]])
        maze[nextRow][nextColumn] = "o"
      } else {
        //trap
      }
    }
  }

  return []
} */
/* const exampleMaze = [
    [ 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w' ],
    [ 'w', ' ', ' ', ' ', ' ', 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w' ],
    [ 'w', 'w', 'w', 'w', ' ', 'w', ' ', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', ' ', 'w' ],
    [ 'w', ' ', ' ', ' ', ' ', 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w', 'w', 'w' ],
    [ 'w', ' ', 'w', 'w', 'w', 'w', ' ', 'w', 'w', 'w', 'w', 'w', 'w', ' ', ' ', ' ', 'w' ],
    [ 'w', ' ', 'w', ' ', ' ', ' ', ' ', 'w', ' ', ' ', ' ', ' ', 'w', 'w', 'w', ' ', 'w' ],
    [ 'w', ' ', 'w', ' ', 'w', 'w', 'w', 'w', ' ', ' ', 'w', ' ', 'w', ' ', ' ', ' ', 'e' ],
    [ 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', ' ', ' ', 'w', ' ', 'w', ' ', 'w', 'w', 'w' ],
    [ 's', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', ' ', ' ', 'w' ],
    [ 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', 'w', 'w', 'w', 'w' ],
    [ 'w', ' ', 'w', ' ', ' ', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', ' ', ' ', 'w' ],
    [ 'w', ' ', ' ', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', ' ', ' ', 'w' ],
    [ 'w', 'w', 'w', 'w', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', 'w', 'w', ' ', 'w' ],
    [ 'w', ' ', ' ', ' ', ' ', ' ', 'w', ' ', 'w', ' ', 'w', ' ', ' ', ' ', ' ', ' ', 'w' ],
    [ 'w', ' ', 'w', 'w', 'w', 'w', 'w', ' ', 'w', ' ', 'w', 'w', 'w', 'w', 'w', 'w', 'w' ],
    [ 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w' ],
    [ 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w' ]
  ]
  const exampleJson = {
    level: 0,
    start: [ 8, 0 ],
    escape: [ 6, 16 ],
    maze: exampleMaze
  }

console.log(findPath(exampleJson))
 */
/*   const exampleMaze = [
 [ 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 's', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x' ],
 [ 'x', ' ', 'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', 'x' ],
 [ 'x', ' ', 'x', ' ', 'x', 'x', 'x', 'x', 'x', 'x', ' ', 'x', ' ', 'x', 'x', ' ', 'x' ],
 [ 'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', 'x', ' ', 'x' ],
 [ 'x', 'x', 'x', ' ', 'x', 'x', 'x', 'x', ' ', 'x', ' ', 'x', 'x', ' ', 'x', ' ', 'x' ],
 [ 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', 'x', ' ', ' ', 'x', ' ', 'x', ' ', 'x' ],
 [ 'x', 'x', 'x', 'x', 'x', ' ', 'x', 'x', 'x', 'x', 'x', 'x', 'x', ' ', 'x', ' ', 'x' ],
 [ 'x', ' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', 'x', ' ', 'x' ],
 [ 'x', ' ', 'x', 'x', 'x', 'x', 'x', ' ', 'x', 'x', 'x', ' ', 'x', 'x', 'x', ' ', 'x' ],
 [ 'x', ' ', 'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', 'x' ],
 [ 'x', ' ', 'x', 'x', 'x', 'x', 'x', 'h', 'x', 'x', 'x', 'x', 'x', ' ', 'x', 'x', 'x' ],
 [ 'x', ' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', 'x' ],
 [ 'x', 'x', 'x', 'x', ' ', 'x', ' ', 'x', 'x', 'x', ' ', 'x', 'x', 'x', 'x', ' ', 'x' ],
 [ 'x', ' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', 'x', ' ', 'x' ],
 [ 'x', ' ', 'x', 'x', 'x', 'x', 'x', ' ', 'x', 'x', 'x', 'x', 'x', ' ', 'x', ' ', 'x' ],
 [ 'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'h', ' ', ' ', ' ', 'x' ],
 [ 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'e', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x' ]
]

  const exampleJson = {
    level: 2,
    start: [ 0, 8 ],
    escape: [ 16, 8 ],
    maze: exampleMaze
  }
    console.log(findPath(exampleJson)) */
/* const rotateDistrict = (district, direction) => {
  let rotated = Array.from({ length: 5 }, () => Array(5).fill(0))

  if (direction === 'left') {
      for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
              rotated[5 - j - 1][i] = district[i][j]
          }
      }
  } else if (direction === 'right') {
      for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
              rotated[j][5 - i - 1] = district[i][j]
          }
      }
  }

  return rotated
} */
