const input = Deno.readTextFileSync("./input.txt");
const instructions = input.split("\r\n").filter((l) => !!l);
const stackInput = await Deno.readTextFile("./stacks.txt");
const stackLines = stackInput.split("\n").filter(Boolean).slice(1).reverse();

class Stack {
  constructor(public crates: string[]) {}
  take(count: number) {
    return this.crates.splice(this.crates.length - count, count);
  }
  peek() {
    return this.crates[this.crates.length - 1];
  }
  add(crates: string[]) {
    this.crates.push(...crates.filter((c) => c !== " "));
  }
}

function* crateFromStackInput(lines: string[]) {
  for (const line of lines) {
    let stackIndex = -1;
    for (let i = 1; i < line.length; i += 4) {
      yield [++stackIndex, line[i]];
    }
  }
}

function* commands(instructions: string[]) {
  for (const instruction of instructions) {
    const [_, count, from, to] =
      instruction.match(/move (\d+) from (\d+) to (\d+)/) ?? [];
    yield {
      count: parseInt(count),
      from: parseInt(from),
      to: parseInt(to),
    };
  }
}

function getStacks(stackLines: string[]): Array<Stack> {
  const stacks: Array<Stack> = [];
  for (const [stackIndex, crate] of crateFromStackInput(
    stackLines
  ) as Generator<[number, string]>) {
    if (!stacks[stackIndex]) {
      stacks[stackIndex] = new Stack([crate]);
    } else {
      stacks[stackIndex].add([crate]);
    }
  }
  return stacks;
}

export const part1 = () => {
  const stacks = getStacks(stackLines);
  for (const { count, from, to } of commands(instructions)) {
    for (let i = 0; i < count; i++) {
      stacks[to - 1].add(stacks[from - 1].take(1));
    }
  }
  return stacks.map((s) => s.peek()).join("");
};

export const part2 = () => {
  const stacks = getStacks(stackLines);
  for (const { count, from, to } of commands(instructions)) {
    stacks[to - 1].add(stacks[from - 1].take(count));
  }
  return stacks.map((s) => s.peek()).join("");
};

console.log("part 1: " + part1());
console.log("part 2: " + part2());
