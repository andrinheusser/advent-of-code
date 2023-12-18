import { loadFile, splitLines, timedSolution } from "../utils.ts";

type Coords = [number, number];
type Instruction = {
  direction: string;
  distance: number;
};

function step(coords: Coords, direction: string, distance = 1): Coords {
  switch (direction) {
    case "U": {
      return [coords[0], coords[1] - distance];
    }
    case "R": {
      return [coords[0] + distance, coords[1]];
    }
    case "D": {
      return [coords[0], coords[1] + distance];
    }
    case "L": {
      return [coords[0] - distance, coords[1]];
    }
  }
  throw new Error("Invalid direction");
}

const dirAndDistPartI = (s: string) => {
  const [dirStr, distStr] = s.split(" ");
  return {
    direction: dirStr as "U" | "D" | "L" | "R",
    distance: +distStr,
  };
};

function dirAndDistPartII(line: string) {
  const [_a, _b, hexStr] = line.split(" ");
  const hex = hexStr.substring(2, hexStr.length - 1);
  const distance = parseInt(`0x${hex.substring(0, 5)}`);
  let direction = "";
  switch (hex[5]) {
    case "0":
      direction = "R";
      break;
    case "1":
      direction = "D";
      break;
    case "2":
      direction = "L";
      break;
    case "3":
      direction = "U";
      break;
  }

  return {
    direction,
    distance,
  };
}
function parse(fn: (s: string) => Instruction) {
  return (lines: string[]) => lines.map(fn);
}

function shoelace(coords: Coords[]) {
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const nextIndex = (i + 1) % coords.length;
    area += coords[i][0] * coords[nextIndex][1];
    area -= coords[i][1] * coords[nextIndex][0];
  }
  return Math.abs(area / 2);
}

function parseInstructions(instructions: Instruction[]) {
  return instructions.reduce<{ length: number; coords: Coords[] }>(
    (acc, instr) => {
      const { direction, distance } = instr;
      if (!acc.length) {
        acc.coords.push([0, 0]);
      }
      acc.length += distance;
      const prev = acc.coords[acc.coords.length - 1];
      const next = step(prev, direction, distance);
      acc.coords.push(next);
      return acc;
    },
    { length: 0, coords: [] },
  );
}

timedSolution(
  1,
  async () => {
    const { coords, length } = await loadFile(true).then(splitLines).then(
      parse(dirAndDistPartI),
    ).then(parseInstructions);

    return shoelace(coords) + length / 2 + 1;
  },
);
timedSolution(
  2,
  async () => {
    const { coords, length } = await loadFile(true).then(splitLines).then(
      parse(dirAndDistPartII),
    ).then(parseInstructions);

    return shoelace(coords) + length / 2 + 1;
  },
);
