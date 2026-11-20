# Maze Escape Solver

An optimal solver for **[Code In – Way Out: Hack the Maze](https://www.mphacks.hu/codein-wayout/)**, an online hackathon by Deutsche Telekom IT Solutions (25 June – 5 July 2024), written in TypeScript.
It reads a 17×17 maze as XML, plans the fewest actions (steps, trap triggers and district rotations) that reach the exit, and prints them in the XML format the challenge's test engine expects.

**Documentation and interactive replay:** https://mazsola739.github.io/rika-hacka/

## Results

| Example maze | Adds | Actions | First version |
|---|---|---|---|
| Level 1 | walls | 11 | 11 |
| Level 2 | traps | 17 | 21 |
| Level 3 | district rotation | 8 | unsolved |

The solver was also run on 450 random mazes. The challenge's own test engine accepted every answer; wherever a brute-force reference could finish (204 mazes), the action count matched the true minimum. The slowest maze took 195 ms.

## How it works, in short

- **Parsing** reads the whole XML string with regular expressions, so formatting doesn't matter.
- **A\* search** over (cell, orientation of the 9 districts, removed traps). Rotations are only planned right before the step that passes through or lands in that district, which keeps the search small without losing optimality.
- **Reduced maze:** every district except the player's own can be rotated at any time, so reachability only depends on (cell, own district orientation, removed traps). This gives an exact "is there a way out" check and a consistent A* heuristic.

The full write-up, with the rules, the algorithm and the verification, is on the [documentation page](https://mazsola739.github.io/rika-hacka/).

## Repository layout

| Path | What it is |
|---|---|
| `src/` | The solver: `solution.ts` (entry point), `xml2json.ts`, `pathfinder.ts`, `json2xml.ts` |
| `src.zip` | The submission: the `src/` folder, zipped |
| `Dockerfile`, `test.zip`, `tsconfig.json`, `package.json` | The challenge's build and test files (unchanged) |
| `test/` | The challenge's test engine and the three example mazes |
| `docs/index.html` | The documentation page served by GitHub Pages |

## Build and run

With Docker, using the challenge's own build (level 1–3, `visualize` redraws the maze after every action):

```bash
docker build --tag dt_maze_challenge .
docker run --rm -it dt_maze_challenge 3 visualize
```

Without Docker:

```bash
npm install
npx -p typescript@4.9.5 tsc
node dist/solution.js "$(cat test/example_maze_3.txt)"
```

---

Code In – Way Out: Hack the Maze was an online hackathon by Deutsche Telekom IT Solutions. This repository is one participant's solution, not an official Telekom project.
