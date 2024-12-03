import { asyncReduce, char, timedSolution } from "../../utils/utils.ts";

const N = Symbol("any-number");
type N = typeof N;

class Instruction {
  private cursor = 0;
  private args: { count: number; values: number[]; current: string } = {
    count: 0,
    values: [],
    current: "",
  };
  constructor(
    private instr: (string | N)[],
    private op: (...args: number[]) => number
  ) {
    this.args.count = instr.filter((i) => i === N).length;
  }

  reset() {
    this.cursor = 0;
    this.args.current = "";
    this.args.values = [];
  }

  peek(n = 1): string | N {
    return this.instr[this.cursor + n];
  }

  ingest(c: string): { done: true; value: number } | { done: false } {
    const expected = this.instr[this.cursor];

    if (typeof expected === "string") {
      if (c === expected) {
        this.cursor++;
        if (this.cursor === this.instr.length) {
          return {
            done: true,
            value: this.op(...this.args.values),
          };
        }
      } else {
        this.reset();
      }
    } else {
      if (!Number.isNaN(+c)) {
        this.args.current += c;
      } else if (
        c === "," &&
        this.args.count > 0 &&
        this.args.values.length < this.args.count
      ) {
        this.args.values.push(+this.args.current);
        this.args.current = "";
      } else if (
        c === ")" &&
        ((this.args.count - 1 === this.args.values.length &&
          this.args.current.length > 0) ||
          (this.args.count === 0 && this.args.values.length === 0))
      ) {
        this.args.values.push(+this.args.current);
        const value = this.op(...this.args.values);
        this.reset();
        return { done: true, value };
      } else {
        this.reset();
      }
    }
    return { done: false };
  }
}

await timedSolution(2, () => {
  const instrMult = new Instruction(
      ["m", "u", "l", "(", N, ",", N, ")"],
      (a, b) => a * b
    ),
    instrDo = new Instruction(["d", "o", "(", ")"], () => 1),
    instrDont = new Instruction(["d", "o", "n", "'", "t", "(", ")"], () => 0);

  return asyncReduce(
    char(),
    (acc, c) => {
      const multResult = instrMult.ingest(c);
      return {
        doActive:
          instrDo.ingest(c).done || (acc.doActive && !instrDont.ingest(c).done),
        sum:
          multResult.done && acc.doActive
            ? acc.sum + multResult.value
            : acc.sum,
      };
    },
    { sum: 0, doActive: true }
  ).then((result) => result.sum);
});

await timedSolution(1, () => {
  const m = new Instruction(
    ["m", "u", "l", "(", N, ",", N, ")"],
    (a, b) => a * b
  );
  return asyncReduce(
    char(),
    (sum, c) => {
      const result = m.ingest(c);
      return result.done ? sum + result.value : sum;
    },
    0
  );
});
