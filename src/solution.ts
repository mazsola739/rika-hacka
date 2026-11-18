import { xml2json } from './xml2json.js'
import { findPath, MazeAction } from './pathfinder.js'
import { json2xml } from './json2xml.js'

// The tester runs: node dist/solution.js "<Maze>...</Maze>"
// and reads the Actions XML from stdout, so nothing else may be printed there.
const mazeXml = process.argv[2] ?? ''

let actions: MazeAction[] = []
try {
  actions = findPath(xml2json(mazeXml))
} catch {
  actions = []
}

console.log(json2xml(actions))
