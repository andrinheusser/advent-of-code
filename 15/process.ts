const input = await Deno.readTextFile("input.txt");
const lines = input.split("\r\n").filter(Boolean);

/*
const input = await Deno.readTextFile("test.txt");
const lines = input.split("\n").filter((line) => !!line);
*/
type Coord = [number, number];
type CoordLine = [Coord, Coord];

const DISTRESS_MIN = 0;
const DISTRESS_MAX = 4000000;
//const DISTRESS_MAX = 20;

const DISTRESS_MIN_X = DISTRESS_MIN;
const DISTRESS_MAX_X = DISTRESS_MAX;
const DISTRESS_MIN_Y = DISTRESS_MIN;
const DISTRESS_MAX_Y = DISTRESS_MAX;

const distance = (a: Coord, b: Coord) =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

const truncateLine = (line: CoordLine): CoordLine => {
  const [a, b] = line;
  return [truncateLinePoint(b, a), truncateLinePoint(a, b)] as CoordLine;
};

const truncateLinePoint = (other: Coord, point: Coord) => {
  if (point[0] > DISTRESS_MAX_X) {
    const delta = point[0] - DISTRESS_MAX_X;
    return [DISTRESS_MAX_X, other[1] + delta];
  }
  if (point[0] < DISTRESS_MIN_X) {
    const delta = DISTRESS_MIN_X - point[0];
    return [DISTRESS_MIN_X, other[1] - delta];
  }
  if (point[1] > DISTRESS_MAX_Y) {
    const delta = point[1] - DISTRESS_MAX_Y;
    return [other[0] - delta, DISTRESS_MAX_Y];
  }
  if (point[1] < DISTRESS_MIN_Y) {
    const delta = DISTRESS_MIN_Y - point[1];
    return [other[0] + delta, DISTRESS_MIN_Y];
  }
  return point;
};

function* stepLine(line: CoordLine): Generator<Coord> {
  const [a, b] = line;
  let [ax, ay] = a;
  const [bx, by] = b;
  yield [ax, ay];
  const d = distance(a, b);
  for (let i = 0; i <= d - 1; i++) {
    const xDelta = Math.abs(bx - ax);
    const yDelta = Math.abs(by - ay);
    if (xDelta >= yDelta) {
      ax += bx > ax ? 1 : -1;
    } else if (xDelta < yDelta) {
      ay += by > ay ? 1 : -1;
    }
    if (
      ax < DISTRESS_MIN_X || ax > DISTRESS_MAX_X || ay < DISTRESS_MIN_Y ||
      ay > DISTRESS_MAX_Y
    ) continue;

    yield [ax, ay];
  }
}

const beacons = new Set<string>();

class Sensor {
  public range: number;
  constructor(public coord: Coord, public beacon: Coord) {
    this.range = distance(coord, beacon);
    beacons.add(beacon.join(","));
  }
  *getOutsideBorderLines(): Generator<CoordLine> {
    const { range } = this;
    const [x, y] = this.coord;
    const top: Coord = [x, y + range + 1];
    const right: Coord = [x + range + 1, y];
    yield truncateLine([top, right]);
    const bottom: Coord = [x, y - range - 1];
    yield truncateLine([right, bottom]);
    const left: Coord = [x - range - 1, y];
    yield truncateLine([bottom, left]);
    yield truncateLine([left, top]);
  }
  endX(x: number, y: number) {
    const yDelta = Math.abs(y - this.coord[1]);
    const xSteps = this.range - yDelta;
    const xMidway = this.coord[0] - x;
    return [this.coord[0] + xSteps, xMidway + xSteps];
  }
}

const parseToSensors = (lines: string[]): Sensor[] => {
  return lines.map((line) =>
    line.match(/(\-?\d*)(\-?\d+)/gm)!
      .map((n) => parseInt(n))
  )
    .map((m) => new Sensor([m[0], m[1]], [m[2], m[3]]));
};

const minX = (sensors: Sensor[]) =>
  Math.min(...sensors.map((s) => s.coord[0] - s.range));
const maxX = (sensors: Sensor[]) =>
  Math.max(...sensors.map((s) => s.coord[0] + s.range));

const distanceWithY = (x: number, b: Coord) =>
  Math.abs(x - b[0]) + Math.abs(2000000 - b[1]);

const part1 = () => {
  const y = 2000000;
  let sensors = [
    ...parseToSensors(lines)
      .filter((s) => Math.abs(s.coord[1] - y) <= s.range)
      .sort((a, b) => Math.abs(a.coord[1] - y) - Math.abs(b.coord[1] - y)),
  ];
  console.log(sensors.length + " sensors");
  let covered = -1;
  for (let x = minX(sensors); x <= maxX(sensors); x++) {
    const sensor = sensors.find((s) => s.range >= distanceWithY(x, s.coord));
    if (sensor) {
      sensors = sensors.filter((s) => s !== sensor);
      const [newx, addCovered] = sensor.endX(x, y);
      covered += addCovered + 1;
      x = newx;
    }
  }
  return covered;
};

const part2 = () => {
  const sensors = parseToSensors(lines);
  const neighbors = sensors.reduce((acc, s) => {
    for (const c of sensors) {
      if (s === c) continue;
      if (distance(s.coord, c.coord) - s.range - c.range === 2) {
        acc.add(s);
      }
    }
    return acc;
  }, new Set<Sensor>());
  for (const sensor of neighbors) {
    for (const border of sensor.getOutsideBorderLines()) {
      for (const point of stepLine(border)) {
        const [x, y] = point;
        const sensor = sensors.find((s) =>
          s.range >= distance([x, y], s.coord)
        );
        if (!sensor) {
          return x * 4000000 + y;
        }
      }
    }
  }
};

console.time("part1");
console.log(part1());
console.timeEnd("part1");
console.time("part2");
console.log(part2());
console.timeEnd("part2");
