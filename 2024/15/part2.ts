import { timedSolution } from "../../utils/utils.ts";

type Map = string[][];
type Coords = [number, number];

const MOVEMENTS = [">", "<", "^", "v"];
const DIRECTIONS: Coords[] = [
  [1, 0],
  [-1, 0],
  [0, -1],
  [0, 1],
];

await timedSolution(2, async () => {
  const {
    map: initalMap,
    movements,
    robot: robotStartLocation,
  } = await parseInput();
  let robot = robotStartLocation;
  let map = initalMap;
  for (let i = 0; i < movements.length; i++) {
    const result = move(map, robot, movements[i]);
    map = result.map;
    robot = result.robot;
  }
  return score(map);
});

function score(map: Map) {
  return map.reduce<number>((acc, line, y) => {
    return line.reduce<number>((accl, c, x) => {
      return c === "[" ? y * 100 + x + accl : accl;
    }, acc);
  }, 0);
}

function move(
  map: Map,
  robot: Coords,
  dir: Coords
): { map: Map; robot: Coords } {
  const next: Coords = step(robot, dir);

  if (isThereAWall(map, next)) return { map, robot };

  if (!isThereABox(map, next)) {
    return { map, robot: next };
  }

  const boxesToMove = getDependentBoxes(map, next, dir);

  if (boxesToMove.some((box) => box.isBlocked)) {
    return { map, robot };
  }

  for (let i = 0; i < boxesToMove.length; i++) {
    const {
      box: [[ax, ay], [bx, by]],
    } = boxesToMove[i];
    map[ay][ax] = ".";
    map[by][bx] = ".";
  }

  for (let i = 0; i < boxesToMove.length; i++) {
    const {
      box: [[ax, ay], [bx, by]],
    } = boxesToMove[i];
    map[ay + dir[1]][ax + dir[0]] = "[";
    map[by + dir[1]][bx + dir[0]] = "]";
  }
  return { map, robot: next };
}

function getBoxFromBoxPart(partCoords: Coords, map: Map): [Coords, Coords] {
  const partFound = map[partCoords[1]][partCoords[0]];
  return partFound === "["
    ? [partCoords, step(partCoords, [1, 0])]
    : [step(partCoords, [-1, 0]), partCoords];
}

type DependentBoxes = {
  box: [Coords, Coords];
  isBlocked: boolean;
}[];

function getDependentBoxes(
  map: Map,
  boxPart: Coords,
  dir: Coords
): DependentBoxes {
  const dirAxis: "horizontal" | "vertical" =
      dir[0] === 0 ? "vertical" : "horizontal",
    dirHuman: "up" | "down" | "left" | "right" =
      dirAxis === "vertical"
        ? dir[1] > 0
          ? "down"
          : "up"
        : dir[0] > 0
        ? "right"
        : "left";

  const box: [Coords, Coords] = getBoxFromBoxPart(boxPart, map);

  const nextCoords: Coords[] =
    dirHuman === "up" || dirHuman === "down"
      ? [step(box[0], dir), step(box[1], dir)]
      : dirHuman === "left"
      ? [step(box[0], dir)]
      : [step(box[1], dir)];

  const nextBoxes = nextCoords
    .filter((coords) => isThereABox(map, coords))
    .map((coords) => getDependentBoxes(map, coords, dir));

  const isBlocked =
    nextCoords.filter((coords) => isThereAWall(map, coords)).length > 0;

  return [{ box, isBlocked }, ...nextBoxes.flat()];
}

function step([x, y]: Coords, [dx, dy]: Coords): Coords {
  return [x + dx, y + dy];
}

function isThereAWall(map: Map, [x, y]: Coords) {
  return map[y][x] === "#";
}

function isThereABox(map: Map, [x, y]: Coords) {
  return map[y][x] === "[" || map[y][x] === "]";
}

function draw(map: Map, robot: Coords) {
  console.log(
    map
      .map((line, y) =>
        line
          .map((c, x) => (x === robot[0] && y === robot[1] ? "@" : c))
          .join("")
      )
      .join("\n")
  );
}

async function parseInput(
  input = "input"
): Promise<{ map: Map; movements: Coords[]; robot: Coords }> {
  const [map, movements] = await Deno.readTextFile(`./${input}.txt`).then(
    (data) => data.split("\n\n")
  );
  return {
    map: map.split("\n").map((line) =>
      line
        .split("")
        .map((c) =>
          c === "@"
            ? [".", "."]
            : c === "O"
            ? ["[", "]"]
            : c === "#"
            ? ["#", "#"]
            : [c, c]
        )
        .flat()
    ),
    movements: movements
      .split("")
      .filter((c) => MOVEMENTS.includes(c))
      .map((m) => DIRECTIONS[MOVEMENTS.indexOf(m)]),
    robot: map.split("\n").reduce<Coords>(
      (acc, line, y) => {
        if (acc[0] !== 0) return acc;
        let robot = acc;
        line.split("").forEach((char, x) => {
          if (char === "@") {
            robot = [x * 2, y];
          }
        });
        return robot;
      },
      [0, 0]
    ),
  };
}
