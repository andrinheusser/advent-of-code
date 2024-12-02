import { Coords } from "../../utils/Grid.ts";
import { loadFile, splitLines, timedSolution } from "../../utils/utils.ts";

function parse(lines: string[]): { start: Coords; rocks: Set<string> } {
  let start: Coords | undefined = undefined, rocks: Set<string> = new Set();
  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      if (lines[y][x] === ".") continue;
      const coords = Coords.from(x, y);
      if (lines[y][x] === "S") {
        start = coords;
      } else if (lines[y][x] === "#") {
        rocks.add(coords.toString());
      }
    }
  }
  return { start, rocks } as { start: Coords; rocks: Set<string> };
}

await timedSolution(1, async () => {
  const DEBUG = false;
  const STEPS = DEBUG ? 6 : 64;
  const { start, rocks } = await loadFile(!DEBUG).then(splitLines).then(
    parse,
  ) as { start: Coords; rocks: Set<string> };

  const validateNeighbors = (coords: Coords) => {
    return !rocks.has(coords.toString());
  };

  const visitedAtStep: Array<{ step: number; coords: Coords }> = [];
  const visited = new Set<string>();
  const queue: { step: number; coords: Coords }[] = [{
    step: 0,
    coords: start,
  }];

  while (queue.length > 0) {
    const next = queue.shift()!;
    if (next.step > STEPS) break;

    if (visited.has(next.coords.toString())) continue;
    visited.add(next.coords.toString());
    if (next.step % 2 === 0) {
      visitedAtStep.push(next);
    }

    const neighbors = next.coords.validNeighbors((coords) =>
      validateNeighbors(coords) && !visited.has(coords.toString())
    );

    queue.push(...neighbors.map((coords) => ({ step: next.step + 1, coords })));
  }
  return visitedAtStep.length;
});

await timedSolution(2, async () => {
  const STEPS = 8;
  const { start, rocks } = await loadFile(false).then(splitLines).then(
    parse,
  ) as { start: Coords; rocks: Set<string> };

  const R = 130;
  const C = 130;

  const validateNeighbors = (coords: Coords) => {
    return !rocks.has(coords.clamp(C, R).toString());
  };

  const visitedAtStep: Array<{ step: number; coords: Coords }> = [];
  const visited = new Set<string>();
  const queue: { step: number; coords: Coords }[] = [{
    step: 0,
    coords: start,
  }];

  while (queue.length > 0) {
    const next = queue.shift()!;
    if (next.step > STEPS) break;

    if (visited.has(next.coords.toString())) continue;
    visited.add(next.coords.toString());
    if (STEPS % 2 === 0 && next.step % 2 === 0 || STEPS % 2 === 1) {
      visitedAtStep.push(next);
    }

    const neighbors = next.coords.validNeighbors((coords) =>
      validateNeighbors(coords) && !visited.has(coords.toString())
    );

    queue.push(...neighbors.map((coords) => ({ step: next.step + 1, coords })));
  }
  console.log(visitedAtStep);
  return visitedAtStep.length;
});
