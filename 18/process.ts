const input = await Deno.readTextFile("input.txt");
const lines = input.split("\r\n").filter(Boolean);
/*
const input = await Deno.readTextFile("test.txt");
const lines = input.split("\n").filter((line) => !!line);
*/

type Bounds = { x: number[]; y: number[]; z: number[] };
const parseXYZ = (line: string) => line.split(",").map(Number);

const getSurface = (total: number, arr: number[][]) => {
  return total - arr.reduce(
    (acc, curr, _i, arr) =>
      acc +
      arr.filter((other) =>
        Math.abs(curr[0] - other[0]) + Math.abs(curr[1] - other[1]) +
            Math.abs(curr[2] - other[2]) === 1
      ).length,
    0,
  );
};

const findSurfaces = (
  start: [number, number, number],
  arr: number[][][],
  bounds: Bounds,
) => {
  const [x, y, z] = start;
  const visited = new Set<string>();
  const queue = [[x, y, z]];

  let result = 0;

  while (queue.length) {
    const [cx, cy, cz] = queue.shift()!;

    const key = `${cx},${cy},${cz}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const cubes = getCubesAround(cx, cy, cz, arr);
    result += cubes.length;

    for (const [nx, ny, nz] of getAirAround(cx, cy, cz, arr, bounds)) {
      if (!visited.has(`${nx},${ny},${nz}`)) queue.push([nx, ny, nz]);
    }
  }
  return result;
};

function* getAirAround(
  x: number,
  y: number,
  z: number,
  arr: number[][][],
  bounds: Bounds,
): Generator<[number, number, number]> {
  for (const [nx, ny, nz] of getAdjecent(x, y, z)) {
    if (
      nx <= bounds.x[1] + 1 && nx >= bounds.x[0] - 1 && ny <= bounds.y[1] + 1 &&
      ny >= bounds.y[0] - 1 && nz <= bounds.z[1] + 1 && nz >= bounds.z[0] - 1
    ) {
      try {
        if (!arr[nx][ny][nz]) {
          yield [nx, ny, nz];
        }
      } catch (_e) {
        yield [nx, ny, nz];
      }
    }
  }
}

const getCubesAround = (
  x: number,
  y: number,
  z: number,
  arr: number[][][],
) => {
  const cubes = [];
  for (const [nx, ny, nz] of getAdjecent(x, y, z)) {
    try {
      if (arr[nx][ny][nz] === 1) {
        cubes.push([nx, ny, nz]);
      }
    } catch (_e) {
      continue;
    }
  }
  return cubes;
};

function* getAdjecent(
  x: number,
  y: number,
  z: number,
): Generator<[number, number, number]> {
  yield [x + 1, y, z];
  yield [x - 1, y, z];
  yield [x, y + 1, z];
  yield [x, y - 1, z];
  yield [x, y, z + 1];
  yield [x, y, z - 1];
}

const getBounds = (coords: number[][]): Bounds => {
  return {
    x: [
      Math.min(...coords.map((c) => c[0])),
      Math.max(...coords.map((c) => c[0])),
    ],
    y: [
      Math.min(...coords.map((c) => c[1])),
      Math.max(...coords.map((c) => c[1])),
    ],
    z: [
      Math.min(...coords.map((c) => c[2])),
      Math.max(...coords.map((c) => c[2])),
    ],
  };
};

const get3DArray = (coords: number[][], bounds: Bounds): number[][][] => {
  return coords.reduce<number[][][]>(
    (acc, curr) => {
      const [cx, cy, cz] = curr;
      acc[cx][cy][cz] = 1;
      return acc;
    },
    Array.from(
      { length: bounds.x[1] + 1 },
      () =>
        Array.from(
          { length: bounds.y[1] + 1 },
          () => Array.from({ length: bounds.z[1] + 1 }, () => 0),
        ),
    ),
  );
};

const part1 = () => {
  return getSurface(lines.length * 6, lines.map(parseXYZ));
};

const part2 = () => {
  const coords = lines.map(parseXYZ);
  const bounds = getBounds(coords);
  return findSurfaces([1, 1, 1], get3DArray(coords, bounds), bounds);
};

console.time("part1");
console.log(part1());
console.timeEnd("part1");
console.time("part2");
console.log(part2());
console.timeEnd("part2");
