This directory contains the required build files, a source code base and a tester Docker file.

Don't change the build files, because during the score calculation these will be used!
You can test the building and the solution code with the Dockerfile, but first you need to install Docker Desktop application!

Usage:
Place every provided file (Dockerfile, test.zip, build files) and the modified src.zip in one directory and open command line.
docker build --tag dt_maze_challenge .
docker run --rm -it dt_maze_challenge 2 visualize
	LEVEL: The tested level value. Valid values: 1-3
	visualize: Parameter is optional, if not passed then console logs out only the last stage of solving the maze



	/*  const exampleMaze = [
  [ 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 's', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x' ],
  [ 'x', ' ', 'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x' ],
  [ 'x', ' ', 'x', ' ', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', ' ', 'x', 'x', ' ', 'x' ],
  [ 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', 'x', ' ', 'x' ],
  [ 'x', 'x', 'x', 'x', 'x', ' ', 'x', ' ', 'x', 'x', 'x', 'x', 'x', ' ', 'x', ' ', 'x' ],
  [ 'x', ' ', 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' ', 'x', ' ', 'x', ' ', 'x' ],
  [ 'x', ' ', 'x', ' ', ' ', ' ', 'x', 'x', 'x', 'x', 'x', ' ', ' ', ' ', 'x', ' ', 'x' ],
  [ 'x', ' ', ' ', ' ', 'x', ' ', 'x', ' ', ' ', ' ', 'x', 'x', 'x', 'x', 'x', ' ', 'x' ],
  [ 'x', 'x', 'x', ' ', 'x', ' ', 'x', 'x', 'x', ' ', 'x', ' ', ' ', ' ', ' ', ' ', 'x' ],
  [ 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', 'x', ' ', 'x', ' ', 'x', 'x', 'x', ' ', 'x' ],
  [ 'x', ' ', 'x', 'x', 'x', 'x', 'x', ' ', 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', 'x' ],
  [ 'x', ' ', ' ', ' ', ' ', ' ', 'x', ' ', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x' ],
  [ 'x', 'x', 'x', 'x', 'x', ' ', 'x', ' ', ' ', ' ', ' ', ' ', ' ', 'h', ' ', ' ', 'x' ],
  [ 'x', ' ', ' ', ' ', 'x', ' ', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', ' ', 'x' ],
  [ 'x', ' ', 'x', ' ', 'x', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x' ],
  [ 'x', ' ', 'x', ' ', ' ', ' ', ' ', 'x', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' ', 'x' ],
  [ 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'e', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x' ]
  ]
 

  const exampleJson = {
    level: 3,
    start: [ 0, 8 ], 
    escape: [ 16, 8 ], 
    maze: exampleMaze
  }
    console.log(findPath(exampleJson))  */
 


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



/* console.log(json2xml([
  'D', 'L', 'L', 'L', 'L', 'L',
  'D', 'D', 'R', 'R', 'R', 'R',
  'R', 'D', 'D', 'L', 'L', 'L',
  'D', 'D', 'L', 'L', 'L', 'L',
  'D', 'D', 'D', 'D', 'R', 'R',
  'R', 'D', 'D', 'L', 'L', 'L',
  'D', 'D', 'R', 'R', 'R', 'R',
  'R', 'R', 'R', 'D'
])) */

