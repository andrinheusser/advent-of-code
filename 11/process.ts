import { writeAllSync } from "https://deno.land/std/streams/write_all.ts";

const input = await Deno.readTextFile("input.txt");
const lines = input.split("\r\n").filter((l) => !!l);
/*
const input = await Deno.readTextFile("test.txt");
const lines = input.split("\n").filter((l) => !!l);
*/

const WORRY_LEVEL_DECREASE_DIVISOR = 3;

type Monkey = {
  items: Array<number>;
  inspect: (old: number, divider: number) => number;
  getTarget: (value: number) => number;
  inspectedCount?: number;
  divisor: number;
};

class MonkeyManager {
  private modulo = 1;
  constructor(
    public monkeys: Monkey[],
    private round_count = 0,
  ) {}
  add(monkey: Monkey) {
    this.monkeys.push(monkey);
    this.modulo = this.monkeys.map((m) => m.divisor).reduce(
      (a, b) => a * b,
      1,
    );
  }
  round() {
    for (const monkey of this.monkeys) {
      this.takeTurn(monkey);
    }
    this.round_count++;
  }
  takeTurn(monkey: Monkey) {
    while (monkey.items.length > 0) {
      const item = monkey.items.shift();
      const worry_level = monkey.inspect(item!, 1) % this.modulo;
      monkey.inspectedCount
        ? monkey.inspectedCount++
        : monkey.inspectedCount = 1;
      const target = monkey.getTarget(worry_level);
      this.monkeys[target].items.push(worry_level);
    }
  }
  print() {
    console.log(`After round ${this.round_count}`);
    for (const [i, monkey] of this.monkeys.entries()) {
      console.log(`${i}: ${monkey.items.join(", ")}`);
      console.log(`Inspected ${monkey.inspectedCount} items`);
    }
    console.log("-------------------------------");
  }
  mostActiveMonkeys(n: number) {
    const sorted = [...this.monkeys].sort((a, b) => {
      return b.inspectedCount! - a.inspectedCount!;
    });
    return sorted.slice(0, n).map((m) => this.monkeys.indexOf(m));
  }
}

const monkeys = new MonkeyManager([]);

const cleanLine = (lineIndex: number, replace: string) =>
  lines[lineIndex].trim().replace(replace, "");

const getNums = (lI: number) => lines[lI].match(/\d+/g)!.map(Number);

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith("Monkey ")) {
    monkeys.add({
      items: getNums(i + 1),
      inspect: (old, divider) => {
        const worry_level = eval(cleanLine(i + 2, "Operation: new = "));
        return Math.floor(worry_level / divider);
      },
      getTarget: (value) => {
        if (value % (getNums(i + 3)[0]) === 0) {
          return getNums(i + 4)[0];
        }
        return getNums(i + 5)[0];
      },
      divisor: getNums(i + 3)[0],
    });
  }
}

for (let i = 0; i < 10000; i++) {
  monkeys.round();
}
console.log(monkeys.monkeys);
console.log(
  monkeys.mostActiveMonkeys(2).reduce((a, b) =>
    monkeys.monkeys[a].inspectedCount! * monkeys.monkeys[b].inspectedCount!
  ),
);
