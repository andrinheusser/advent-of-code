import { loadFile, timedSolution } from "../../utils/utils.ts";

type Coord = [x: number, y: number];
type Galaxies = Array<Coord>;

const shiftGalaxy = (galaxy: Coord, shift: Coord): Coord => [
  galaxy[0] + shift[0],
  galaxy[1] + shift[1],
];

const shiftAfter = (
  galaxies: Galaxies,
  shift: Coord,
  afterX: number | undefined,
  afterY: number | undefined,
) =>
  galaxies.map((galaxy) => {
    if (
      afterX && galaxy[0] > afterX || afterY && galaxy[1] > afterY
    ) return shiftGalaxy(galaxy, shift);
    return galaxy;
  });

function getDistance(galaxy1: Coord, galaxy2: Coord): number {
  return Math.abs(galaxy1[0] - galaxy2[0]) +
    Math.abs(galaxy1[1] - galaxy2[1]);
}

function expandUniverse(galaxies: Galaxies, shiftBy: number): Galaxies {
  const yValues = galaxies.map((g) => g[1]),
    xValues = galaxies.map((g) => g[0]),
    maxY = Math.max(...yValues),
    maxX = Math.max(...xValues);
  let xShifts = 0, yShifts = 0;
  for (let c = 0; c < Math.max(maxY, maxX); c++) {
    if (c < maxX && !xValues.includes(c)) {
      galaxies = shiftAfter(
        galaxies,
        [shiftBy, 0],
        c + xShifts * shiftBy,
        undefined,
      );
      xShifts++;
    }
    if (c < maxY && !yValues.includes(c)) {
      galaxies = shiftAfter(
        galaxies,
        [0, shiftBy],
        undefined,
        c + yShifts * shiftBy,
      );
      yShifts++;
    }
  }
  return galaxies;
}

const galaxyIdentifier = (galaxy: Coord) => {
  return `x${galaxy[0]}y${galaxy[1]}`;
};

function parseGalaxies(file: string) : Galaxies {
  const galaxies: Galaxies = [];
  let lineLength = 0;
  let y = 0;
  let x = 0;
  while (file.length > (lineLength * y) + x) {
    const char = file[(lineLength * y) + x];
    if (char === "\n") {
      if (!lineLength) lineLength = x + 1;
      y++;
      x = 0;
      continue;
    } else if (char === "#") {
      galaxies.push([x, y]);
    }
    x++;
  }
  return galaxies;
}

function getDistanceBetweenPairs(galaxies: Galaxies) {
  const galaxyPairs: Map<string, number> = new Map();
  for (const originGalaxy of galaxies) {
    for (const targetGalaxy of galaxies) {
      if (originGalaxy === targetGalaxy) continue;
      const key = [
        galaxyIdentifier(originGalaxy),
        galaxyIdentifier(targetGalaxy),
      ].sort().join("");
      if (!galaxyPairs.has(key)) {
        galaxyPairs.set(key, getDistance(originGalaxy, targetGalaxy));
      }
    }
  }
  return [...galaxyPairs.values()].reduce((a, b) => a + b, 0);
}

await timedSolution(1, async () => {
  const galaxies = await loadFile(true).then(parseGalaxies);
  return getDistanceBetweenPairs(expandUniverse(galaxies, 2 - 1));
});
await timedSolution(2, async () => {
  const galaxies = await loadFile(true).then(parseGalaxies);
  return getDistanceBetweenPairs(expandUniverse(galaxies, 1000000 - 1));
});
