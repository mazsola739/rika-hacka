import { xml2json } from './xml2json.js';
import { findPath } from './pathfinder.js';
import { json2xml } from './json2xml.js';
const args = process.argv;
const mazeXml = args[2];
const json = xml2json(mazeXml);
const path = findPath(json);
const actionsXml = json2xml(path);
console.log(actionsXml);
