import { timedSolution } from "../../utils/utils.ts";

type Coords = [number, number];
type Position = [
  location: Coords,
  direction: Coords,
  cost: number,
  path: Map<string, number>
];
type MyMap = string[][];
const DIRS: Coords[] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];
type Borders = Set<string>;

function isSame(a: Coords, b: Coords) {
  return a[0] === b[0] && a[1] === b[1];
}
function turn(dir: Coords, clockwise = true): Coords {
  const index =
    DIRS.findIndex((d) => d[0] === dir[0] && d[1] === dir[1]) +
    (clockwise ? 1 : -1);

  const clampedIndex = (index + DIRS.length) % DIRS.length;

  return DIRS[clampedIndex];
}
function serialize(c: Coords, dir?: Coords) {
  if (dir) {
    return `${c[0]},${c[1]},${dir[0]},${dir[1]}`;
  }
  return `${c[0]},${c[1]}`;
}

await timedSolution(1, async () => {
  const map = await parseMap("test");
  const borders = parseBorders(map);

  const start: Coords = [1, map.length - 2];
  const end: Coords = [map[0].length - 2, 1];

  try {
    return findSmallestCost(
      [start, [1, 0], 0, new Map().set(serialize(start), 0)],
      end,
      borders
    );
  } catch (e: unknown) {
    console.log(e);
  }
  draw({ start, end, borders, bounds: [map[0].length, map.length] });
  return 1;
});

function draw({
  start,
  end,
  borders,
  bounds,
}: {
  start: Coords;
  end: Coords;
  borders: Borders;
  bounds: Coords;
}) {
  const pathsTaken = borders
    .values()
    .filter((predicate) => !predicate.endsWith("#"))
    .toArray();
  console.log(pathsTaken);

  for (let y = 0; y < bounds[1]; y++) {
    let row = "";
    for (let x = 0; x < bounds[0]; x++) {
      if (isSame(start, [x, y])) {
        row += "S";
      } else if (isSame(end, [x, y])) {
        row += "E";
      } else if (borders.has(serialize([x, y]) + "#")) {
        row += "#";
      } else if (
        pathsTaken.find((predicate) => predicate.startsWith(serialize([x, y])))
      ) {
        row += "0";
      } else {
        row += ".";
      }
    }
    console.log(row);
  }
}

function step(coords: Coords, direction: Coords): Coords {
  return [coords[0] + direction[0], coords[1] + direction[1]];
}

function options(current: Position, borders: Set<string>): Position[] {
  const [coords, dir, cost, path] = current;
  const opts: Position[] = [
    [step(coords, dir), dir, cost + 1, path],
  ];

  const hasLeftWall = borders.has(serialize(step(coords, turn(dir, false))));
  const hasRightWall = borders.has(serialize(step(coords, turn(dir, true))));

  if (!hasRightWall) {
    opts.push([coords, turn(dir, true), cost + 1000, path]);
  }
  if (!hasLeftWall) {
    opts.push([coords, turn(dir, false), cost + 1000, path]);
  }
  return opts;
}

function maze(bounds: Coords, current: Position, borders: Set<string>) {
  console.log("Maze with cost", current[2]);
  const path = current[3].keys().toArray();
  for (let y = 0; y < bounds[1]; y++) {
    let line = "";
    for (let x = 0; x < bounds[0]; x++) {
      if (borders.has(serialize([x, y]))) {
        line += "#";
      } else if (current[0][0] === x && current[0][1] === y) {
        const dir = current[1];
        if (dir[0] === 0) {
          if (dir[1] === 1) {
            line += "v";
          } else {
            line += "^";
          }
        } else {
          if (dir[0] === 1) {
            line += ">";
          } else {
            line += "<";
          }
        }
      } else if (path.includes(serialize([x, y]))) {
        line += "-";
      } else {
        line += ".";
      }
    }
    console.log(line);
  }
}

function findSmallestCost(position: Position, end: Coords, borders: Borders) {
  const queue = [position];
  let smallestCost = Infinity;

  const maxY = position[0][1] + 2;
  const maxX = end[0] + 2;

  while (queue.length) {
    const current = queue.shift()!;
    if (isSame(current[0], end)) {
      maze([maxX, maxY], current, borders);
      smallestCost = Math.min(smallestCost, current[2]);
    }

    const opts = options(current, borders);

    for (let i = 0; i < opts.length; i++) {
      const option = opts[i];
      const [coords, dir, cost, path] = option;

      const visited = path.get(serialize(coords));

      console.log({ i, coords, dir, cost, visited });

      if (visited && !(visited - 1000 === cost)) continue;

      if (borders.has(serialize(coords))) continue;

      path.set(serialize(coords), cost);

      queue.push([coords, dir, cost, path]);
    }
  }
  return smallestCost;
}

function parseMap(fileName = "input"): Promise<MyMap> {
  return Deno.readTextFile(`${fileName}.txt`).then((data) => {
    return data.split("\n").map((row) => row.split(""));
  });
}

function parseBorders(map: MyMap): Borders {
  const borders = new Set<string>();
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === "#") {
        borders.add(serialize([x, y]));
      }
    }
  }
  return borders;
}
