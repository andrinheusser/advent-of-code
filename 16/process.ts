const input = await Deno.readTextFile("input.txt");
const lines = input.split("\r\n").filter(Boolean);

/*
const input = await Deno.readTextFile("test.txt");
const lines = input.split("\n").filter((line) => !!line);
*/

type Connection = {
  valve: Valve;
  distance: number;
};

type Valve = {
  name: string;
  rate: number;
  tunnels: string[];
  connections?: Connection[];
};
type Valves = Map<string, Valve>;

const MINUTES = 30;

const parseLine = (line: string) => {
  const [valveAndFlowRate, tunnels] = line.split("; ");
  const [sValve, sFlowRate] = valveAndFlowRate.split(" has flow rate=");
  const valve: string = sValve.replace("Valve ", "");
  const flowRate = parseInt(sFlowRate);
  const connections = tunnels
    .replace("tunnels lead to valves ", "")
    .replace("tunnel leads to valve ", "")
    .split(", ");
  return { valve, flowRate, connections };
};

const getValves = (lines: string[]) => {
  const valves: Map<string, Valve> = new Map();
  for (const line of lines) {
    const { valve, flowRate, connections } = parseLine(line);
    valves.set(valve, {
      name: valve,
      rate: flowRate,
      tunnels: connections,
    });
  }
  return valves;
};

const getDistance = (valves: Valves, a: Valve, b: Valve) => {
  const queue: [Valve, number][] = [[a, 0]];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const [valve, distance] = queue.shift()!;
    if (valve.name === b.name) {
      return distance;
    }
    for (const tunnel of valve.tunnels) {
      if (!visited.has(tunnel)) {
        queue.push([valves.get(tunnel)!, distance + 1]);
        visited.add(tunnel);
      }
    }
  }
  return -1;
};

const addConnections = (valves: Valves) => {
  const targets = [...valves.values()].filter((v) => v.rate > 0);
  for (const valve of valves.values()) {
    if (valve.rate === 0 && valve.name !== "AA") {
      continue;
    }
    valve.connections = targets
      .map((target) => {
        const distance = getDistance(valves, valve, target) + 1;
        const { connections, ...v } = target;
        return {
          valve: v,
          distance,
        };
      })
      .filter((c) => c.distance > 1);
  }
  return valves;
};

const getDistances = (valves: Valve[]) => {
  const distances: Map<string, number> = new Map();
  for (const valve of valves) {
    for (const connection of valve.connections!) {
      distances.set(valve.name + connection.valve.name, connection.distance);
    }
  }
  return distances;
};

type Distances = ReturnType<typeof getDistances>;
type State = {
  current: Valve;
  valves: Valve[];
  visited: Valve[];
  distances: Distances;
  score: number;
  time: {
    remaining: number;
    total: number;
  };
};

const pathScore = (
  visited: Valve[],
  totalTime: number,
  distances: Distances
) => {
  let score = 0;
  const rates: Array<number> = [];
  const toVisit = [...visited];
  let traveled = 0;
  let current = toVisit[traveled];
  traveled++;
  let next: Valve | undefined = toVisit[traveled];
  let travelTimeRemaining = distances.get(current.name + next!.name)!;
  for (let m = 0; m < totalTime; m++) {
    if (travelTimeRemaining > 0) travelTimeRemaining--;
    // RELEASE PRESSURE

    const produced = rates.reduce((a, b) => a + b, 0);
    score += produced;

    if (travelTimeRemaining === 0) {
      if (next && next.rate > 0) {
        rates.push(next.rate);
      }
      current = next!;
      traveled++;
      next = toVisit[traveled];
      if (next) {
        travelTimeRemaining = distances.get(current.name + next!.name)!;
      } else {
        travelTimeRemaining = 99999;
      }
    }
  }

  return score;
};

const step = (state: State) => {
  const { current, valves, visited, distances, score, time } = state;
  const { remaining, total } = time;
  const pathScores = [score];
  const subPaths = current.connections!.filter((v) => {
    if (visited.find((vs) => vs.name === v.valve.name)) return false;
    const distance = distances.get(current.name + v.valve.name)!;
    return (
      distance <= remaining && valves.find((vs) => vs.name === v.valve.name)
    );
  });
  for (const subPath of subPaths) {
    const timeRemainingAfterTravel =
      remaining - distances.get(current.name + subPath.valve.name)!;
    const nextVisited = [...visited, subPath.valve];
    const scoreUntilNow = pathScore(nextVisited, total, distances);
    const score = step({
      current: valves.find((v) => v.name === subPath.valve.name)!,
      valves,
      visited: nextVisited,
      distances,
      score: scoreUntilNow,
      time: {
        remaining: timeRemainingAfterTravel,
        total,
      },
    });
    pathScores.push(score);
  }
  return Math.max(...pathScores);
};

// PART 1
const part1 = () => {
  const valves = [...addConnections(getValves(lines)).values()].filter(
    (v) => v.connections?.length
  );
  const distances = getDistances(valves);

  console.log(
    step({
      current: valves[0],
      valves,
      visited: [valves[0]],
      distances,
      score: 0,
      time: { remaining: MINUTES, total: MINUTES },
    })
  );
};

// PART 2
const part2 = () => {
  const ASSIGNMENT_ROUNDS = 4000;
  const ASSIGNMENT_BALANCE_FACTOR = 6;

  const timeToLearn = 4;

  const valves: Array<Valve> = [
    ...addConnections(getValves(lines)).values(),
  ].filter((v) => v.connections?.length);

  const distances = getDistances(valves);

  const start = valves.shift();

  const randomInt = (x: number) => Math.floor(Math.random() * x * 2) - x;

  const assignments: { left: Valve[]; right: Valve[] }[] = [];
  for (let i = 0; i < ASSIGNMENT_ROUNDS; i++) {
    const left = valves
      .sort(() => Math.random() - 0.5)
      .slice(
        0,
        valves.length / 2 +
          randomInt(Math.floor(valves.length / ASSIGNMENT_BALANCE_FACTOR))
      );
    const right = valves.filter((v) => !left.find((l) => l.name === v.name));
    assignments.push({ left, right });
  }

  const scores: number[] = [];
  for (const { left, right } of assignments) {
    const leftWithStart = [start!, ...left];
    const leftScore = step({
      current: leftWithStart[0],
      valves: leftWithStart,
      visited: [leftWithStart[0]],
      distances: distances,
      score: 0,
      time: { remaining: MINUTES - timeToLearn, total: MINUTES - timeToLearn },
    });
    const rightWithStart = [start!, ...right];
    const rightScore = step({
      current: rightWithStart[0],
      valves: rightWithStart,
      visited: [rightWithStart[0]],
      distances: distances,
      score: 0,
      time: { remaining: MINUTES - timeToLearn, total: MINUTES - timeToLearn },
    });
    scores.push(leftScore + rightScore);
  }
  return Math.max(...scores);
};

console.time("part 1");
part1();
console.timeEnd("part 1");
console.time("part 2");
console.log(part2());
console.timeEnd("part 2");
