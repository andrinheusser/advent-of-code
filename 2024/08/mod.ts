import { lines, timedSolution } from "../../utils/utils.ts";

type Coords = [x: number, y: number];

await timedSolution(1, async () => {
  const { antennas, bounds } = await getGrid();

  const antinodes = new Set<string>();
  for (const [_antenna, locations] of antennas) {
    for (const location of locations) {
      for (const other of locations) {
        const antinode = locateAntinode(location, other, bounds);
        if (antinode) antinodes.add(`${antinode[0]},${antinode[1]}`);
      }
    }
  }
  return antinodes.size;
});

await timedSolution(2, async () => {
  const { antennas, bounds } = await getGrid();
  const antinodes: Set<string> = new Set();

  for (const [_antenna, locations] of antennas) {
    resonantAntinodes(locations, bounds)
      .map(([x, y]) => `${x},${y}`)
      .forEach((s) => antinodes.add(s));
  }

  return antinodes.size;
});

function resonantAntinodes(antennas: Coords[], bounds: Coords): Coords[] {
  const antinodes: Coords[] = [];

  for (const location of antennas) {
    antinodes.push(location);
    for (const other of antennas) {
      const resonant = locateResonantAntinodes(location, other, bounds);
      antinodes.push(...resonant);
    }
  }
  return antinodes;
}

async function getGrid(fileName = "input.txt"): Promise<{
  antennas: Map<string, Coords[]>;
  bounds: Coords;
}> {
  const antennas: Map<string, Coords[]> = new Map(),
    bounds = { x: 0, y: 0 };

  let y = 0;
  for await (const line of lines(fileName)) {
    let x = 0;
    for (const location of line.split("")) {
      if (location !== ".") {
        if (!antennas.has(location)) {
          antennas.set(location, []);
        }
        antennas.get(location)!.push([x, y]);
      }
      x++;
      bounds.x = x;
    }
    y++;
  }
  bounds.y = y;

  return { antennas, bounds: [bounds.x, bounds.y] };
}

function locateAntinode(
  origin: Coords,
  other: Coords,
  bounds: Coords
): Coords | null {
  if (origin[0] === other[0] && origin[1] === other[1]) {
    return null;
  }
  const location: Coords = [
    origin[0] + (other[0] - origin[0]) * -1,
    origin[1] + (other[1] - origin[1]) * -1,
  ];
  if (!isInBounds(location, bounds)) {
    return null;
  }
  return location;
}

function locateResonantAntinodes(
  origin: Coords,
  other: Coords,
  bounds: Coords
): Coords[] {
  if (origin[0] === other[0] && origin[1] === other[1]) {
    return [];
  }
  const delta = [other[0] - origin[0], other[1] - origin[1]],
    antinodes: Coords[] = [];

  for (let i = 0; i < Infinity; i++) {
    const next: Coords = [origin[0] + delta[0] * i, origin[1] + delta[1] * i];
    if (isInBounds(next, bounds)) {
      antinodes.push(next);
    } else {
      return antinodes;
    }
  }
  throw new Error("Unreachable");
}

function isInBounds(location: Coords, bounds: Coords): boolean {
  return (
    location[0] >= 0 &&
    location[0] < bounds[0] &&
    location[1] >= 0 &&
    location[1] < bounds[1]
  );
}
