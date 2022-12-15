const input = await Deno.readTextFile("input.txt");
const lines = input.split("\r\n").filter(Boolean);
/*
const input = await Deno.readTextFile("test.txt");
const lines = input.split("\n").filter((line) => !!line);
*/

type Coord = [number, number];
type CoordLine = [Coord, Coord];

//const ROW = 2000000;
const ROW = 10;

const DISTRESS_MIN = 0;
const DISTRESS_MAX = 4000000;
//const DISTRESS_MAX = 20;

const DISTRESS_MIN_X = DISTRESS_MIN;
const DISTRESS_MAX_X = DISTRESS_MAX;
const DISTRESS_MIN_Y = DISTRESS_MIN;
const DISTRESS_MAX_Y = DISTRESS_MAX;

const getNums = (line: string) => {
  return line.match(/(\-?\d*)(\-?\d+)/gm)!.map((n) => parseInt(n));
};

const parseLine = (line: string) => {
  const all = getNums(line);
  return { sensor: [all[0], all[1]], beacon: [all[2], all[3]] };
};

const getDistance = (a: [number, number], b: [number, number]) => {
  const [x1, y1] = a;
  const [x2, y2] = b;
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

class MapObject {
  constructor(public char: string, public x: number, public y: number) {}
  draw() {
    return this.char;
  }
}
class Beacon extends MapObject {
  constructor(x: number, y: number) {
    super("B", x, y);
  }
}
class Sensor extends MapObject {
  constructor(x: number, y: number, public distance: number) {
    super("S", x, y);
  }
  *getCoverage(): Generator<[number, number] | null> {
    for (let x = -this.distance; x < this.distance; x++) {
      for (let y = -this.distance; y < this.distance; y++) {
        if (
          Math.abs(x + y) <= this.distance && Math.abs(x - y) <= this.distance
        ) {
          yield [x + this.x, y + this.y];
        }
      }
    }
  }
  getOutsideBorderLines(): CoordLine[] {
    const { x, y, distance } = this;
    const top: Coord = [x, y + distance + 1];
    const bottom: Coord = [x, y - distance - 1];
    const left: Coord = [x - distance - 1, y];
    const right: Coord = [x + distance + 1, y];
    return [
      truncateLine([top, right]),
      truncateLine([right, bottom]),
      truncateLine([bottom, left]),
      truncateLine([left, top]),
    ];
  }

  *getOutsideBorder(): Generator<[number, number]> {
    for (
      let x = Math.max(this.x + -this.distance - 1, DISTRESS_MIN_X);
      x < Math.min(this.x + this.distance + 1, DISTRESS_MAX_X);
      x++
    ) {
      for (
        let y = Math.max(this.y + -this.distance - 1, DISTRESS_MIN_Y);
        y < Math.min(this.y + this.distance + 1, DISTRESS_MAX_Y);
        y++
      ) {
        if (getDistance([x, y], [this.x, this.y]) === this.distance + 1) {
          yield [x, y];
        }
      }
    }
  }
}

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

class Grid {
  public grid: Map<string, MapObject> = new Map();

  public addSensorAndBeacon(
    sensor: [number, number],
    beacon: [number, number],
  ) {
    const S = new Sensor(sensor[0], sensor[1], getDistance(sensor, beacon));
    const B = new Beacon(beacon[0], beacon[1]);
    this.grid.set(sensor[0] + ":" + sensor[1], S);
    this.grid.set(beacon[0] + ":" + beacon[1], B);
  }

  public get sensors(): Sensor[] {
    return [...this.grid.values()].filter((obj) =>
      obj instanceof Sensor
    ) as Sensor[];
  }

  public get bounds(): [number, number, number, number] {
    return this.sensors.reduce((acc, sensor) => {
      const [minX, maxX, minY, maxY] = acc;
      return [
        Math.min(minX, sensor.x - sensor.distance),
        Math.max(maxX, sensor.x + sensor.distance),
        Math.min(minY, sensor.y - sensor.distance),
        Math.max(maxY, sensor.y + sensor.distance),
      ];
    }, [Infinity, -Infinity, Infinity, -Infinity]);
  }

  public draw() {
    const [minX, maxX, minY, maxY] = this.bounds;
    const grid = [];

    for (let y = minY; y <= maxY; y++) {
      const row = [];
      for (let x = minX; x <= maxX; x++) {
        row.push(this.grid.get(x + ":" + y)?.draw() || ".");
      }
      grid.push(row.join("") + " " + y);
    }
    return grid.join(" \r\n");
  }

  public getRowCoverage(y: number) {
    const [minX, maxX] = this.bounds;
    const sensors = [...this.grid.values()].filter(
      (obj) => obj instanceof Sensor,
    ) as Sensor[];
    sensors.sort((a, b) => Math.abs(y - a.y) - Math.abs(y - b.y));

    let covered = 0;
    for (let x = minX; x <= maxX; x++) {
      // check if there is a grid object (sensor or beacon) at this position
      if (this.grid.has(x + ":" + y)) {
        continue;
      }

      if (
        sensors.find((s) =>
          s.distance >= Math.abs(getDistance([x, y], [s.x, s.y]))
        )
      ) {
        covered++;
        continue;
      }
    }
    return covered;
  }
}

function sensorCovers(sensor: Sensor, x: number, y: number): number {
  const distance = getDistance([x, y], [sensor.x, sensor.y]);
  return sensor.distance - distance;
}

function isCovered(
  sensors: Sensor[],
  x: number,
  y: number,
  likelySensor?: Sensor,
): { sensor: Sensor; extra: number } | null {
  if (likelySensor) {
    const likely = sensorCovers(likelySensor, x, y);
    if (likely >= 0) return { sensor: likelySensor, extra: likely };
  }
  for (let i = 0; i < sensors.length; i++) {
    const sensor = sensors[i];
    if (sensor === likelySensor) continue;
    const extra = sensorCovers(sensor, x, y);
    if (extra >= 0) return { sensor, extra };
  }
  return null;
}

function* stepLine(line: CoordLine): Generator<Coord> {
  const [a, b] = line;
  let [ax, ay] = a;
  const [bx, by] = b;
  yield [ax, ay];
  const distance = getDistance(a, b);
  for (let i = 0; i <= distance - 1; i++) {
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

const find = (grid: Grid) => {
  const possibleSensors: Array<Sensor> = [];
  const sensors = grid.sensors;
  for (const sensor of sensors) {
    for (const compare of sensors) {
      if (sensor === compare) continue;
      const distance = Math.abs(
        getDistance([sensor.x, sensor.y], [
          compare.x,
          compare.y,
        ]) - sensor.distance - compare.distance,
      );
      if (distance === 2) {
        possibleSensors.push(sensor);
      }
    }
  }
  const candidates = new Set<Coord>();
  for (const sensor of possibleSensors) {
    for (const border of sensor.getOutsideBorderLines()) {
      for (const point of stepLine(border)) {
        candidates.add(point);
      }
    }
  }
  for (const candidate of candidates) {
    const [x, y] = candidate;
    if (!isCovered(grid.sensors, x, y)) {
      console.log("uncovered", x * 4000000 + y);
      break;
    }
  }
};

const part2 = () => {
  const grid = new Grid();
  for (const line of lines) {
    const { sensor, beacon } = parseLine(line);
    grid.addSensorAndBeacon(
      sensor as [number, number],
      beacon as [number, number],
    );
  }
  console.time("find");
  const result = find(grid);
  console.timeEnd("find");
};
part2();
