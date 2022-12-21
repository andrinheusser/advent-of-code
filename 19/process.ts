const input = await Deno.readTextFile("input.txt");
const lines = input.split("\r\n").filter(Boolean);
/*
const input = await Deno.readTextFile("test.txt");
const lines = input.split("\n").filter((line) => !!line);
*/

type Ident = [number, number, number, number];
type Blueprint = [Ident, Ident, Ident, Ident];
type Inventory = [Ident, Ident];
type StepState = { time: number; inventory: Inventory; maxRobots: Ident };

const IdentIndex = {
  ore: 0,
  clay: 1,
  obsidian: 2,
  geode: 3,
};
const InventoryIndex = {
  resources: 0,
  robots: 1,
};

const triangle = (n: number): number => (n * (n + 1)) / 2;

const parseLineToBlueprint = (line: string): Blueprint => {
  const numbers = line.match(/\d+/g)?.map(Number) as number[];
  return [
    [numbers[1], 0, 0, 0],
    [numbers[2], 0, 0, 0],
    [numbers[3], numbers[4], 0, 0],
    [numbers[5], 0, numbers[6], 0],
  ];
};

const maxBots = (blueprint: Blueprint) =>
  Object.values(IdentIndex)
    .slice(0, 3)
    .map((index) =>
      blueprint
        .map((ident) => ident[index])
        .reduce((max, v) => (max < v ? v : max), 0)
    )
    .concat(Infinity);

const add = (a: Ident, b: Ident): Ident => a.map((v, i) => v + b[i]) as Ident;
const sub = (a: Ident, b: Ident): Ident => a.map((v, i) => v - b[i]) as Ident;

const harvest = ([resources, robots]: Inventory): Inventory => [
  add(resources, robots),
  robots,
];

const buy = (
  robot: number,
  [resources, robots]: Inventory,
  blueprint: Blueprint
): Inventory => [
  sub(resources, blueprint[robot]),
  add(
    robots,
    [...Array.from({ length: 4 }, () => 0)].map((_v, i) =>
      i === robot ? 1 : 0
    ) as Ident
  ),
];

const haveEnoughResources = (resources: Ident, costs: Ident): boolean =>
  sub(resources, costs).every((v) => v >= 0);

const haveEnoughResourcesForRobot = (
  robot: number,
  resources: Ident,
  blueprint: Blueprint
): boolean => haveEnoughResources(resources, blueprint[robot]);

const robotsWeCanBuy = (resources: Ident, blueprint: Blueprint) =>
  Object.values(IdentIndex).filter((robot) =>
    haveEnoughResourcesForRobot(robot, resources, blueprint)
  );

const nextState = (
  state: StepState,
  blueprint: Blueprint,
  nextTime: number,
  cache: Map<string, number[]>,
  ogMaxRobots: Ident
) => {
  const result: StepState[] = [];

  const { maxRobots } = state;

  const key = JSON.stringify(
    // exclude geode count from cache, we can not buy anything with it
    state.inventory[InventoryIndex.resources].slice(0, 3)
  );

  let robots: number[] = [];

  // get robots we might buy from cache or calculate from state
  if (cache.has(key)) {
    robots = cache.get(key)!;
  } else {
    robots = robotsWeCanBuy(
      state.inventory[InventoryIndex.resources],
      blueprint
    );
    cache.set(key, robots);
  }

  const potentialRobotsIncludeGeodes = robots.includes(IdentIndex.geode);

  const potentialBuys: number[] = [];

  robots.forEach((robot) => {
    // Do not buy robots that we don't have a use for anymore
    if (state.inventory[InventoryIndex.robots][robot] >= maxRobots[robot])
      return;
    // Do not buy robots which aren't a geode, if we can afford one
    if (robot !== IdentIndex.geode && potentialRobotsIncludeGeodes) return;

    // Keep track of what we could have bought, in case we don't buy anything
    potentialBuys.push(robot);

    result.push({
      time: nextTime,
      inventory: buy(robot, harvest(state.inventory), blueprint),
      maxRobots: ogMaxRobots,
    });
  });

  // Consider not buying anything, but only if we can't buy a geode
  if (!potentialRobotsIncludeGeodes) {
    // If we could have bought something, but didn't, we need to make sure to not build
    // this robot until we build another robot because it makes no sense not to buy early if possible
    const nextMaxRobots =
      potentialBuys.length > 0
        ? (maxRobots.map((v, robot) =>
            potentialBuys.includes(robot)
              ? state.inventory[InventoryIndex.robots][robot]
              : v
          ) as Ident)
        : maxRobots;

    result.push({
      time: nextTime,
      inventory: harvest(state.inventory),
      maxRobots: nextMaxRobots,
    });
  }

  return result;
};

const search = (blueprint: Blueprint, timeTotal: number) => {
  // Cache for robots we can buy from resources we have
  const cache = new Map<string, number[]>();
  // Maximum number of robots of each type we have a use for
  const maxRobots = maxBots(blueprint) as Ident;

  const startState: StepState = {
    time: 0,
    inventory: [
      [0, 0, 0, 0],
      [1, 0, 0, 0],
    ],
    maxRobots,
  };

  const stack: StepState[] = [startState];
  const scores: number[] = [0];

  // Capping resources because it doesn't matter but increases cache hits
  const oreCeil = maxRobots[IdentIndex.ore] * 1.7;
  const clayCeil = maxRobots[IdentIndex.clay] * 1.7;
  const obsidianCeil = maxRobots[IdentIndex.obsidian] * 1.7;
  const ceil = [oreCeil, clayCeil, obsidianCeil, Infinity];

  while (stack.length) {
    const state = stack.pop() as StepState;

    const geodes = state.inventory[0][IdentIndex.geode];

    // If we built a geode on every remaining turn...
    const bestCaseGeodes =
      geodes +
      state.inventory[InventoryIndex.robots][IdentIndex.geode] *
        (timeTotal - state.time) +
      triangle(timeTotal - state.time);

    // Prune branch, if we can't build enough geodes to beat the current max
    const currentMax = Math.max(...scores);
    if (bestCaseGeodes < currentMax) continue;

    // Cap resources
    state.inventory[InventoryIndex.resources] = state.inventory[
      InventoryIndex.resources
    ].map((v, i) => (v > ceil[i] ? ceil[i] : v)) as Ident;

    // If we have one minute left, no need to build anything
    if (state.time < timeTotal - 1) {
      stack.push(
        ...nextState(state, blueprint, state.time + 1, cache, maxRobots)
      );
    } else {
      const score =
        geodes + state.inventory[InventoryIndex.robots][IdentIndex.geode];
      if (score > Math.max(...scores)) {
        scores.push(score);
      }
    }
  }
  return Math.max(...scores);
};

const part1 = () => {
  const MINUTES = 24;
  return lines
    .map(parseLineToBlueprint)
    .reduce((a, bp, i) => a + search(bp, MINUTES) * (i + 1), 0);
};
const part2 = () => {
  const MINUTES = 32;
  return lines
    .map(parseLineToBlueprint)
    .slice(0, 3)
    .reduce((acc, bp) => acc * search(bp, MINUTES), 1);
};

console.time("Part I");
console.log(part1());
console.timeEnd("Part I");
console.time("Part II");
console.log(part2());
console.timeEnd("Part II");
